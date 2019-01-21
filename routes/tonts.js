
// Ce fichier doit contenir toutes les routes relatives à "tonts"

const express = require('express')
const router = express.Router()

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')

router.get("/tonts", (req, res) => {
    const queryString = "SELECT * from tonts "
    pool.query(queryString, (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for tonts: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
        console.log("Interrogation de base des données tonts réussie")
       res.json(rows)
    })
})

router.get('/tontpers/:id', (req, res) => {
   // console.log("Fecthing tonts with id: " + req.params.id)
   // Retourne toutes les tontines d'une personne
    const Id = req.params.id
    const queryString = `SELECT 	tontpers.*,
                            tonts.nom,
                            tonts.descr,
                            tonts.mtpart,
                            tonts.groupe_id,
                            tonts.dtdeb,
                            tonts.dtfin,
                            tonts.cot_dern	,
                            CONCAT(pers.nom , ' ', pers.prenom) nom_prenom
                        FROM	tontpers
                        LEFT JOIN tonts ON tonts.id = tontpers.tont_id
                        LEFT JOIN pers ON pers.id = tontpers.pers_id
                        WHERE tontpers.pers_id = ?
                        `;
    pool.query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for tonts: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        console.log("Interrogation de base des données réussie tonts")
        res.json(rows)
    })
})

router.get('/unetontpers/:id', (req, res) => {
    console.log("Fecthing rpnpers with id: " + req.params.id)
    // Retourne une ligne de la table tontpers
    const Id = req.params.id
    const queryString = "SELECT * FROM tontpers WHERE id = ?"
    pool.query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for tontpers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
     //   console.log("Interrogation de base des données réussie rpnpers")
        res.json(rows)
    })
})


router.get('/tontpers', (req, res) => {
     console.log("Fecthing engmtpers with tont_id: " + req.query.tont_id)
     console.log("Fecthing engmtpers with groupe: " + req.query.groupe)
    // const Id = req.params.id
     if (!req.query.groupe) {
         console.log("Requête échouée, le groupe doit être renseigné")
         res.sendStatus(500)
         res.end
         //throw err
         return
     }
     const GpeId = req.query.groupe;
     if (!req.query.tont_id) {
        console.log("Requête échouée, l'Id de la tontine doit être renseigné")
        res.sendStatus(500)
        res.end
        //throw err
        return
    }
    const tontId = req.query.tont_id;
 
     const queryString = `SELECT tontpers.*,
                            tonts.nom,
                            tonts.descr,
                            tonts.mtpart,
                            tonts.groupe_id,
                            tonts.dtdeb,
                            tonts.dtfin,
                            tonts.cot_dern	,
                            tontpers.position,
                            tontpers.moisgain,
                            CONCAT(pers.nom , ' ', pers.prenom) nom_prenom
                        FROM	tontpers
                        LEFT JOIN tonts ON tonts.id = tontpers.tont_id
                        LEFT JOIN pers ON pers.id = tontpers.pers_id
                        WHERE tonts.groupe_id =pers.groupe_id 
                        AND PERS.groupe_id = ?
                        AND tonts.id = ?
                        ORDER by tontpers.position
 `;
     pool.query(queryString,[GpeId,tontId], (err, rows, fields) => {
         if (err) {
             console.log("Failled to query for tontpers: " + err)
             res.sendStatus(500)
             res.end
             return
         }
         // console.log("Interrogation de base des données réussie tontpers" + JSON.stringify(rows))
         res.json(rows)
     })
 })

const { check, validationResult } = require('express-validator/check');

router.post('/tontpers', [
                    check('pers_id', 'la personne est obligatoire ').exists(),
                    check('tont_id', 'la tontine est obligatoire ').exists(),
                    check('position', 'la position est obligatoire').exists(),                   
                    check('alias', 'l alias est obligatoire ').exists(),
                    check('dt_statut', 'la date statut est obligatoire ').exists(),
                    check('statut', 'le statut est obligatoire ').exists(),
                    // check('comment', 'la ville est obligatoire ').exists(),
                    check('moisgain', 'le mois de gain  est obligatoire ').exists(),
                    ], (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
console.log('req.body = ' + JSON.stringify(req.body));

    const tont_id = req.body.tont_id;
    const pers_id = req.body.pers_id;
    const position = req.body.position;
    const alias = req.body.alias;
    const statut = req.body.statut;
    const comment = req.body.comment;
    const dt_statut = req.body.dt_statut;
    const moisgain = req.body.moisgain;
    const dateDuJour = new Date();

    pool.query("SELECT id FROM tontpers WHERE  tont_id = ?  AND alias = ?", [tont_id, alias], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for tontpers: " + err)
            res.sendStatus(500)
            res.end
            // throw err
            return res.status(500).json({ errors: err})
        }        

        if (rows.length > 0) {
            //if (await(personne)) {  //  si la fnction est déplacer dans un autre fichier serice, la rendre Asynch
               // throw 'Une personne avec le courriel ' + email + ' existe déjà';
                return res.status(400).json({ errors: 'il existe deja une personne avec cet alias dans cette tontine' + alias })
            }
            const queryString = `INSERT INTO tontpers(tont_id, pers_id, position, alias, statut, comment, dt_statut, moisgain, created_at,updated_at) 
                                VALUES(?,?,?,?,?,?,?,?,?,?)`;
            try {
                //var result = await pool.query(queryString,...  // cas Asynchrone
                var result =  pool.query(queryString, [tont_id, pers_id, position, alias, statut, comment, dt_statut, moisgain, dateDuJour, dateDuJour]);
                    res.end;
            } catch (err) {
                throw new Error(err);
            }
            console.log("Insertion nouvelle tontpers avec l'id: " + result.insertId);
            res.end;
    })
});

router.put('/tontpers/:id', [
    check('pers_id', 'la personne est obligatoire ').exists(),
    check('tont_id', 'la tontine est obligatoire ').exists(),
    check('position', 'la position est obligatoire').exists(),                   
    check('alias', 'l alias est obligatoire ').exists(),
    check('dt_statut', 'la date statut est obligatoire ').exists(),
    check('statut', 'le statut est obligatoire ').exists(),
    // check('comment', 'la ville est obligatoire ').exists(),
    check('moisgain', 'le mois de gain  est obligatoire ').exists(),
    ], (req, res, next) => {
// Finds the validation errors in this request and wraps them in an object with handy functions
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(422).json({ errors: errors.array() });
}
console.log('req.body = ' + JSON.stringify(req.body));

// const tont_id = req.body.tont_id;
const pers_id = req.body.pers_id;
const position = req.body.position;
const alias = req.body.alias;
const statut = req.body.statut;
const comment = req.body.comment;
const dt_statut = req.body.dt_statut;
const moisgain = req.body.moisgain;
const dateDuJour = new Date();

const Id = req.params.id
      
              const queryString = `UPDATE tontpers SET position = ?,alias = ?,statut = ?,dt_statut = ?, moisgain = ?, comment = ?,updated_at = ? 
                                        WHERE id = ?`;
              try {
                  //var result = await pool.query(queryString,...  // cas Asynchrone
                  var result =  pool.query(queryString, [position ,alias ,statut,dt_statut , moisgain, comment, dateDuJour , Id]);
                      res.end;
                      console.log("result = " + JSON.stringify(result));
              } catch (err) {
                  throw new Error(err);
              }
              console.log("MAJ tontpers avec SUCCÈS " );
              res.end;
      })
  
module.exports = router