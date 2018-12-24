// Ce fichier doit contenir toutes les routes relatives à "Personne"

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

router.get("/rpnpers", (req, res) => {
    var respId = req.query.resp_id;
    console.log("Fecthing rpnpers with resp_id: " + req.query.resp_id)
    console.log(".... respId = "+respId)
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
                    WHERE rpnpers.repdt1_id = ?
                     `;
    getConnection().query(queryString, [respId], (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for rpnPers: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
        console.log("Interrogation de base des données réussie de rpnPers")
        res.json(rows)
    })
})

router.get('/rpnper/:id', (req, res) => {
    console.log("Fecthing rpnpers with id: " + req.params.id)
    const Id = req.params.id
    const queryString = "SELECT * FROM rpnpers WHERE id = ?"
    getConnection().query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for rpnpers: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        console.log("Interrogation de base des données réussie rpnpers")
        res.json(rows)
    })
})

module.exports = router