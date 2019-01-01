
// Ce fichier doit contenir toutes les routes relatives à "tonts"

const express = require('express')
const router = express.Router()

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')

router.get('/tontpers/:id', (req, res) => {
    console.log("Fecthing tonts with id: " + req.params.id)
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

module.exports = router