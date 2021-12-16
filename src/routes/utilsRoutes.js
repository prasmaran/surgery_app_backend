const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const pool = require('../../config/config.js')

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

module.exports = router