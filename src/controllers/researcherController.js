const express = require('express')
const router = express.Router()
const pool = require('../../config/dbConfig.js')
const { checkToken } = require('../../auth/token_validation.js')

// Function to merge same userID
const groupBy = keys => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = keys.map(key => obj[key]).join(':');
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {})


const researcher_get_allPatients = (req, res) => {

    pool.getConnection((err, connection) => {
        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        let query1 = 'SELECT user_master.m_name, user_master.m_ic, progress_book_entry.*'
        let query2 = ' FROM user_master'
        let query3 = ' INNER JOIN progress_book_entry ON user_master.m_id = progress_book_entry.masterUserId_fk'
        let query4 = ' WHERE progress_book_entry.flag > 0'
        let query5 = ' ORDER BY dateCreated DESC'
        let finalQuery = query1 + query2 + query3 + query4 + query5
        
        connection.query(finalQuery, (err, rows) => {
            connection.release()

            if (!err) {
                const groupBy_PatientName_ID = groupBy(['masterUserId_fk', 'm_name'])
                console.log("Number of records returned: " + Object.keys(rows).length)
                const sorted = groupBy_PatientName_ID(rows)

                //console.log(sorted)

                const resultArray = []

                for (const key in sorted) {
                    resultArray.push({
                        "patient_id": key,
                        "wound_images": sorted[key]
                    })
                }

                res.send({
                    success: true,
                    message: `All available patient data`,
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


const researcher_get_wound_feedback = (req, res) => {

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
}

module.exports = {
    researcher_get_allPatients,
    researcher_get_wound_feedback
}