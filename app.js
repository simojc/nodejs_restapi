
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const jwt = require('./_helpers/jwt');
const errorHandler = require('./_helpers/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('short'))
// app.use(morgan('combined'))

var corsOptions = {
   // origin: 'http://localhost:4200',
   origin: 'https://imembre.herokuapp.com',
  //  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions))

// use JWT auth to secure the api
app.use(jwt());

// global error handler
app.use(errorHandler);

 app.use(express.static('./public'))

app.get("/", (req, res) => {
  console.log("En réponse à root toute ...")
  res.send("Salut de ROOOOOT ...");
})

app.use('/api/users', require('./routes/users.js'));
//app.use('/users', require('./users/users.controller'));

// api routes

//const routerUsers = require('./users/users.controller')
const routerPers = require('./routes/pers.js')
const routerrpnPers = require('./routes/rpnpers.js')
const routerEngmtpers = require('./routes/engmtpers.js')
const routerEvnmtdtls = require('./routes/evnmtdtls.js')
const routerEvnmts = require('./routes/evnmts.js')
const routerTonts = require('./routes/tonts.js')
const routerGroupes = require('./routes/groupes.js')
const routerAutres = require('./routes/autres.js')
const expressValidator = require('express-validator')

// app.use('/api', routerPers)

//app.use(routerUsers)
app.use('/api',routerPers)
app.use('/api',routerrpnPers)
app.use('/api',routerEngmtpers)
app.use('/api',routerEvnmtdtls)
app.use('/api',routerEvnmts)
app.use('/api',routerTonts)
app.use('/api',routerGroupes)
app.use('/api',routerAutres)

app.use(expressValidator())

// Load our app server using express Somehow
// localhost:3003
var port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log("Le serveur a démarré et écoute sur le port : " + port);
})
