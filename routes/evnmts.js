// Ce fichier doit contenir toutes les routes relatives à "evnmts"

const express = require('express')
const router = express.Router()

// Le pool de connexion permet de gerrer la monté en charge 
// lorsque plusisuers utilisateurs essaient de se connecter simultanément
const pool = require('../database')

router.get("/evnmts", (req, res) => {
    const queryString = "SELECT * FROM evnmts ORDER BY date desc "
    pool.query(queryString, (err, rows, fiels) => {
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

router.get('/evnmts/:id', (req, res) => {
    console.log("Fecthing evnmt with id: " + req.params.id)
    const Id = req.params.id
    const queryString = "SELECT * FROM evnmts WHERE id = ?"
    pool.query(queryString, [Id], (err, rows, fields) => {
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

const { check, validationResult } = require('express-validator/check');

router.post('/evnmts', [
    check('groupe_id', 'le groupe est obligatoire ').exists(),
    check('nom', 'le nom est obligatoire ').exists(),
    check('date', 'la date est obligatoire et doit çetre au format YYYY-MM-DD').exists().isISO8601('yyyy-mm-dd'),
    check('hrdeb', 'l heure est obligatoire ').exists(),
    check('address', 'l addresse est obligatoire ').exists(),
    check('statut', 'le statut est obligatoire ').exists(),
    check('city', 'la ville est obligatoire ').exists(),
], (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    console.log('req.body = ' + JSON.stringify(req.body));

    const groupe_id = req.body.groupe_id;
    const nom = req.body.nom;
    const date = req.body.date;
    const hrdeb = req.body.hrdeb;
    const famaccueil = req.body.famaccueil;
    const statut = req.body.statut;
    const descr = req.body.descr;
    const contenu = req.body.contenu;
    const address = req.body.address;
    const country = req.body.country;
    const city = req.body.city;
    const dateDuJour = new Date();

    pool.query("SELECT id FROM evnmts WHERE evnmts.date = ? ", [date], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for evnmts: " + err)
            res.sendStatus(500)
            res.end
            // throw err
            return res.status(500).json({ errors: err })
        }
        if (rows.length > 0) {
            //if (await(personne)) {  //  si la fnction est déplacer dans un autre fichier serice, la rendre Asynch
            // throw 'Une personne avec le courriel ' + email + ' existe déjà';
            return res.status(400).json({ errors: 'Une réunion est déjà inscrite pour cette date' + date })
        }
        const queryString = `INSERT INTO evnmts(groupe_id ,nom ,date ,hrdeb ,famaccueil ,statut
                                 ,descr ,contenu ,address ,country ,city,rapport, created_at,updated_at) 
                                VALUES(?,?,?,?,?,?,?,?,?,?,?,'Nom Rapport',?,?)`;
        try {
            //var result = await pool.query(queryString,...  // cas Asynchrone
            var result = pool.query(queryString, [groupe_id, nom, date, hrdeb, famaccueil, statut
                , descr, contenu, address, country, city, dateDuJour, dateDuJour]);
            res.end;
        } catch (err) {
            throw new Error(err);
        }
        console.log("Insertion nouvelle evnmts avec l'id: " + result.insertId);
        res.end;
    })
});

router.put('/evnmts/:id', [
    check('groupe_id', 'le groupe est obligatoire ').exists(),
    check('nom', 'le nom est obligatoire ').exists(),
    check('date', 'la date est obligatoire et doit çetre au format YYYY-MM-DD').exists().isISO8601('yyyy-mm-dd'),
    check('hrdeb', 'l heure est obligatoire ').exists(),
    check('address', 'l addresse est obligatoire ').exists(),
    check('statut', 'le statut est obligatoire ').exists(),
    check('city', 'la ville est obligatoire ').exists(),
], (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    console.log('req.body = ' + JSON.stringify(req.body));

    const nom = req.body.nom;
    const date = req.body.date;
    const hrdeb = req.body.hrdeb;
    const famaccueil = req.body.famaccueil;
    const statut = req.body.statut;
    const descr = req.body.descr;
    const contenu = req.body.contenu;
    const address = req.body.address;
    const country = req.body.country;
    const city = req.body.city;
    const dateDuJour = new Date();

    const Id = req.params.id

    const queryString = `UPDATE evnmts SET nom = ? ,date = ? ,hrdeb = ? ,famaccueil = ? ,statut = ?
                    ,descr = ? ,contenu = ? ,address = ? ,country = ? ,city = ?, updated_at = ? 
                    WHERE id = ?`;
    try {
        //var result = await pool.query(queryString,...  // cas Asynchrone
        var result = pool.query(queryString, [nom, date, hrdeb, famaccueil, statut
            , descr, contenu, address, country, city, dateDuJour, Id]);
        res.end;
    } catch (err) {
        throw new Error(err);
    }
    console.log("MAJ  evnmt avec SUCCÈS ");
    res.end;
})

router.post('/evnmtdtls', [
    check('ordre', 'le numéro d ordre est obligatoire ').exists(),
    check('evnmt_id', 'la réunion est obligatoire ').exists(),
    check('title', 'le titre est obligatoire ').exists(),
], (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    // console.log('req.body = ' + JSON.stringify(req.body));

    const evnmt_id = req.body.evnmt_id;
    const ordre = req.body.ordre;
    const resp = req.body.resp;
    var resume = req.body.resume;
    const title = req.body.title;
    const contenu = req.body.contenu;
    var duree = req.body.duree;
    const dateDuJour = new Date();

    if (!duree) {
        duree = 0;
    }

    if (!resume) {
        resume = title;
    }

    pool.query("SELECT id FROM evnmtdtls WHERE evnmt_id = ? AND ordre = ? ", [evnmt_id, ordre], (err, rows, fields) => {
        if (err) {
            console.log("Failled to query for evnmtdtls: " + err)
            res.sendStatus(500)
            res.end
            // throw err
            return res.status(500).json({ errors: err })
        }
        if (rows.length > 0) {
            //if (await(personne)) {  //  si la fnction est déplacer dans un autre fichier serice, la rendre Asynch
            // throw 'Une personne avec le courriel ' + email + ' existe déjà';
            return res.status(400).json({ errors: 'Il existe déjà un ordre du jour avec cet ordre' })
        }
        const queryString = `INSERT INTO evnmtdtls(ordre, evnmt_id, resp, resume,
                     title, contenu, duree, created_at, updated_at) 
                VALUES(?,?,?,?,?,?,?,?,?)`;
        try {
            //var result = await pool.query(queryString,...  // cas Asynchrone
            var result = pool.query(queryString, [ordre, evnmt_id, resp, resume,
                title, contenu, duree, dateDuJour, dateDuJour]);
            res.end;
        } catch (err) {
            throw new Error(err);
        }
        console.log("Insertion nouvelle evnmtdtls avec l'id: " + result.insertId);
        res.end;
    })
});


router.put('/evnmtdtls/:id', [
    check('ordre', 'le numéro d ordre est obligatoire ').exists(),
    check('evnmt_id', 'la réunion est obligatoire ').exists(),
    check('title', 'le titre est obligatoire ').exists(),
], (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    console.log('req.body = ' + JSON.stringify(req.body));

    const ordre = req.body.ordre;
    const title = req.body.title;
    const contenu = req.body.contenu;

    const dateDuJour = new Date();

    const Id = req.params.id

    const queryString = `UPDATE evnmtdtls SET ordre = ? ,title = ? ,contenu = ? , updated_at = ? 
                    WHERE id = ?`;
    try {
        //var result = await pool.query(queryString,...  // cas Asynchrone
        var result = pool.query(queryString, [ordre, title, contenu, dateDuJour, Id]);
        res.end;
    } catch (err) {
        throw new Error(err);
    }
    console.log("MAJ evnmtdtls avec SUCCÈS ");
    res.end;
})

module.exports = router