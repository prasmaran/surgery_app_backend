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

const utils_get_appointments = (req, res) => {
	const userType = req.params.userType;
	const userID = req.params.userID;
	let finalQuery;

	pool.getConnection((err, connection) => {
		if (err) throw err;

		if (userType == "P") {
			let query1 = "SELECT user_master.m_name AS with_name, user_master.m_ic, appointment.*";
			let query2 = " FROM appointment";
			let query3 = " INNER JOIN user_master ON user_master.m_id = appointment.doctor_id";
			let query4 = " WHERE appointment.patient_id = ?";
			let query5 = " ORDER BY appointment.appointment_date";
			finalQuery = query1 + query2 + query3 + query4 + query5;
		} else {
			let query1 = "SELECT user_master.m_name AS with_name, user_master.m_ic, appointment.*";
			let query2 = " FROM appointment";
			let query3 = " INNER JOIN user_master ON user_master.m_id = appointment.patient_id";
			let query4 = " WHERE appointment.doctor_id = ?";
			let query5 = " ORDER BY appointment.appointment_date";
			finalQuery = query1 + query2 + query3 + query4 + query5;
		}

		let userID_Int = parseInt(userID);
		connection.query(finalQuery, userID_Int, (err, rows) => {
			connection.release();

			if (!err) {
				if (rows.length > 0) {
					res.send({
						success: true,
						message: "Your current appointments",
						result: rows,
					});
				} else {
					res.send({
						success: false,
						message: "No appointments",
						result: rows,
					});
				}
			} else {
				res.send({
					success: false,
					message: "Failed to fetch",
					result: err,
				});
			}
		});
	});
};

module.exports = {
	utils_get_general_articles,
	utils_get_generated_wound_pdf,
	utils_get_appointments,
};
