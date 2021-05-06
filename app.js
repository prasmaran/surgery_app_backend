const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const { urlencoded } = require('body-parser')

const app = express()
const port = process.env.PORT || 5000

app.use(express.urlencoded({extended: true}));
app.use(express.json());

// MySQL
const pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'node_crud_testing'
})

// Get all users 
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

// Get user by Id
app.get('/:id', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        //console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }
        })
    })
})

// Delete a record 
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

// Listen on PORT
app.listen(port, () => console.log(` Server listenining on port ${port}...`))