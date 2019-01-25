// Ce fichier doit contenir toutes les routes relatives à "evnmts"

const express = require('express')
const router = express.Router()

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')

router.get("/groupes", (req, res) => {
   
    const queryString = "SELECT * from groupes "
    pool.query(queryString, (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for groupes: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
        console.log("Interrogation de base des données groupes réussie")
       res.json(rows)
    })

})
///////
router.get('/groupe/:id', (req, res) => {
   // console.log("Fecthing evnmt with id: " + req.params.id)
    const Id = req.params.id
    const queryString = "SELECT * FROM groupes WHERE id = ?"
    pool.query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for groupes: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        console.log("Interrogation de base des données réussie groupes")
        res.json(rows)
    })
})

module.exports = router