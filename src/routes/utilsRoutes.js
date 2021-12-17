const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const pool = require('../../config/config.js')
const {generate_and_upload} = require('../../utils/generateUploader.js')

router.get('/general', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err

        let query = `SELECT * FROM general_info`
        connection.query(query, (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send({
                    success: true,
                    message: "Successfully retrieved",
                    result: rows
                })

            } else {
                res.send({
                    success: false,
                    message: "Failed to fetch",
                    result: err.message
                })
            }
        })
    })
})

router.get('/getPdf/:entryID', async (req, res) => {

    const entryID = req.params.entryID
    let pdfData

    pool.getConnection((err, connection) => {
        if (err) throw err

        let query = `SELECT * FROM progress_book_entry WHERE entryID = ${entryID}`
        connection.query(query, async (err, rows) => {
            connection.release() // release the connection to pool

            pdfData = rows[0]
            if (err) {

                res.send({
                    success: false,
                    message: "Failed to fetch",
                    result: err.message
                })

            } else {

                let final_url = await generate_and_upload(pdfData)

                res.send({
                    success: true,
                    message: "Successfully retrieved",
                    result: `${final_url}`
                })

            }
        })
    })
})

module.exports = router