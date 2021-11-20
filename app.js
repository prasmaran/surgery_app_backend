const express = require('express')
const helmet = require("helmet")
const { urlencoded } = require('body-parser')
//const bodyParser = require('body-parser')
const { title } = require('process')
const port = process.env.APP_PORT || 5000
const path = require('path')

// Global middlware
const app = express()
// app.use(helmet())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('images'))

// Testing EJS for upload
app.set('view engine', 'ejs')

// Importing routes
const dummyUserRoutes = require('./src/routes/dummyUserRoutes.js')
const userMasterRoutes = require('./src/routes/userMasterRoutes.js')
const progressBookRoutes = require('./src/routes/progressBookRoutes')
const doctorRoutes = require('./src/routes/doctorRoutes.js')

// Logger config
const { serverLogger, userCreateLogger, userLoginLogger } = require('./config/loggerUpdated.js')

// ---------- Testing EJS ----------------
app.get('/', (req, res) => {
    res.send('<h3>This is to show that my app is working ....</h3>')
})

app.get('/upload', (req, res) => {
    const filePath = __dirname
    console.log(filePath)
    res.render('upload')
})

// ---------- Regitser User ----------------
app.use('/books/progress', progressBookRoutes)
// ---------- Regitser User ----------------
app.use('/user', userMasterRoutes)
// ---------- Dummy users routes -----------
app.use('/dummyUser', dummyUserRoutes)
// ---------- Doctor routes ----------------
app.use('/doctor', doctorRoutes)

// Testing something
app.get('/hello', (req, res) => {
    res.sendFile(path.resolve(__dirname, './testing/Saras.pdf'))
})


app.listen(port, () => {
    console.log(` Server listenining on port ${port} ...`)
    serverLogger.info(`Server listenining on port ${port}`)
    
})
