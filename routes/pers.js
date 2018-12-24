// Ce fichier doit contenir toutes les routes relatives à "Personne"const router = express.Router()

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


router.get("/pers", (req, res) => {
    var queryString
    const requestedPersType = req.params['type'] || "1"
    const requestedPersEmail = req.params['email'] || "1"
    const requestedPersGroupe = req.params['groupe'] || "1"
    console.log("Groupe = " + requestedPersGroupe)
    console.log("Type = " + requestedPersType)
    console.log("Email = " + requestedPersEmail)
    //
    if ((requestedPersType == "1") && (requestedPersEmail == "1")) {
        queryString = "SELECT * FROM pers";
    }
    else if ((requestedPersType == "1") && (requestedPersEmail != "1")) {
        queryString = "SELECT * FROM pers WHERE pers.email = requestedPersEmail ";
        // $perss = Pers::where( 'email', requestedPersEmail )->first();
    }
    else {
        queryString = `SELECT
                pers.*, CONCAT(pers.nom , ' ', pers.prenom) nom_pers,
                CONCAT(pers.address , ' ',	pers.city, ' ',pers.country) location
            FROM pers
            WHERE UPPER(substr(pers.type,1,1)) = requestedPersType and pers.groupe_id = requestedPersGroupe 
            `;
    }

    getConnection().query(queryString, (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for Pers: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
        console.log("Interrogation de base des données réussie de Pers")

        res.json(rows)
    })
})

module.exports = router