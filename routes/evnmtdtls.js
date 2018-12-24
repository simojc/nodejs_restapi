// Ce fichier doit contenir toutes les routes relatives à "evnmtdtls"

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
//  evnmtdtls?evnmt_id=1
router.get("/evnmtdtls", (req, res) => {
    var queryString;
    var evnmt_id = req.query.evnmt_id;
    console.log(".... evnmt_id = "+evnmt_id)
    if (evnmt_id) {
        queryString = `
            SELECT 	evnmtdtls.*,
                CONCAT('Point ',evnmtdtls.ordre , ': ', evnmtdtls.title) entete
          FROM	evnmtdtls
          WHERE evnmtdtls.evnmt_id = ?  `;
        }
      else {
        queryString = `
        SELECT 	* 
        FROM	evnmtdtls
        `;
    }
       
    getConnection().query(queryString, [evnmt_id], (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for evnmtdtls: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
        console.log("Interrogation de base des données réussie de evnmtdtls")
        res.json(rows)
    })
})

router.get('/evnmtdtls/:id', (req, res) => {
    console.log("Fecthing evnmtdtls with id: " + req.params.id)
    const Id = req.params.id
    const queryString = "SELECT * FROM evnmtdtls WHERE id = ?"
    getConnection().query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for evnmtdtls: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        console.log("Interrogation de base des données réussie evnmtdtls")
        res.json(rows)
    })
})

module.exports = router
