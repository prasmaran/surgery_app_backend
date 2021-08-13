const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const pool = require('../../config/config.js')
const { userCreateLogger, userLoginLogger } = require('../../config/loggerUpdated.js')
const jwt = require('jsonwebtoken')

// ---------- Regitser User ----------------
/**
 * Done by Dept of Pathology 
 * Create users with unique ID and role to login
 * This is only for demo purposes
 */
router.post('/register', async (req, res) => {

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
                    if (!err) {
                        let response = `New user details with {name: ${username} and ID: ${rows.insertId}} has been added.`
                        res.send({
                            success: true,
                            message: response
                        })
                        console.log(rows)
                        userCreateLogger.info(response)
                    } else {            
                        console.log(err)
                        res.send({
                            success: false,
                            message: `Error: ${err.sqlMessage} found. Please try again.`
                        })
                        userCreateLogger.error(`${err.message} for User: ${username}`)
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
router.post('/auth', async (req, res) => {

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
            connection.query('SELECT * FROM user_master WHERE m_name = BINARY ?', [username], async (err, results, fields) => {
                if (!err) {
                    if (results.length > 0) {
                        // const isValidPass = bcrypt.compareSync(password, hash);
                        // try with phone and emulator
                        // to test the server blocking
                        if (await bcrypt.compare(password, results[0].password)) {
                            const user = { name: username }
                            const accessToken = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "2 days" })
                            const response = `User ${results[0].m_name} successfully logged in`
                            res.send({
                                success: true,
                                message: response,
                                result: results,
                                accessToken: accessToken
                                // return only the first user object
                            })
                            userLoginLogger.info(response)
                            console.log(results)
                        } else {
                            const response = `User ${results[0].m_name} with wrong password combination`
                            res.send({
                                success: false,
                                message: `Incorrect Username or Password`,
                                result: err
                            })
                            userLoginLogger.error(response)
                            
                        }
                    } else {
                        //logger.log(`error`,`Username or Registration ID not found`)
                        res.send({
                            success: false,
                            message: `Username or Registration ID not found`,
                            result: err
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
router.get('/getAll', (req, res) => {

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

module.exports = router