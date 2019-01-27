// Ce fichier doit contenir toutes les routes relatives à "Personne"

const express = require('express')
const router = express.Router()

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément

const pool = require('../database')

router.get("/rpngroupe", (req, res) => {
    var groupeId = req.query.groupe_id;
   // console.log("groupeId = " + JSON.stringify(groupeId))
    const queryString = `
                    SELECT
                    rpnpers.*, CONCAT(personne.nom, ' ', personne.prenom) nom_pers,
                    personne.prenom prenom_pers,
                    CONCAT(repdt.nom, ' ', repdt.prenom) nom_repdt, repdt.prenom prenom_repdt,
                    CASE(rpnpers.depot - 10) < 0
                    when true then 'Dépôt à compléter le plus tôt possible' END as message
                    FROM rpnpers
                    LEFT JOIN pers as personne ON personne.id = rpnpers.pers_id
                    LEFT JOIN pers as repdt ON repdt.id = rpnpers.repdt1_id
                    WHERE rpnpers.groupe_id = ?
                    ORDER BY personne.nom
                     `;
    pool.query(queryString, [groupeId], (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for rpnPers: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
       // console.log("rpngroupe = " + JSON.stringify(rows))
        res.json(rows)
    })
})


router.get("/rpnpers", (req, res) => {
    var respId = req.query.resp_id;
   // console.log("respId = " + JSON.stringify(respId))
  
    const queryString = `
                    SELECT
                    rpnpers.*, CONCAT(personne.nom, ' ', personne.prenom) nom_pers,
                    personne.prenom prenom_pers,
                    CONCAT(repdt.nom, ' ', repdt.prenom) nom_repdt, repdt.prenom prenom_repdt,
                    CASE(rpnpers.depot - 10) < 0
                    when true then 'Dépôt à compléter le plus tôt possible' END as message
                    FROM rpnpers
                    LEFT JOIN pers as personne ON personne.id = rpnpers.pers_id
                    LEFT JOIN pers as repdt ON repdt.id = rpnpers.repdt1_id
                    WHERE rpnpers.repdt1_id = ? OR rpnpers.repdt2_id = ? 
                    ORDER BY personne.nom
                     `;
    pool.query(queryString, [respId, respId], (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for rpnPers: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
       // console.log("rpnPers = " + JSON.stringify(rows))
        res.json(rows)
    })
})

router.get('/rpnpers/:id', (req, res) => {
    // console.log("Fecthing rpnpers with id: " + req.params.id)
    const Id = req.params.id
    const queryString = "SELECT * FROM rpnpers WHERE id = ?"
    pool.query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for rpnpers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        // console.log("Interrogation de base des données réussie rpnpers")
        res.json(rows)
    })
})

const { check, validationResult } = require('express-validator/check');

router.post('/rpnpers', [
                    check('groupe_id', 'le groupe est obligatoire ').exists(),
                    check('pers_id', 'le pers_id est obligatoire ').exists(),
                    check('dtadh', 'la date est obligatoire et doit çetre au format YYYY-MM-DD').exists().isISO8601('yyyy-mm-dd'),                   
                    check('repdt1_id', 'Le répondant 1 est obligatoire ').exists(),
                    check('mtrle', 'le mtrle est obligatoire ').exists(),
                    ], (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
   // console.log('req.body = ' + JSON.stringify(req.body));

    const groupe_id = req.body.groupe_id;
    const pers_id = req.body.pers_id;
    const repdt1_id = req.body.repdt1_id;
    const repdt2_id = req.body.repdt2_id ||req.body.repdt1_id;
    const dtadh = req.body.dtadh;
    const mtrle = req.body.mtrle;
    const depot = req.body.depot;
    const dtmajdpt = req.body.dtmajdpt;
    const dateDuJour = new Date();

    pool.query("SELECT id FROM rpnpers WHERE groupe_id = ?  AND pers_id = ?", [groupe_id,pers_id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for rpnpers: " + err)
            res.sendStatus(500)
            res.end
            // throw err
            return res.status(500).json({ errors: err})
        }
        if (rows.length > 0) {
                return res.status(400).json({ errors: 'Cette personne est déjà inscrite à RPN ' })
            }
            // groupe_id|pers_id|repdt1_id|repdt2_id|dtadh|mtrle |depot|dtmajdpt|created_at|updated_at 
            const queryString = `INSERT INTO rpnpers(groupe_id ,pers_id ,repdt1_id ,
                repdt2_id ,dtadh ,mtrle, depot ,dtmajdpt,created_at,updated_at) 
                                VALUES(?,?,?,?,?,?,?,?,?,?)`;
            try {
                //var result = await pool.query(queryString,...  // cas Asynchrone
                var result =  pool.query(queryString, [groupe_id ,pers_id ,repdt1_id ,
                    repdt2_id ,dtadh ,mtrle, depot ,dtmajdpt, dateDuJour, dateDuJour]);
                    res.end;
            } catch (err) {
                throw new Error(err);
            }
            // console.log("Insertion nouvelle rpnpers avec l'id: " + result.insertId);
            res.end;
    })
});

router.put('/rpnpers/:id', [
    check('groupe_id', 'le groupe est obligatoire ').exists(),
    check('pers_id', 'le pers_id est obligatoire ').exists(),
    check('dtadh', 'la date est obligatoire et doit çetre au format YYYY-MM-DD').exists(),        
    check('repdt1_id', 'Le répondant 1 est obligatoire ').exists(),
    check('mtrle', 'le mtrle est obligatoire ').exists(),
    ], (req, res, next) => {
// Finds the validation errors in this request and wraps them in an object with handy functions
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(422).json({ errors: errors.array() });
}
// console.log('req.body = ' + JSON.stringify(req.body));

const groupe_id = req.body.groupe_id;
const pers_id = req.body.pers_id;
const repdt1_id = req.body.repdt1_id;
const repdt2_id = req.body.repdt2_id ||req.body.repdt1_id;
const dtadh = req.body.dtadh;
const mtrle = req.body.mtrle;
const depot = req.body.depot;
const dtmajdpt = req.body.dtmajdpt;
const dateDuJour = new Date();

const Id = req.params.id
      
              const queryString = `UPDATE rpnpers SET dtadh = ?,mtrle = ?,depot = ?,dtmajdpt = ?,updated_at = ? 
                                        WHERE id = ?`;
              try {
                  //var result = await pool.query(queryString,...  // cas Asynchrone
                  var result =  pool.query(queryString, [dtadh, mtrle,depot,dtmajdpt, dateDuJour, Id]);
                      res.end;
                      // console.log("result = " + JSON.stringify(result));
              } catch (err) {
                  throw new Error(err);
              }
              // console.log("MAJ rpnpers avec SUCCÈS " );
              res.end;
      })
  

module.exports = router