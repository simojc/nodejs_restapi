// Ce fichier doit contenir toutes les routes relatives à "Personne"const router = express.Router()

const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')

const app = express()
//app.use(bodyParser.json())
app.use(expressValidator())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')
//
// router.post('/pers/create', createPers,);
// router.post('/authenticate', authenticate);


router.get("/pers", (req, res) => {
    var queryString

    if (!req.query.type) {
        requestedPersType = 1
    }
    else {
        var requestedPersType = req.query.type
    }

    if (!req.query.email) {
        requestedPersEmail = 1
    }
    else {
        var requestedPersEmail = req.query.email
    }

    if (!req.query.groupe) {
        requestedPersGroupe = 1
    }
    else {
        var requestedPersGroupe = req.query.groupe
    }

    if ((requestedPersType == 1) && (requestedPersEmail == 1)) {
        queryString = "SELECT * FROM pers ORDER BY nom";
        pool.query(queryString, (err, rows, fields) => {
            if (err) {
                console.log("Failled to query for Pers: " + err)
                res.sendStatus(500)
                res.end
                //throw err
                return
            }
            // console.log("Interrogation de base des données réussie de Pers cas 1")
    
            res.json(rows)
        })
    }
    else if ((requestedPersType == 1) && (requestedPersEmail != 1)) {
        queryString = "SELECT * FROM pers WHERE pers.email = ? ";
        pool.query(queryString, [requestedPersEmail], (err, rows, fields) => {
            if (err) {
                console.log("Failled to query for Pers: " + err)
                res.sendStatus(500)
                res.end
                //throw err
                return
            }
            // console.log("Interrogation de base des données réussie de Pers cas 2")
    
            res.json(rows)
        })
    }
    else {
        queryString = `SELECT
                pers.*, CONCAT(pers.nom , ' ', pers.prenom) nom_pers,
                CONCAT(pers.address , ' ',	pers.city) location
                FROM pers
                WHERE UPPER(substr(pers.type,1,1)) = ? 
                and pers.groupe_id = ? 
                ORDER BY nom_pers
                `;
                pool.query(queryString, [requestedPersType,requestedPersGroupe], (err, rows, fields) => {
                    if (err) {
                        console.log("Failled to query for Pers: " + err)
                        res.sendStatus(500)
                        res.end
                        //throw err
                        return
                    }
                   // console.log("Interrogation de base des données réussie de Pers cas 3")
            
                    res.json(rows)
                })
    }
})


router.get('/pers/:id', (req, res) => {
    console.log("Fecthing pers with id: " + req.params.id)
    const Id = req.params.id
    const queryString = "SELECT * FROM pers WHERE id = ?"
    pool.query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for pers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        // console.log("Interrogation de base des données réussie pers avec Id")
        res.json(rows)
    })
})

const { check, validationResult } = require('express-validator/check');
router.post('/pers', [
  // username must be an email
  //check('username').isEmail(),
  // password must be at least 5 chars long
  //check('password').isLength({ min: 5 }),
  check('type', 'le type est obligatoire ').exists(),
                    check('nom', 'le nom est obligatoire ').exists(),
                    check('prenom', 'le prenom est obligatoire ').exists(),
                    check('sexe', 'le sexe est obligatoire ').exists(),
                    check('email', 'le courriel est obligatoire ').exists().isEmail(),
                    check('telcel', 'le teléphone cellulaire est obligatoire ').optional(),
                    check('address', 'l addresse est obligatoire ').exists(),
                    check('type', 'le type de personne est obligatoire ').exists(),
                    //check('country', 'le pays est obligatoire ').exists(),
                    check('groupe_id', 'le groupe est obligatoire ').exists(),
], (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
console.log('req.body = ' + JSON.stringify(req.body));
    const type = req.body.type
    const nom = req.body.nom
    const prenom = req.body.prenom
    let sexe = req.body.sexe
    const email = req.body.email
    const telcel = req.body.telcel
    const telres = req.body.telres
    const address = req.body.address
    const city = req.body.city 
    const country = req.body.country
    const emploi = req.body.emploi
    const dom_activ = req.body.dom_activ
    const titre_adh = req.body.titre_adh
    const groupe_id = req.body.groupe_id
    const dateDuJour = new Date()
    
    pool.query("SELECT id FROM pers WHERE pers.email = ?  ", [email], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for Pers: " + err)
            res.sendStatus(500)
            res.end
            // throw err
            return res.status(500).json({ errors: err})
        }
        if (rows.length > 0) {
            //if (await(personne)) {  //  si la fnction est déplacer dans un autre fichier serice, la rendre Asynch
               // throw 'Une personne avec le courriel ' + email + ' existe déjà';
                return res.status(400).json({ errors: 'Une personne avec le courriel ' + email + ' existe déjà'})
            }
            const queryString = `INSERT INTO pers(type,nom,prenom,sexe,email,telcel,
                                    telres,address,city,country,emploi,dom_activ,
                                    titre_adh, groupe_id,created_at,updated_at) 
                                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
            try {
                //var result = await pool.query(queryString,...  // cas Asynchrone
                var result =  pool.query(queryString, [type, nom, prenom, sexe, email, telcel,
                    telres, address, city, country, emploi, dom_activ,
                    titre_adh, groupe_id, dateDuJour, dateDuJour]);
                    res.end;
            } catch (err) {
                throw new Error(err);
            }
           // console.log("Insertion nouvelle personne avec l'id: " + result.insertId);
            res.end;
    })
});

router.put('/pers/:id', [
  // username must be an email
  //check('username').isEmail(),
  // password must be at least 5 chars long
  //check('password').isLength({ min: 5 }),
                    check('id', 'le id est obligatoire ').exists(),
                    check('type', 'le type est obligatoire ').exists(),
                    check('nom', 'le nom est obligatoire ').exists(),
                    check('prenom', 'le prenom est obligatoire ').exists(),
                    check('sexe', 'le sexe est obligatoire ').exists(),
                    check('email', 'le courriel est obligatoire ').exists().isEmail(),
                    check('telcel', 'le teléphone cellulaire est obligatoire ').optional(),
                    check('address', 'l addresse est obligatoire ').exists(),
                    check('type', 'le type de personne est obligatoire ').exists(),
                    //check('country', 'le pays est obligatoire ').exists(),
                   // check('groupe_id', 'le groupe est obligatoire ').exists(),
], (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
    // console.log('req.body = ' + JSON.stringify(req.body));
    // const id = req.body.id
    const type = req.body.type
    const nom = req.body.nom
    const prenom = req.body.prenom
    let sexe = req.body.sexe
    const email = req.body.email
    const telcel = req.body.telcel
    const telres = req.body.telres
    const address = req.body.address
    const city = req.body.city 
    const country = req.body.country
    const emploi = req.body.emploi
    const dom_activ = req.body.dom_activ
    const titre_adh = req.body.titre_adh
    const groupe_id = req.body.groupe_id
    const dateDuJour = new Date()

    const Id = req.params.id
    
            const queryString = `UPDATE pers SET type = ?,nom = ?,prenom = ?,sexe = ?,email = ?,
            telcel = ?, telres = ?,address = ?,city = ?,country = ?,emploi = ?,dom_activ = ?,
                                    titre_adh = ?, created_at = ?,updated_at = ? 
                                    WHERE id = ?`;
            try {
                //var result = await pool.query(queryString,...  // cas Asynchrone
                var result =  pool.query(queryString, [type, nom, prenom, sexe, email, telcel,
                    telres, address, city, country, emploi, dom_activ,
                    titre_adh, dateDuJour, dateDuJour, Id]);
                    res.end;
            } catch (err) {
                throw new Error(err);
            }
            console.log("MAJ  personne avec SUCCÈS " );
            res.end;
    })

module.exports = router

