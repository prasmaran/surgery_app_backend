const express = require('express')
const { urlencoded } = require('body-parser')
//const bodyParser = require('body-parser')
const { title } = require('process')
const port = process.env.APP_PORT || 5000

// Global middlware
const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('images'))

// Testing EJS for upload
app.set('view engine', 'ejs')

// Importing routes
const dummyUserRoutes = require('./src/routes/dummyUserRoutes.js')
const userMasterRoutes = require('./src/routes/userMasterRoutes.js')
const progressBookRoutes = require('./src/routes/progressBookRoutes')

// Logger config
const { serverLogger, userCreateLogger, userLoginLogger } = require('./config/loggerUpdated.js')

// ---------- Testing EJS ----------------
app.get('/', (req, res) => {
    res.send('<h3>This is to show that my app is working ....</h3>')
})

app.get('/upload', (req, res) => {
    res.render('upload')
})

// ---------- Regitser User ----------------
app.use('/books/progress', progressBookRoutes)
// ---------- Regitser User ----------------
app.use('/user', userMasterRoutes)
// ---------- Dummy users routes -----------
app.use('/dummyUser', dummyUserRoutes)


app.listen(port, () => {
    console.log(` Server listenining on port ${port} ...`)
    serverLogger.info(`Server listenining on port ${port}`)
    
})
