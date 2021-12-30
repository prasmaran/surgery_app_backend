const pool = require("./dbConfig.js");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const { delete_cloudinary_pdf } = require("../utils/deleteCloudinaryPdf.js");
const { deleteCloudImagesCronJob } = require("../utils/deleteCloudinaryImages.js");

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
const cronJob = function () {
	pool.getConnection((err, connection) => {
		if (err) throw err;
		console.log(`connection as id ${connection.threadId}`);

		// DELETE FROM products WHERE product_id=1;
		let title = "WILL BE DELETED BY CRON";
		let query = "UPDATE progress_book_entry SET progressDescription = ? WHERE flag = 0";
		connection.query(query, title, (err, rows) => {
			connection.release();
			if (!err) {
				const noOfRows = rows.affectedRows;
				console.log(`${noOfRows} rows updated successfully at ${Date()}`);
			} else {
				console.log(err);
			}
		});
	});
};

/**
 * Cron job to unsync files from pdf_generated folder
 * after creating all the PDFs requested by the user
 * every 3 hours
 */
const directory = path.join(__dirname, "../images/pdf_generated");

const unlink_generated_pdf = () => {
	fs.readdir(directory, (err, files) => {
		if (err) throw err;
		for (const file of files) {
			fs.unlink(path.join(directory, file), (err) => {
				if (err) throw err;
			});
		}
	});
};

// ---- EXECUTING CRON JOBS ----

/**
 * Unlink PDF in server
 * Cron: At minute 0 past every 4th hour
 */
const doCronUnlinkFiles = () =>
	cron.schedule(
		"0 */4 * * *",
		() => {
			console.log("About to delete the generated PDFs from server....");
			unlink_generated_pdf();
		},
		{ timezone: "Asia/Kuala_Lumpur" }
	);

/**
 * Delete PDF from Cloudinary storage
 * Cron: At minute 30 past every 4th hour
 */
const doCronDeleteCloudinaryPDF = () =>
	cron.schedule(
		"30 */4 * * *",
		() => {
			console.log("About to delete the generated PDFs from Cloudinary....");
			delete_cloudinary_pdf();
		},
		{ timezone: "Asia/Kuala_Lumpur" }
	);

/**
 * Delete Images from Cloudinary
 * before deleting rows from MySQL
 * At 03:30 a.m.
 */
const doCronDeleteCloudinaryImages = () =>
	cron.schedule(
		"30 3 * * *",
		() => {
			console.log("About to delete the images from Cloudinary....");
			deleteCloudImagesCronJob();
		},
		{ timezone: "Asia/Kuala_Lumpur" }
	);

/**
 * Delete db rows where flag = 0
 * At 03:33 a.m.
 */
const doCronTask = () =>
	cron.schedule(
		"33 3 * * *",
		() => {
			cronJob();
		},
		{ timezone: "Asia/Kuala_Lumpur" }
	);

module.exports = {
	doCronTask,
	doCronUnlinkFiles,
	doCronDeleteCloudinaryPDF,
	doCronDeleteCloudinaryImages,
};
