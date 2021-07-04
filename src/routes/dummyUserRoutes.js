const express = require('express')
const router = express.Router()
const pool = require('../../config/config.js')

// ---------- Get all dummy users ----------
// -----------------------------------------
router.get('/getAll', (req, res) => {

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
router.get('/getOne/:id', (req, res) => {

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
router.delete('/delete/:id', (req, res) => {

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
router.post('/create', (req, res) => {

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
router.put('/update', (req, res) => {

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

module.exports = router