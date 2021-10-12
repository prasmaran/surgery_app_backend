const express = require('express')
const router = express.Router()
const multer = require('multer')
const pool = require('../../config/config.js')
const upload = require('../../config/fileStorage.js')
const { checkToken } = require('../../auth/token_validation.js')

// Server path
const localhost = 'http://192.168.1.107:5000/' // http://192.168.43.119:5000
const hostspot = "http://192.168.43.119/"

// ------- Multipart form ----------
//----------------------------------
var multipleUpload = upload.fields([
    { name: 'masterUserId_fk' },
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
router.post('/upload', checkToken, multipleUpload, (req, res) => {
    if (req.files.image) {

        console.log(req.files)

        // Values from the form
        // testnig masteruserid_fk
        const masterUserId_fk = req.body.masterUserId_fk
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
            masterUserId_fk: masterUserId_fk,
            progressImage: uploadedImage,
            progressTitle: uploadedTitle,
            progressDescription: uploadedDescription,
            quesFluid: uploadedFluidDrain,
            quesPain: uploadedPainrate,
            quesRedness: uploadedRedness,
            quesSwelling: uploadedSwelling,
            quesOdour: uploadedOdour,
            quesFever: uploadedFever,
            doctorAssigned: 21
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
                

                if (!err) {
                    let response = `New image details with ID: ${rows.insertId} has been added.`
                    res.send({
                        success: true,
                        message: response
                    })
                } else {
                    console.log(err)
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

// ----- Get all progress entry data by userId ---------- 
router.get('/getAll/:userId', checkToken, (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`) 

        // query(sqlString, callback)
        connection.query('SELECT * FROM progress_book_entry WHERE masterUserId_fk = ? AND flag = 1 ORDER BY dateCreated DESC', [req.params.userId],(err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                console.log("Number of photos returned: " + Object.keys(rows).length)
                res.send({
                    success: true,
                    message: "Progress book for the user",  
                    result : rows 
                })
            } else {
                console.log(err)
                res.send({
                    success: false,
                    message: "Could not fetch the progress book",  
                    result : null 
                })
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