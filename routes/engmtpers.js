// Ce fichier doit contenir toutes les routes relatives à "user"const router = express.Router()

const express = require('express')
const router = express.Router()

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')

router.get('/engmtpers/:id', (req, res) => {
    // console.log("Fecthing engmtpers with id: " + req.params.id)
    const Id = req.params.id
   
    if (!req.query.groupe) {
        console.log("Requête échouée, le groupe doit être renseigné")
        res.sendStatus(500)
        res.end
        //throw err
        return
    }
    const GpeId = req.query.groupe;

    const queryString = `SELECT engmtpers.*,
                            engmts.groupe_id,
                            engmts.nom as nom_engmt,
                            engmts.descr,
                            engmts.periodicite,
                            engmts.periode,
                            engmts.statut as stat_engmt,
                            engmts.mont_unit,
                            engmtpers.mont ,
                            engmts.dt_ech,
                            CONCAT(pers.nom , ' ', pers.prenom) nom_prenom
                        FROM	engmtpers
                        LEFT JOIN engmts ON engmtpers.engmt_id = engmts.id
                        LEFT JOIN pers  ON engmtpers.pers_id = pers.id
                        WHERE engmtpers.pers_id = ? AND engmts.groupe_id = ?
                        `;
    pool.query(queryString, [Id, GpeId], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for engmtpers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        // console.log("Interrogation de base des données réussie engmtpers")
        res.json(rows)
    })
})



router.get('/persengmt/:id', (req, res) => {
    // console.log("Fecthing engmtpers with id: " + req.params.id)
    const IdEngmt = req.params.id
   
    if (!req.query.groupe) {
        console.log("Requête échouée, le groupe doit être renseigné")
        res.sendStatus(500)
        res.end
        //throw err
        return
    }
    const GpeId = req.query.groupe;

    const queryString = `SELECT engmtpers.*,
                            engmts.groupe_id,
                            engmts.nom as nom_engmt,
                            engmts.descr,
                            engmts.periodicite,
                            engmts.periode,
                            engmts.statut as stat_engmt,
                            engmts.mont_unit,
                            engmtpers.mont ,
                            engmts.dt_ech,
                            CONCAT(pers.nom , ' ', pers.prenom) nom_prenom
                        FROM	engmtpers
                        LEFT JOIN engmts ON engmtpers.engmt_id = engmts.id
                        LEFT JOIN pers  ON engmtpers.pers_id = pers.id
                        WHERE engmtpers.engmt_id = ? AND engmts.groupe_id = ?
                        `;
    pool.query(queryString, [IdEngmt, GpeId], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for engmtpers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        // console.log("Interrogation de base des données réussie engmtpers")
        res.json(rows)
    })
})

router.get('/engmtpers', (req, res) => {
   // console.log("Fecthing engmtpers with id: " + req.params.id)
   // const Id = req.params.id
    if (!req.query.groupe) {
        console.log("Requête échouée, le groupe doit être renseigné")
        res.sendStatus(500)
        res.end
        //throw err
        return
    }
const GpeId = req.query.groupe;
    const queryString = `SELECT 	engmtpers.*,
                            engmts.groupe_id,
                            engmts.nom as nom_engmt,
                            engmts.descr,
                            engmts.periodicite,
                            engmts.periode,
                            engmts.statut as stat_engmt,
                            engmts.mont_unit,
                            engmtpers.mont ,
                            engmts.dt_ech,
                            CONCAT(pers.nom , ' ', pers.prenom) nom_prenom
                        FROM	engmtpers
                        LEFT JOIN engmts ON engmtpers.engmt_id = engmts.id
                        LEFT JOIN pers  ON engmtpers.pers_id = pers.id 
                        WHERE engmts.groupe_id = ?
                        `;
    pool.query(queryString,[GpeId], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for engmtpers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        // console.log("Interrogation de base des données réussie engmtpers" + JSON.stringify(rows))
        res.json(rows)
    })
})


router.get('/uneligneengmtpers/:id', (req, res) => {
    // console.log("Fecthing engmtpers with id: " + req.params.id)
    // Retourne une ligne de la table tontpers
    const Id = req.params.id
    const queryString = "SELECT * FROM engmtpers WHERE id = ?"
    pool.query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for engmtpers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
     //   console.log("Interrogation de base des données réussie rpnpers")
        res.json(rows)
    })
})

router.get("/engmts", (req, res) => {
    const queryString = "SELECT * from engmts "
    pool.query(queryString, (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for engmts: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
        // console.log("Interrogation de base des données engmts réussie")
       res.json(rows)
    })
})

const { check, validationResult } = require('express-validator/check');

router.post('/engmtpers', [
                    check('pers_id', 'la personne est obligatoire ').exists(),
                    check('engmt_id', 'l engagement est obligatoire ').exists(),
                    check('exercice', 'l exercice est obligatoire').exists(),                   
                    check('mont', 'le montant est obligatoire ').exists(),
                    check('dtchgst', 'la date statut est obligatoire ').exists(),
                    check('statut', 'le statut est obligatoire ').exists(),
                    ], (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
// console.log('req.body = ' + JSON.stringify(req.body));
    const engmt_id = req.body.engmt_id;
    const pers_id = req.body.pers_id;
    const exercice = req.body.exercice;
    const mont = req.body.mont;
    const statut = req.body.statut;
    const dtchgst = req.body.dtchgst;
    const message = req.body.message;
    const dateDuJour = new Date();

    pool.query("SELECT id FROM engmtpers WHERE  engmt_id = ?  AND pers_id = ? AND exercice = ? ", [engmt_id, pers_id, exercice], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for engmtpers: " + err)
            res.sendStatus(500)
            res.end
            // throw err
            return res.status(500).json({ errors: err})
        }        

        if (rows.length > 0) {
            //if (await(personne)) {  //  si la fnction est déplacer dans un autre fichier serice, la rendre Asynch
               // throw 'Une personne avec le courriel ' + email + ' existe déjà';
                return res.status(400).json({ errors: 'il existe deja une personne avec cet engagement pour cet exercice' })
            }
            const queryString = `INSERT INTO engmtpers(engmt_id,pers_id,exercice,mont,statut,dtchgst,message, created_at,updated_at) 
                                VALUES(?,?,?,?,?,?,?,?,?)`;
            try {
                //var result = await pool.query(queryString,...  // cas Asynchrone
                var result =  pool.query(queryString, [engmt_id,pers_id,exercice,mont,statut,dtchgst,message, dateDuJour, dateDuJour]);
                    res.end;
            } catch (err) {
                throw new Error(err);
            }
            // console.log("Insertion nouvelle tontpers avec l'id: " + result.insertId);
            res.end;
    })
});


router.put('/engmtpers/:id', [
    check('pers_id', 'la personne est obligatoire ').exists(),
    check('engmt_id', 'l engagement est obligatoire ').exists(),
    check('exercice', 'l exercice est obligatoire').exists(),                   
    check('mont', 'le montant est obligatoire ').exists(),
    check('dtchgst', 'la date statut est obligatoire ').exists(),
    check('statut', 'le statut est obligatoire ').exists(),
    ], (req, res, next) => {
// Finds the validation errors in this request and wraps them in an object with handy functions
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(422).json({ errors: errors.array() });
}
// console.log('req.body = ' + JSON.stringify(req.body));

const engmt_id = req.body.engmt_id;
const pers_id = req.body.pers_id;
const exercice = req.body.exercice;
const mont = req.body.mont;
const statut = req.body.statut;
const dtchgst = req.body.dtchgst;
const message = req.body.message;
const dateDuJour = new Date();

const Id = req.params.id
      
              const queryString = `UPDATE engmtpers SET mont = ?,statut = ?,dtchgst = ?, message = ?,updated_at = ? 
                                        WHERE id = ?`;
              try {
                  //var result = await pool.query(queryString,...  // cas Asynchrone
                  var result =  pool.query(queryString, [mont ,statut ,dtchgst, message , dateDuJour , Id]);
                      res.end;
                      console.log("result = " + JSON.stringify(result));
              } catch (err) {
                  throw new Error(err);
              }
              console.log("MAJ engmtpers avec SUCCÈS " );
              res.end;
      })

module.exports = router