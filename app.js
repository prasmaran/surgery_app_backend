const express = require('express')
const mysql = require('mysql')
const path = require('path')
const multer = require('multer')
const { urlencoded } = require('body-parser')
const bodyParser = require('body-parser')
const { title } = require('process')
const port = process.env.APP_PORT || 5000
const bcrypt = require('bcrypt')

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('images'))
app.set('view engine', 'ejs')

require('dotenv').config()

const localhost = 'http://10.210.29.2:5000/'
const hostspot = "http://192.168.43.119/"
// -------- MySQL ------------------
// ---------------------------------
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB
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
        // Try making another folder
        // upload/public
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
    { name: 'fluid_drain' },
    { name: 'painrate' },
    { name: 'redness' },
    { name: 'swelling' },
    { name: 'odour' },
    { name: 'fever' }
])

// ------ API Route to upload new entry form --------
// --------------------------------------------------
app.post('/books/progress/upload', multipleUpload, (req, res) => {
    if (req.files.image) {

        console.log(req.files)

        // Values from the form
        const uploadedImage = localhost + req.files.image[0].filename
        const uploadedTitle = req.body.title
        const uploadedDescription = req.body.description
        const uploadedFluidDrain = req.body.fluid_drain
        const uploadedPainrate = req.body.painrate
        const uploadedRedness = req.body.redness
        const uploadedSwelling = req.body.swelling
        const uploadedOdour = req.body.odour
        const uploadedFever = req.body.fever

        // Params to insert into MySQL table
        const params = {
            progressImage: uploadedImage,
            progressTitle: uploadedTitle,
            progressDescription: uploadedDescription,
            quesFluid: uploadedFluidDrain,
            quesPain: uploadedPainrate,
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
app.get('/books/progress/getAll', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        connection.query('SELECT * FROM progress_book_entry WHERE flag = 1 ORDER BY dateCreated DESC', (err, rows) => {
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

// -------- Edit a progress entry ------------
var getFields = multer()
// ---------- Testing still ------------------
app.put('/books/progress/edit', getFields.none(), (req, res) => {

    const entryID = req.body.entryID
    const updatedTitle = req.body.title
    const updatedDescription = req.body.description
    const updatedPainrate = req.body.painrate
    const updatedFluidDrain = req.body.fluid_drain
    const updatedRedness = req.body.redness
    const updatedSwelling = req.body.swelling
    const updatedOdour = req.body.odour
    const updatedFever = req.body.fever

    // Params to insert into MySQL table
    const paramsArray = [
        updatedTitle,
        updatedDescription,
        updatedFluidDrain,
        updatedPainrate,
        updatedRedness,
        updatedSwelling,
        updatedOdour,
        updatedFever,
        entryID
    ]

    console.log(req.body)

    pool.getConnection((err, connection) => {

        if (err) throw err

        let updateQuery = 'UPDATE progress_book_entry SET progressTitle = ?, progressDescription = ?, quesFluid = ?, quesPain = ?, quesRedness = ?, quesSwelling = ?, quesOdour = ?,  quesFever = ? WHERE entryID = ?'

        connection.query(updateQuery, paramsArray, (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                let response = `Progress book with title ${updatedTitle} has been updated.`
                res.send({
                    success: true,
                    message: response
                })
            } else {
                res.send({
                    success: true,
                    message: err.message
                })
            }
        })

        console.log(req.body)
    })
})


// ---------- Delete progress book entry by ID   ----------
var getFieldsDelete = multer()
// --------------------------------------------------------
app.put('/books/progress/delete', getFieldsDelete.none(), (req, res) => {

    const entryID = req.body.entryID

    pool.getConnection((err, connection) => {
        if (err) throw err

        const deleteFlag = 0
        let query = `UPDATE progress_book_entry SET flag = ${deleteFlag} WHERE entryID = ?`
        connection.query(query, [entryID], (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                let response = `User with record ID: ${[entryID]} has been deleted.`
                res.send({
                    success: true,
                    message: response
                })
                console.log(response)
            } else {
                res.send({
                    success: false,
                    message: err.message
                })
            }
        })
    })
})

// ---------- Regitser User ----------------
/**
 * Done by Dept of Pathology 
 * Create users with unique ID and role to login
 * This is only for demo purposes
 */
app.post('/user/register', async (req, res) => {

    const username = req.body.username
    const ic_number = req.body.ic_number
    const gender = req.body.gender
    const type = req.body.type
    const password = req.body.password

    if (username && ic_number && gender && type && password) {

        try {
            const salt = await bcrypt.genSalt()
            const hashedPassword = await bcrypt.hash(password, salt)
            console.log(salt)
            console.log(hashedPassword)

            const params = {
                m_name: username,
                m_ic: ic_number,
                m_gender: gender,
                m_type: type,
                password: hashedPassword
            }

            pool.getConnection((err, connection) => {

                if (err) {
                    console.log(err);
                    res.sendStatus(500);
                    return;
                }

                let query = 'INSERT INTO user_master SET ?'
                connection.query(query, params, (err, rows) => {
                    connection.release()
                    let response = `New user details with name ${username} has been added.`

                    if (!err) {
                        res.send({
                            success: true,
                            message: response
                        })
                    } else {
                        console.log(err.message)
                    }
                })
            })
        } catch {
            res.status(500).send()
        }

    } else {
        res.send({
            success: false,
            message: "Please fill in all the fields!"
        })
    }
})

// ---------- Authenticate user ------------
// -----------------------------------------
app.post('/user/auth', async (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    /* Read on this article to 
       solve the timeout error
       https://stackoverflow.com/questions/36337755/node-js-async-request-with-timeout/36339780
       setTimeOut()
    */

    //setTimeout() 
    if (username && password) {
        pool.getConnection((err, connection) => {
            if (err) throw err
            connection.query('SELECT * FROM user_master WHERE m_name = ?', [username], async (err, results, fields) => {
                if (!err) {
                    if (results.length > 0) {
                        // const isValidPass = bcrypt.compareSync(password, hash);
                        // try with phone and emulator
                        // to test the server blocking
                        if (await bcrypt.compare(password, results[0].password)) {
                            res.send({
                                success : true,
                                message : `User : ${results[0].m_name} successfully logged in`,
                                result  : results
                                // return only the first user object
                            })
                            console.log(results)
                        } else {
                            res.send({
                                success : false,
                                message : `Incorrect Username or Password`,
                                result  : err
                            })
                        }
                    } else {
                        res.send({
                            success: false,
                            message: `Username or Registration ID not found`,
                            result : err
                        })
                    }
                    res.end();
                } else {
                    console.log(err)
                    throw err
                }
            });
        })
    } else {
        res.send({
            success: false,
            message: 'Please enter Username and Password!'
        });
        res.end();
    }
});

// ---------- Get all master users ----------
// -----------------------------------------
app.get('/users/getAll', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err

        // query(sqlString, callback)
        connection.query('SELECT * FROM user_master', (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
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

    const params = req.body
    const { id, name, email, phoneNumber } = req.body
    const paramsArray = [name, email, phoneNumber, id]

    pool.getConnection((err, connection) => {
        if (err) throw err
        //console.log(`connection as id ${connection.threadId}`)
        connection.query('UPDATE users SET name = ?, email = ?, phoneNumber = ? WHERE id = ?', paramsArray, (err, rows) => {
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