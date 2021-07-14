const express = require('express')
const router = express.Router()
const multer = require('multer')
const pool = require('../../config/config.js')
const upload = require('../../config/fileStorage.js')

// Server path
const localhost = 'http://10.210.29.2:5000/'
const hostspot = "http://192.168.43.119/"

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
router.post('/upload', multipleUpload, (req, res) => {
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
router.get('/getAll', (req, res) => {

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
router.get('/:entryid', (req, res) => {

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
router.put('/edit', getFields.none(), (req, res) => {

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
router.put('/delete', getFieldsDelete.none(), (req, res) => {

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


module.exports = router