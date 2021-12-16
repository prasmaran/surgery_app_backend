const express = require('express')
const helmet = require("helmet")
const { urlencoded } = require('body-parser')
//const bodyParser = require('body-parser')
const { title } = require('process')
const port = process.env.APP_PORT || 5000
const path = require('path')

// Import cron module
const cron = require('node-cron')
const doCronTask = require('./config/cron.js')

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
const utilsRoutes = require('./src/routes/utilsRoutes.js')

// Logger config
const { serverLogger, userCreateLogger, userLoginLogger } = require('./config/loggerUpdated.js')

// ---------- Testing EJS ----------------
app.get('/', (req, res) => {

    // var mascots = [
    //     { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012 },
    //     { name: 'Tux', organization: "Linux", birth_year: 1996 },
    //     { name: 'Moby Dock', organization: "Docker", birth_year: 2013 }
    // ]
    // var tagline = "No programming concept is complete without a cute animal mascot."
    // res.render('pages/index', {
    //     mascots: mascots,
    //     tagline: tagline
    // })

    res.render('home')
})

// about page
app.get('/about', (req, res) => {
    res.render('pages/about')
})

app.get('/upload', (req, res) => {
    const filePath = __dirname
    console.log(filePath)
    res.render('upload')
})

/**
 * Base API Routes
 * 1 --> Progress Book Routes
 * 2 --> User routes
 * 3 --> Doctor Routes
 * 4 --> Dummy User Routes : testing
 */

app.use('/books/progress', progressBookRoutes)
app.use('/user', userMasterRoutes)
app.use('/dummyUser', dummyUserRoutes)
app.use('/doctor', doctorRoutes)
app.use('/utils', utilsRoutes)

// Run cron
// doCronTask()

app.listen(port, () => {
    console.log(` Server listenining on port ${port} ...`)
    serverLogger.info(`Server listenining on port ${port}`)

})
