const express = require('express');
const router = express.Router();
const userService = require('../models/user.service');
const bodyParser = require('body-parser')
const app = express()
// app.use(expressValidator())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')

// routes
router.post('/authenticate', authenticate);
 router.post('/register', create);  // create or register
router.get('/', getAll);
router.get('/:id', getById);

router.put('/:id', update);
router.delete('/:id', _delete);

function authenticate(req, res, next) {
   // userService.authenticate(req.body)
    userService.authenticate(req.body)
        .then(user => {
             console.log(" Ds controle; user = " + JSON.stringify(user));
            user ? res.json(user) : res.status(400).json({ message: 'Email or password is incorrect' });
        })
        .catch(err => next(err));
}

// create or register
function create(req, res, next) {
    console.log(" Controller req.body = " + JSON.stringify(req.body));
    userService.create(req, res)
        .then(() => res.json({}))
        .catch(function (err) {
            console.log(err)
            res.status(400).send(err.message)
        });
        //.catch(err => next(err));
}


function getAll(req, res, next) {
    // console.log("statusCode: ", res.statusCode);
   // console.log("headers: ", JSON.stringify(req.headers));
   const GroupeId = req.query.groupe
    userService.getAll(GroupeId)
        .then(users => {
            res.json(users);
            // console.log(" DANS CONTROLE users = " + JSON.stringify(users) )
        })
        .catch(err => next(err));
}

function getById(req, res, next) {
    userService.getById(req.params.id).then(
        user => {
            console.log("Dans Controll user = " + JSON.stringify(user));
            res.json(user)
        })
        .catch(err => next(err));
}

function update(req, res, next) {
    userService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _delete(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

router.post('/register_bon', (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const admin = req.body.admin
    const name = email
    const dateDuJour = new Date()
    // Validation

    if (!email) {
        throw 'Le courriel est obligatoire';
    }
    if (!password) {
        throw 'Le mot de passe est obligatoire';
    }

    pool.query("SELECT * FROM users WHERE users.email = ? ", [email], (err, rows, fields) => {

        if (err) {
            console.log("Failled to query for users: " + err)
            res.sendStatus(500)
            res.end
            // throw err
            return;
        }
        if (rows.length > 0) {
            throw new Error( 'Un utilisaeur avec le courriel ' + email + ' existe déjà');
        }

        pool.query("SELECT groupe_id FROM pers WHERE pers.email = ? ", [email], (err, rows, fields) => {
            if (err) {
                console.log("Failled to query for Pers: " + err)
                res.sendStatus(500)
                res.end
                // throw err
                return;
            }
            if (rows.length > 0) {
                groupe_id = rows[0].groupe_id
                const queryString = "INSERT INTO users(groupe_id,name,email,password,admin, created_at) VALUES(?,?,?,?, ?, ?)"
                try {
                    //  console.log(" [groupe_id, name, email, password, admin, dateDuJour] = [ " + groupe_id + "; " + name + "; " + email + "; " + password + "; " + admin + "; " + dateDuJour + "]");
                    var result = pool.query(queryString, [groupe_id, name, email, password, admin, dateDuJour]);
                    res.end;
                } catch (err) {
                    throw new Error(err);
                }
            }
            else {
                throw new Error("Aucun membre n''est enregistré avec le courriel :" + email + ". Veuillez contacter le responsable de votre groupe")
            }

        })

    })
});

module.exports = router;