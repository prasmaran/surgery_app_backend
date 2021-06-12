const express = require('express')
const mysql = require('mysql')
const path = require('path')
const multer = require('multer')
const { urlencoded } = require('body-parser')
const bodyParser = require('body-parser')
const { title } = require('process')
const app = express()
const port = process.env.PORT || 5000

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('images'))
app.set('view engine', 'ejs')

// -------- MySQL ------------------
// ---------------------------------
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    passwor: '',
    database: 'node_crud_testing'
})

//----- Local file storage ------------
//-------------------------------------
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images")
    },
    filename: (req, file, cb) => {
        console.log(file)
        const ext = path.extname(file.originalname)
        const filepath = `upload/${Date.now()}${ext}`
        cb(
            null, filepath)
    }
})

const upload = multer({ storage: fileStorage })

// ----- Testing API call ----------
// ---------------------------------
app.get('/api', (req, res) => {
    res.json({
        success: 1,
        message: "This is to show that REST API is working ...."
    })
})

// ---- Testing Upload EJS --------
// --------------------------------
app.get('/upload', (req, res) => {
    res.render('upload')
})

// ------- Multipart form ----------
//----------------------------------
var multipleUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'title' },
    { name: 'description' },
    { name: 'painrate' },
    { name: 'fluid_drain' },
    { name: 'redness' },
    { name: 'swelling' },
    { name: 'odour' },
    { name: 'fever' }
])

// ------ API Route to upload new entry form --------
// --------------------------------------------------
app.post('/upload/newform', multipleUpload, (req, res) => {
    if (req.files.image) {

        console.log(req.files)

        // Values from the form
        const uploadedImage = 'http://10.210.29.2:5000/' + req.files.image[0].filename
        const uploadedTitle = req.body.title
        const uploadedDescription = req.body.description
        const uploadedPainrate = req.body.painrate
        const uploadedFluidDrain = req.body.fluid_drain
        const uploadedRedness = req.body.redness
        const uploadedSwelling = req.body.swelling
        const uploadedOdour = req.body.odour
        const uploadedFever = req.body.fever

        // Params to insert into MySQL table
        const params = {
            progressImage: uploadedImage,
            progressTitle: uploadedTitle,
            progressDescription: uploadedDescription,
            quesFluid: uploadedPainrate,
            quesPain: uploadedFluidDrain,
            quesRedness: uploadedRedness,
            quesSwelling: uploadedSwelling,
            quesOdour: uploadedOdour,
            quesFever: uploadedFever,
            doctorAssigned: "Assigning doctor soon...",
        }

        console.log(params)

        pool.getConnection((err, connection) => {

            if (err) {
                console.log(err);
                res.sendStatus(500);
                return;
            }

            let query = 'INSERT INTO progress_book_entry SET ?'
            connection.query(query, params, (err, rows) => {
                connection.release()
                let response = `New image details with id '${rows.insertId}' has been added.`

                if (!err) {
                    res.send({
                        success: true,
                        message: response
                    })
                } else {
                    console.log(err.message)
                }
            })

            console.log(req.body)
        })

    } else {
        res.send({
            success: false,
            message: 'Please upload an image!'
        })
    }
})

// ----- Get all progress entry data ---------- 
// --------------------------------------------
app.get('/books/progress', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        connection.query('SELECT * FROM progress_book_entry WHERE flag = 1', (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send({ "result": rows })
            } else {
                console.log(err)
            }
        })
    })
})

// ------ API to Get progress entry by entryID --------
// ----------------------------------------------------
app.get('/books/progress/:entryid', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err

        // query(sqlString, callback)
        connection.query('SELECT * FROM progress_book_entry WHERE entryID = ?', [req.params.entryid], (err, rows) => {
            connection.release()

            if (!err) {
                console.log(rows)
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// ---------- Get all dummy users ----------
// -----------------------------------------
app.get('', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        connection.query('SELECT * FROM users', (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// ---------- Get user by ID ---------------
// -----------------------------------------
app.get('/:id', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err

        // query(sqlString, callback)
        connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(`Error message : ${err.message}`)
            }
        })
    })
})

// ---------- Delete user by ID   ----------
// -----------------------------------------
app.delete('/:id', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        //console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(`User with record ID: ${[req.params.id]} has been deleted.`)
            } else {
                console.log(err)
            }
        })
    })
})

// Add a record 
app.post('', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        //console.log(`connection as id ${connection.threadId}`)

        const params = req.body
        console.log(params)

        // query(sqlString, callback)
        connection.query('INSERT INTO users SET ?', params, (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(`User with record name: ${params.name} has been added.`)
            } else {
                console.log(err)
            }
        })

        console.log(req.body)
    })
})

// Update a record
// A bit tricky
app.put('', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        //console.log(`connection as id ${connection.threadId}`)

        const params = req.body
        const { id, name, tagline, image } = req.body

        connection.query('UPDATE users SET name = ?, tagline = ?, image = ? WHERE id = ?', [name, tagline, image, id], (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(`User with record name: ${name} has been updated.`)
            } else {
                console.log(err)
            }
        })

        console.log(req.body)
    })
})

app.listen(port, () => console.log(` Server listenining on port ${port}...`))