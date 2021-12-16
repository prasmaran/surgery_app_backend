const pool = require('../../config/config.js')

const dummy_user_getAll = (req, res) => {

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
}

const dummy_user_getOne = (req, res) => {

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
}

const dummy_user_delete = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        //console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(`User with record ID: ${[req.params.id]} has been deleted.`)
                console.log(rows)
            } else {
                console.log(err)
            }
        })
    })
}

const dummy_user_create = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        //console.log(`connection as id ${connection.threadId}`)

        const params = req.body
        //console.log(params)

        // query(sqlString, callback)
        connection.query('INSERT INTO users SET ?', params, (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(`User with record name: ${params.name} has been added.`)
                console.log(rows)
            } else {
                res.send(`Error: ${err.sqlMessage.slice(0,-16)} found. Please try again.`)
                console.log(err.sqlMessage)
            }
        })

        console.log(req.body)
    })
}

const dummy_user_update = (req, res) => {

    const params = req.body
    const { id, name, email, phoneNumber } = req.body

    let updateDate = new Date().toISOString().slice(0, 19).replace('T', ' ')

    const paramsArray = [name, email, phoneNumber, updateDate, id]

    pool.getConnection((err, connection) => {
        if (err) throw err
        //console.log(`connection as id ${connection.threadId}`)
        connection.query('UPDATE users SET name = ?, email = ?, phoneNumber = ?, dateUpdated = ? WHERE id = ?', paramsArray, (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                res.send(`User with record name: ${name} has been updated at ${Date()}.`)
            } else {
                console.log(err)
            }
        })
        
        console.log(req.body)
        console.log(new Date().toISOString().slice(0, 19).replace('T', ' '))
    })
}

module.exports = {
    dummy_user_getAll,
    dummy_user_getOne,
    dummy_user_delete, 
    dummy_user_create,
    dummy_user_update
}