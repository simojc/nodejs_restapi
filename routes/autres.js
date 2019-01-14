// Ce fichier doit contenir toutes les routes relatives à "Autres.."

const express = require('express')
const router = express.Router()

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')
 
router.get("/groupes", (req, res) => {
   
    const queryString = "SELECT * FROM groupes";
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
router.get('/groupe/:id', (req, res) => {
    const Id = req.params.id
    const queryString = "SELECT * FROM groupes WHERE id = ?"
    pool.query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for groupe by Id: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        console.log("Interrogation de base des données réussie groupe by Id")
      
        res.json(rows)
    })
}) 

router.get("/locations", (req, res) => {
   
    const queryString = "SELECT * FROM locations";
    pool.query(queryString, (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for locations: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
        console.log("Interrogation de base des données locations réussie")
       res.json(rows)
    })

})
 


/* router.post('/user_create', (req, res) => {
    const email = req.body.email
    const name = req.body.name
    const password = req.body.password
    const queryString = "INSERT INTO users(groupe_id,name,email,password) VALUES(1,?,?,?)"
    pool.query(queryString, [name, email, password], (err, results, fields) => {
        if (err) {
            console.log("Failled to insert into users: " + err)
            res.sendStatus(500)
            return
        }
        console.log("Insertion d'un nouvel utilisateur avec l'id: " + results.insertId)
        res.end()
    })
    res.end()
}) */

module.exports = router