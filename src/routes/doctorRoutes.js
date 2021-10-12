const express = require('express')
const router = express.Router()
const pool = require('../../config/config.js')
const { checkToken } = require('../../auth/token_validation.js')

/**
 * Routes to create
 * 1. Get all the assigned patients' records list
 * 2. Send feedback to patient wound images
 * 2.1 Retrieve the specific wound image feedback
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
        let query4 = ' WHERE progress_book_entry.doctorAssigned = ? ORDER BY dateCreated DESC'
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
                        "patient_id": key,
                        "wound_images": sorted[key]
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


router.post('/sendFeedback', (req, res) => {

    const progressEntryID = req.body.progressEntryID
    const feedbackText = req.body.feedbackText
    const doctorID = req.body.doctorID
    const patientName = req.body.patientName

    // Params to insert into MySQL table
    const params = {
        progress_entry_id: progressEntryID,
        feedback_text: feedbackText,
        doctor_inCharge: doctorID
    }

    console.log(params)

    pool.getConnection((err, connection) => {

        if (err) {
            console.log(err);
            res.sendStatus(500);
            return;
        }

        let query = 'INSERT INTO wound_image_feedback SET ?'
        connection.query(query, params, (err, rows) => {
            connection.release()


            if (!err) {
                let response = `New feedback for patient ${patientName} has been sent.`
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

})

// ----- Get specific feedback list by wound image entry ID ---------- 
router.get('/getFeedback/:woundImageID', (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        // query(sqlString, callback)
        // https://www.mysqltutorial.org/mysql-inner-join.aspx
        let query = 'SELECT * FROM wound_image_feedback WHERE progress_entry_id = ?'
        let woundImageID = parseInt(req.params.woundImageID)
        connection.query(query, woundImageID, (err, rows) => {
            connection.release() 
            if (!err) {
                res.send({
                    success: true,
                    message: `Feedback for wound image: ${woundImageID}`,
                    result: rows
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
