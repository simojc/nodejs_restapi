// Ce fichier doit contenir toutes les routes relatives à "evnmts"

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


router.get("/evnmts", (req, res) => {
   
    const queryString = "SELECT * from evnmts "
    getConnection().query(queryString, (err, rows, fiels) => {
        if (err) {
            console.log("Failled to query for evnmts: " + err)
            res.sendStatus(500)
            res.end
            //throw err
            return
        }
        console.log("Interrogation de base des données evnmts réussie")
       res.json(rows)
    })

})

/* router.post('/user_create', (req, res) => {
    const email = req.body.email
    const name = req.body.name
    const password = req.body.password
    const queryString = "INSERT INTO users(groupe_id,name,email,password) VALUES(1,?,?,?)"
    getConnection().query(queryString, [name, email, password], (err, results, fields) => {
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

router.get('/evnmt/:id', (req, res) => {
    console.log("Fecthing evnmt with id: " + req.params.id)
    const Id = req.params.id
    const queryString = "SELECT * FROM evnmts WHERE id = ?"
    getConnection().query(queryString, [Id], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for evnmts: " + err)
            res.sendStatus(500)
            res.end
            return
        }
        console.log("Interrogation de base des données réussie evnmts")
        res.json(rows)
    })
})

module.exports = router