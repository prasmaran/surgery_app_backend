const express = require('express')
const router = express.Router()
const multer = require('multer')
const pool = require('../../config/dbConfig.js')
const { upload } = require('../../config/fileStorage.js')
const { checkToken } = require('../../auth/token_validation.js')
const { cloudinary } = require('../../config/cloudinary.js')
const cloudinaryMulter = require('../../config/cloudinaryMulter.js')
const sharp = require('sharp')
const path = require('path')
const { dirname } = require('path')
const { bufferToStream } = require('../../utils/utils.js')


const progress_book_upload = async (req, res) => {

    if (!req.files.image || !req.body.masterUserId_fk || !req.body.title ||
        !req.body.description || !req.body.fluid_drain || !req.body.painrate ||
        !req.body.redness || !req.body.swelling || !req.body.odour || !req.body.fever)
        return res.send({
            success: false,
            message: 'Please fill in all fields!'
        })

    // Values from the form
    // testing masteruserid_fk
    const masterUserId_fk = req.body.masterUserId_fk
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
        progressImage: null,
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

    // Reducing image quality for performance + better storage
    const data = await sharp(req.files.image[0].path).jpeg({
        quality: 50,
        chromaSubsampling: '4:4:4'
    }).toBuffer()

    console.log(req.files.image[0].path)
    var secureURL = ""
    try {
        const resultData = cloudinary.uploader.upload_stream(
            { upload_preset: 'dev_patients' },
            (error, result) => {
                if (error) {
                    return console.error(`Error: ${error}`)
                } else {
                    console.log(result)
                    secureURL = result.secure_url
                    params.progressImage = secureURL
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
                    })
                    return console.log(`URL: ${secureURL}`)
                }
            }
        )
        bufferToStream(data).pipe(resultData)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const progress_book_upload_backup = (req, res) => {
    if (req.files.image) {

        console.log(req.files)

        // Values from the form
        // testing masteruserid_fk
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
}

const progress_book_get_all = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        connection.query('SELECT * FROM progress_book_entry WHERE masterUserId_fk = ? AND flag = 1 ORDER BY dateUpdated DESC', [req.params.userId], (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                console.log("Number of photos returned: " + Object.keys(rows).length)
                res.send({
                    success: true,
                    message: "Progress book for the user",
                    result: rows
                })
            } else {
                console.log(err)
                res.send({
                    success: false,
                    message: "Could not fetch the progress book",
                    result: null
                })
            }
        })
    })
}

const progress_book_edit = (req, res) => {


    if (!req.body.entryID || !req.body.title ||
        !req.body.description || !req.body.fluid_drain || !req.body.painrate ||
        !req.body.redness || !req.body.swelling || !req.body.odour || !req.body.fever)
        return res.send({
            success: false,
            message: 'Please fill in all fields!'
        })


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

    let updatedDate = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const paramsArray = [
        updatedTitle,
        updatedDescription,
        updatedFluidDrain,
        updatedPainrate,
        updatedRedness,
        updatedSwelling,
        updatedOdour,
        updatedFever,
        updatedDate,
        entryID
    ]

    pool.getConnection((err, connection) => {

        if (err) throw err

        let updateQuery = 'UPDATE progress_book_entry SET progressTitle = ?, progressDescription = ?, quesFluid = ?, quesPain = ?, quesRedness = ?, quesSwelling = ?, quesOdour = ?,  quesFever = ?, dateUpdated = ? WHERE entryID = ?'

        connection.query(updateQuery, paramsArray, (err, rows) => {
            connection.release()

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
}

const progress_book_get_allArchived = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        connection.query('SELECT * FROM progress_book_entry WHERE masterUserId_fk = ? AND flag = 2 ORDER BY dateCreated DESC', [req.params.userId], (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                console.log("Number of archived photos returned: " + Object.keys(rows).length)
                res.send({
                    success: true,
                    message: "Archived entries list",
                    result: rows
                })
            } else {
                console.log(err)
                res.send({
                    success: false,
                    message: "Could not fetch the archived list",
                    result: null
                })
            }
        })
    })
}

const progress_book_get_one = (req, res) => {

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
}

const progress_book_delete = (req, res) => {

    const entryID = req.body.entryID

    pool.getConnection((err, connection) => {
        if (err) throw err

        /**
         * Delete flag  - 0
         * Active flag  - 1
         * Archive flag - 2
         */
        const deleteFlag = 0
        let query = `UPDATE progress_book_entry SET flag = 0 WHERE entryID = ?`
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
}

const progress_book_archive_entry = (req, res) => {

    const entryID = req.body.entryID
    const prevFlag = req.body.prevFlag

    console.log(entryID)
    console.log(prevFlag)

    pool.getConnection((err, connection) => {
        if (err) throw err

        /**
         * Delete flag  - 0
         * Active flag  - 1
         * Archive flag - 2
         */

        if (prevFlag == "1") {

            let query = `UPDATE progress_book_entry SET flag = 2 WHERE entryID = ?`
            connection.query(query, [entryID], (err, rows) => {
                connection.release() // release the connection to pool

                if (!err) {
                    let response = `User with record ID: ${[entryID]} has been archived.`
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
        } else {

            let query = `UPDATE progress_book_entry SET flag = 1 WHERE entryID = ?`
            connection.query(query, [entryID], (err, rows) => {
                connection.release() // release the connection to pool

                if (!err) {
                    let response = `User with record ID: ${[entryID]} has been restored.`
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
        }

    })
}

const progress_book_delete_wound_noFeedback = (req, res) => {

    const entryID = req.body.entryID
    const entryID_Int = parseInt(entryID)

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        let query1 = 'UPDATE progress_book_entry SET progress_book_entry.flag = 0'
        let query2 = ' WHERE progress_book_entry.entryID = ?'
        let query3 = ' AND EXISTS ( SELECT 1 FROM wound_image_feedback WHERE wound_image_feedback.progress_entry_id = ? )'
        let q4 = `UPDATE progress_book_entry SET progress_book_entry.flag = 0 WHERE progress_book_entry.entryID = ${entryID_Int} AND NOT EXISTS (SELECT 1 FROM wound_image_feedback WHERE wound_image_feedback.progress_entry_id = ${entryID_Int})`
        let finalQuery = query1 + query2 + query3

        //console.log(finalQuery)
        connection.query(q4, (err, rows) => {
            connection.release()

            if (!err) {

                console.log(rows)

                if (rows.affectedRows > 0) {

                    res.send({
                        success: true,
                        message: `Successfully deleted Image ID: ${entryID} from the list`
                    })

                } else {

                    res.send({
                        success: false,
                        message: `Cannot delete because it has feedback from your doctor`
                    })
                }

            } else {
                console.log(err)
                res.send({
                    success: false,
                    message: err,
                    result: null
                })
            }
        })
    })
}

module.exports = {
    progress_book_upload,
    progress_book_upload_backup,
    progress_book_get_all,
    progress_book_edit,
    progress_book_get_allArchived,
    progress_book_get_one,
    progress_book_delete,
    progress_book_archive_entry,
    progress_book_delete_wound_noFeedback
}
