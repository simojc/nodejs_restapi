const jwt = require('jsonwebtoken');
const config = require('../config.json');

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')

// const users = [{ id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }];
let users = []
const queryString = `SELECT
                    users.id, users.password, users.name, users.email, users.admin, users.groupe_id,
                    groupes.nom, groupes.descr
                    FROM users
                    LEFT JOIN groupes
                    ON groupes.id = users.groupe_id`;

 pool.query(queryString, (err, rows, fields) => {
    if (err) {
        console.log("Failled to query for users: " + err)
        res.sendStatus(500)
        res.end
        //throw err
        return
    }
    console.log("Interrogation de base des données Users réussie")
    users = rows;
    // console.log("users = " + JSON.stringify(users));
}) 

module.exports = {
    authenticate,
    getAll,             
    create,
    update,
    getById,
    _delete
};

async function authenticate({ email, password }) {
    // console.log("email = " + email);
    //console.log("users = " + JSON.stringify(users) );
    const user = users.find(u => u.email == email && u.password == password);
   // console.log("user = " + JSON.stringify(user) );
    if (user) {
        const token = jwt.sign({ sub: user.id }, config.secret);
        const { password, ...userWithoutPassword } = user;
        console.log("token = " + token );
        return {
            ...userWithoutPassword,
            token
        };
    }
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

async function getById(id) {
    const queryString = "SELECT * FROM users WHERE id = ?"
    try {
        var result = await pool.query(queryString,[id])
    } catch(err) {
        throw new Error(err)
    }
    return result;   
}

async function create(req, res) {
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
            console.log("Échec lors de la sélection de la table users: " + err)
            //res.sendStatus(500)
            // res.end("Failled to query for users: " + err);
            res.end("Échec lors de la sélection de la table users: " + err);
            return 
        }
        if (rows.length > 0) {
             console.log( 'Un utilisaeur avec le courriel ' + email + ' existe déjà');
            res.end('Un utilisaeur avec le courriel ' + email + ' existe déjà');
            return
            // return res.status(400).json({ errors: 'Un utilisaeur avec le courriel ' + email + ' existe déjà'}) 
        }
        pool.query("SELECT groupe_id FROM pers WHERE pers.email = ? ", [email], (err, rows, fields) => {
            if (err) {
                 console.log("Échec lors de la sélection de la table pers:: " + err)
                //res.sendStatus(500)
                res.end("Échec lors de la sélection de la table pers: " + err); 
                return 
            }
            if (rows.length > 0) {
                groupe_id = rows[0].groupe_id
                const queryString = "INSERT INTO users(groupe_id,name,email,password,admin, created_at) VALUES(?,?,?,?, ?, ?)"
                try {
                      console.log(" user = [groupe_id, name, email, password, admin, dateDuJour] = [ " + groupe_id + "; " + name + "; " + email + "; " + password + "; " + admin + "; " + dateDuJour + "]");
                    var result = pool.query(queryString, [groupe_id, name, email, password, admin, dateDuJour]);
                    res.end;
                } catch (err) {
                    throw new Error(err);
                }
                return;
            }
            else {
               // return res.status(400).json({ errors: "Aucun membre n''est enregistré avec le courriel :" + email + ". Veuillez contacter le responsable de votre groupe"}) 
                console.log("Aucun membre n''est enregistré avec le courriel :" + email + ". Veuillez contacter le responsable de votre groupe")
                //res.sendStatus(500)
                res.end("Échec lors de la sélection de la table pers: " + err); 
                return 
            }
        })
    })
}

async function update(id, userParam) {
    //const user = await User.findById(id);
    const user = users.find(u => u.id === id);
    // validate
    if (!user) throw 'User not found'; // existence de l'utilisateur
    // if (user.email !== userParam.email && await users.find(u => u.email === userParam.email)) {
    //     throw 'Email "' + userParam.email + '" is already taken';
    // }
    // Nouvel courriel  déjà utilisé
    const password = userParam.password
    const Id = req.params.id
    // hash password if it was entered
    // À décommenter si les mots de passes sont cryptés
    /*   if (userParam.password) {
          password = bcrypt.hashSync(userParam.password, 10);
      } */
    // const queryString = "INSERT INTO users(groupe_id,name,email,password) VALUES(groupe,?,?,?)"
    const queryString = "UPDATE users SET  password = ? WHERE id = ?"
    try {
        var result = await pool.query(queryString, [password, Id]);
    } catch(err) {
        throw new Error(err);
    }
    return;
}

async function _delete(id) {
    const queryString = "DELETE FROM users WHERE id = ?"
    try {
        var result = await  pool.query(queryString, [id]);
    } catch(err) {
        throw new Error(err);
    }
    return
}


//
/* 
const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;
module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};
async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, userParam) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.username !== userParam.username && await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    // hash password if it was entered
    if (userParam.password) {
        userParam.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // copy userParam properties to user
    Object.assign(user, userParam);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}
*/
