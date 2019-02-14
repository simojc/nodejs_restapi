const jwt = require('jsonwebtoken');
const config = require('../config.json');

var bcrypt = require('bcryptjs');

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')

module.exports = {
    authenticate,
    getAll,
    create,
    // signup,
    update,
    getById,
    _delete
};

/* router.post('/login', function(req, res) {
    User.findOne({ email: req.body.email }, function (err, user) {
      if (err) return res.status(500).send('Error on the server.');
      if (!user) return res.status(404).send('No user found.');
      var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
      if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });
      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token });
    });
  }); */

  async function authenticate({ email, password }) {
    // console.log("email = " + email);
    // console.log("hashedPassword = " + hashedPassword);
    var hashedPassword = bcrypt.hashSync(password, 8);
   // console.log("hashedPassword = " + hashedPassword);
    const queryString = "SELECT * FROM users WHERE email=? "
    try {
        var result = await pool.query(queryString, [email, hashedPassword])
    } catch (err) {
        throw new Error(err)
    }
    const user = result[0];

    var passwordIsValid = bcrypt.compareSync(password, user.password);
      if (!passwordIsValid)   throw 'Courriel ou mot de passe incorrect...';
      // console.log("passwordIsValid = " + passwordIsValid);
    if (user) {
        const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: 60 * 60 * 12 }); // une minute
        // const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: 60 * 60 * 24 * 7 }) // one week
        const { password, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            token
        };
    }
}

async function authenticate_old({ email, password }) {
    // console.log("email = " + email);
    // console.log("hashedPassword = " + hashedPassword);
    var hashedPassword = bcrypt.hashSync(password, 8);
    console.log("hashedPassword = " + hashedPassword);
    const queryString = "SELECT * FROM users WHERE email=? AND password=?"
    try {
        var result = await pool.query(queryString, [email, hashedPassword])
    } catch (err) {
        throw new Error(err)
    }
    const user = result[0];
    if (user) {
        const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: 60 * 60 * 12 }); // une minute
        // const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: 60 * 60 * 24 * 7 }) // one week
        const { password, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            token
        };
    }
}

async function getAll(GroupeId) {
    let users = []

    const queryString = `SELECT
            users.id, users.password, users.name, users.email, users.admin, users.groupe_id
                    FROM users
            WHERE  users.groupe_id = ?`;
    try {
        var result = await pool.query(queryString, [GroupeId])
    } catch (err) {
        throw new Error(err)
    }
    users = result;

    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

async function getById(id) {
    const queryString = "SELECT * FROM users WHERE id = ?"
    try {
        var result = await pool.query(queryString, [id])
    } catch (err) {
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
    
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);
    
    pool.query("SELECT * FROM users WHERE users.email = ? ", [email], (err, rows, fields) => {
        if (err) {
            console.log("Échec lors de la sélection de la table users: " + err)
            //res.sendStatus(500)
            // res.end("Failled to query for users: " + err);
            res.end("Échec lors de la sélection de la table users: " + err);
            return
        }
        if (rows.length > 0) {
            //console.log('Un utilisaeur avec le courriel ' + email + ' existe déjà');
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
                    // console.log(" user = [groupe_id, name, email, password, admin, dateDuJour] = [ " + groupe_id + "; " + name + "; " + email + "; " + password + "; " + admin + "; " + dateDuJour + "]");
                    var result = pool.query(queryString, [groupe_id, name, email, hashedPassword, admin, dateDuJour]);
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

/* 
async function signup(req , res){
    var fname  = req.body.first_name;
    var lname= req.body.last_name;
    var pass= req.body.password;
    var email=req.body.email;
    var dec_pass =atob(pass);
    var encrypted_pass = cryptr.encrypt(dec_pass);
    var sql = "INSERT INTO `login`(`id`,`first_name`,`last_name`,`email`,`password`) VALUES ('','" + fname + "','" + lname + "','" +email+ "','" +encrypted_pass+ "')";
         var query = db.query(sql, function(err, result){
             res.end(JSON.stringify(result));
   });
};
*/

async function update(id, userParam) {
    // console.log("userParam = " + JSON.stringify(userParam) );
    pool.query("SELECT * FROM users WHERE users.id = ? ", [id], (err, rows, fields) => {
        if (err) {
            console.log("Échec lors de la sélection de la table users: " + err)
            //res.sendStatus(500)
            // res.end("Failled to query for users: " + err);
            res.end("Échec lors de la sélection de la table users: " + err);
            return
        }
        if (rows.length === 1) {
            const password = userParam.password
            let admin = 0
            if (userParam.admin) { admin = userParam.admin }
            // console.log("admin = " + admin)

            // hash password if it was entered
            // À décommenter si les mots de passes sont cryptés
            /*    if (userParam.password) {
                  password = bcrypt.hashSync(userParam.password, 10);
              } */
            // const queryString = "INSERT INTO users(groupe_id,name,email,password) VALUES(groupe,?,?,?)"
            const queryString = "UPDATE users SET password = ?, admin = ? WHERE id = ?"
            try {
                var result = pool.query(queryString, [password, admin, id]);
            } catch (err) {
                throw new Error(err);
            }
            return;
        }
    })
}

async function _delete(id) {
    const queryString = "DELETE FROM users WHERE id = ?"
    try {
        var result = await pool.query(queryString, [id]);
    } catch (err) {
        throw new Error(err);
    }
    return
}
