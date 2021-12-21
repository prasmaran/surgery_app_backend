const express = require('express')
const pool = require('../../config/dbConfig.js')

// Function to merge same userID
const groupBy = keys => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = keys.map(key => obj[key]).join(':');
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {})


const doctor_get_allPatients = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        let query1 = 'SELECT user_master.m_name, user_master.m_ic, progress_book_entry.*'
        let query2 = ' FROM user_master'
        let query3 = ' INNER JOIN progress_book_entry ON user_master.m_id = progress_book_entry.masterUserId_fk'
        let query4 = ' WHERE progress_book_entry.doctorAssigned = ? AND progress_book_entry.flag > 0'
        let query5 = ' ORDER BY dateCreated DESC'
        let finalQuery = query1 + query2 + query3 + query4 + query5
        let doctorId = parseInt(req.params.doctorId)
    
        connection.query(finalQuery, doctorId, (err, rows) => {
            connection.release() 

            if (!err) {
                // Remove duplicates
                // const groupByPatientName = groupBy(['dummy_userID'])
                const groupBy_PatientName_ID = groupBy(['masterUserId_fk', 'm_name'])
                console.log("Number of records returned: " + Object.keys(rows).length)
                const sorted = groupBy_PatientName_ID(rows)

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
}


const doctor_post_feedback = (req, res) => {

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

}


const doctor_get_wound_feedback = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

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
}


module.exports = {
    doctor_get_allPatients,
    doctor_post_feedback,
    doctor_get_wound_feedback
}
