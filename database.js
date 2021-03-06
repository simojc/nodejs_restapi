const util = require('util')
const mysql = require('mysql')

/* const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'reunion',
    password: 'reunion',
    database: 'reunion'
}) */

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'us-cdbr-iron-east-01.cleardb.net',
    user: 'b5344b67e37662',
    password: '84921068',
    database: 'heroku_f7bb7aad50659b5'
})

// CLEARDB_DATABASE_URL: mysql:
//  b5344b67e37662:84921068@us-cdbr-iron-east-01.cleardb.net/heroku_f7bb7aad50659b5?reconnect=true

// mysql --host=us-cdbr-iron-east-01.cleardb.net --user=b5344b67e37662 --password=84921068 heroku_f7bb7aad50659b5

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }

    if (connection) connection.release()

    return
})

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query)

module.exports = pool




/* var mysql = require('mysql')

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'reunion',
    password: 'reunion',
    database: 'reunion'
})

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})
module.exports = pool */