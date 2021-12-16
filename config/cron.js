const pool = require('../config/config.js')
const cron = require('node-cron')

/**
 * Allowed fiels
 * ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
 */

/**
 * Cron job to schedule the 
 * progress_entry_book deletion of flag == 0
 * every day at 3.33a.m.
 */

const cronJob = function() {

    pool.getConnection((err, connection) => {

        if (err) throw err
        console.log(`connection as id ${connection.threadId}`)

        // DELETE FROM products WHERE product_id=1;
        let title = "Cron Job Testing Working Well"
        let query = 'UPDATE progress_book_entry SET progressDescription = ? WHERE flag = 0'
        connection.query(query, title, (err, rows) => {
            connection.release()
            if (!err) {
                const noOfRows = rows.affectedRows
                console.log(`${noOfRows} rows updated successfully at ${Date()}`)
            } else {
                console.log(err)
            }
        })
    })
}

const doCronTask = () => cron.schedule("33 3 * * *", () => {
    cronJob()
}, { timezone: "Asia/Kuala_Lumpur" }
)

module.exports = doCronTask


