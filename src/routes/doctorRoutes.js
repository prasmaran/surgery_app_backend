const express = require('express')
const router = express.Router()
const pool = require('../../config/config.js')
const { checkToken } = require('../../auth/token_validation.js')

/**
 * Routes to create
 * 1. Get all the assigned patients' records list
 * 2. Send feedback to patient wound images
 * 3. Upadate profile
 * 4. Check/Receive appointments notifications
 */

// Function to merge same userID
const groupBy = keys => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = keys.map(key => obj[key]).join(':');
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {})

// ----- Get all progress entry data by userId ---------- 
router.get('/getAllPatients/:doctorId', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        // https://www.mysqltutorial.org/mysql-inner-join.aspx
        let query1 = 'SELECT user_master.m_name, user_master.m_ic, progress_book_entry.*'
        let query2 = ' FROM user_master'
        let query3 = ' INNER JOIN progress_book_entry ON user_master.m_id = progress_book_entry.masterUserId_fk'
        let query4 = ' WHERE progress_book_entry.doctorAssigned = ?'
        let finalQuery = query1 + query2 + query3 + query4
        let doctorId = parseInt(req.params.doctorId)
        //console.log(finalQuery)
        connection.query(finalQuery, doctorId, (err, rows) => {
            connection.release() // release the connection to pool

            if (!err) {
                // Remove duplicates
                // const groupByPatientName = groupBy(['dummy_userID'])
                const groupBy_PatientName_ID = groupBy(['masterUserId_fk', 'm_name'])
                console.log("Number of records returned: " + Object.keys(rows).length)
                const sorted = groupBy_PatientName_ID(rows)
                
                console.log(sorted)

                const resultArray = []
                
                for (const key in sorted) {
                    resultArray.push({
                        "patient_id" : key,
                        "wound_images" : sorted[key]
                    })
                }
                
                res.send({
                    success: true,
                    message: `Patients list for Doctor ID: ${doctorId}`,
                    result: resultArray
                })

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
})


module.exports = router
