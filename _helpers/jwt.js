const expressJwt = require('express-jwt');
const config = require('../config.json');

module.exports = jwt;

const pathToRegexp = require('path-to-regexp');

function jwt() {
    const { secret } = config;
    return expressJwt({ secret }).unless({
        path: [
            // public routes that don't require authentication
            '/api/users/register',
            '/api/users/authenticate',
            { url: /^\/meeting\/.*/, methods: ['GET', 'PUT'] },
    
            { url: '/api/evnmts', methods: ['GET'] },
            { url: '/api/evnmtdtls', methods: ['GET'] },
            { url: /^\/api\/evnmts\/.*/, methods: ['GET', 'PUT'] },
            { url: /^\/api\/evnmtdtls\/.*/, methods: ['GET', 'PUT'] },

            '/form.html',
            '/api/evnmts/.*/',
            '/api/evnmtdtls/.*/',
            '/'
        ]
    });
}

/* const expressJwt = require('express-jwt');
const config = require('config.json');
const userService = require('../users/user.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/users/authenticate',
            '/users/register'
        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.sub);

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
}; */