const express = require("express");
const pool = require("../../config/dbConfig.js");
const { generate_and_upload } = require("../../utils/generateUploader.js");

const utils_get_general_articles = (req, res) => {
	pool.getConnection((err, connection) => {
		if (err) throw err;

		let query = `SELECT * FROM general_info`;
		connection.query(query, (err, rows) => {
			connection.release(); // release the connection to pool

			if (!err) {
				res.send({
					success: true,
					message: "Successfully retrieved",
					result: rows,
				});
			} else {
				res.send({
					success: false,
					message: "Failed to fetch",
					result: err.message,
				});
			}
		});
	});
};

const utils_get_generated_wound_pdf = async (req, res) => {
	const entryID = req.params.entryID;
	let pdfData;

	pool.getConnection((err, connection) => {
		if (err) throw err;

		// TODO: Try to inner join with user name and contact numbers
		// FIXME : Fix this API route

		let query = `SELECT * FROM progress_book_entry WHERE entryID = ${entryID}`;
		connection.query(query, async (err, rows) => {
			connection.release(); // release the connection to pool

			pdfData = rows[0];
			if (err) {
				res.send({
					success: false,
					message: "Failed to fetch",
					result: err.message,
				});
			} else {
				let final_url = await generate_and_upload(pdfData);

				res.send({
					success: true,
					message: "Successfully retrieved",
					result: `${final_url}`,
				});
			}
		});
	});
};

module.exports = {
	utils_get_general_articles,
	utils_get_generated_wound_pdf,
};
