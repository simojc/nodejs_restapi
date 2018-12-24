const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

var corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}
app.use(cors(corsOptions))
// cors est seulement u

app.use(express.static('./public'))
app.use(morgan('short'))
//app.use(morgan('combined'))
app.use(bodyParser.urlencoded({extended: false}))

app.get("/", (req, res) => {
  console.log("En réponse à root toute ...")
  res.send("Salut de ROOOOOT ...");
})

const routerUsers = require('./routes/users.js')
const routerPers = require('./routes/pers.js')
const routerrpnPers = require('./routes/rpnpers.js')
const routerEngmtpers = require('./routes/engmtpers.js')
const routerEvnmtdtls = require('./routes/evnmtdtls.js')
const routerEvnmts = require('./routes/evnmts.js')

app.use(routerUsers)
app.use(routerPers)
app.use(routerrpnPers)
app.use(routerEngmtpers)
app.use(routerEvnmtdtls)
app.use(routerEvnmts)



// Load our app server using express Somehow
// localhost:3003
app.listen(3003, () => {
  console.log("Le serveur a démarré et écoute sur le port 3003 ...");
})
