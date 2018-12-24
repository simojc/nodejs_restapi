// Ce fichier doit contenir toutes les routes relatives à "user"const router = express.Router()

const express = require('express')
const router = express.Router()
const mysql = require('mysql')

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'reunion',
    password: 'reunion',
    database: 'reunion'
})

function getConnection() {
    return pool
}

router.get('/engmtpers/:id', (req, res) => {
    console.log("Fecthing engmtpers with id: " + req.params.id)
    const Id = req.params.id
    const queryString = `SELECT 	engmtpers.*,
                            engmts.groupe_id,
                            engmts.nom as nom_engmt,
                            engmts.descr,
                            engmts.periodicite,
                            engmts.periode,
                            engmts.statut as stat_engmt,
                            engmts.mont_unit,
                            engmts.dt_ech,
                            CONCAT(pers.nom , ' ', pers.prenom) nom_prenom
                        FROM	engmtpers
                        LEFT JOIN engmts ON engmtpers.engmt_id = engmts.id
                        LEFT JOIN pers  ON engmtpers.pers_id = pers.id
                        WHERE engmtpers.pers_id = ?
                        `;
    getConnection().query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for engmtpers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        console.log("Interrogation de base des données réussie engmtpers")
        res.json(rows)
    })
})

module.exports = router