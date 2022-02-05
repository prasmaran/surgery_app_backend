require("dotenv").config();
const pool = require("../../config/dbConfig.js");
const bcrypt = require("bcrypt");
const { userCreateLogger, userLoginLogger } = require("../../config/loggerUpdated.js");
const jwt = require("jsonwebtoken");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const client = new twilio(accountSid, authToken);

/**
 * Controller for User_Master_Routes
 */

const user_master_register = async (req, res) => {
	const username = req.body.username;
	const ic_number = req.body.ic_number;
	const gender = req.body.gender;
	const type = req.body.type;
	const password = req.body.password;

	if (username && ic_number && gender && type && password) {
		try {
			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(password, salt);
			console.log(salt);
			console.log(hashedPassword);

			const params = {
				m_name: username,
				m_ic: ic_number,
				m_gender: gender,
				m_type: type,
				password: hashedPassword,
			};

			pool.getConnection((err, connection) => {
				if (err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}

				let query = "INSERT INTO user_master SET ?";
				connection.query(query, params, (err, rows) => {
					connection.release();
					if (!err) {
						let response = `New user details with {name: ${username} and ID: ${rows.insertId}} has been added.`;
						res.send({
							success: true,
							message: response,
						});
						console.log(rows);
						userCreateLogger.info(response);
					} else {
						console.log(err);
						res.send({
							success: false,
							message: `Error: ${err.sqlMessage} found. Please try again.`,
						});
						userCreateLogger.error(`${err.message} for User: ${username}`);
					}
				});
			});
		} catch {
			res.status(500).send();
		}
	} else {
		res.send({
			success: false,
			message: "Please fill in all the fields!",
		});
	}
};

const user_master_auth = async (req, res) => {
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
			if (err) throw err;
			connection.query(
				"SELECT * FROM user_master WHERE m_name = BINARY ?",
				[username],
				async (err, results, fields) => {
					if (!err) {
						if (results.length > 0) {
							// const isValidPass = bcrypt.compareSync(password, hash);
							// try with phone and emulator
							// to test the server blocking
							if (await bcrypt.compare(password, results[0].password)) {
								const user = { name: username };
								const accessToken = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
									expiresIn: "1h",
								});
								const response = `User ${results[0].m_name} successfully logged in`;
								res.send({
									success: true,
									message: response,
									result: results,
									accessToken: accessToken,
									// return only the first user object
								});
								userLoginLogger.info(response);
							} else {
								const response = `User ${results[0].m_name} with wrong password combination`;
								res.send({
									success: false,
									message: `Incorrect Username or Password`,
									result: err,
								});
								userLoginLogger.error(response);
							}
						} else {
							//logger.log(`error`,`Username or Registration ID not found`)
							res.send({
								success: false,
								message: `Username or Registration ID not found`,
								result: err,
							});
						}
						res.end();
					} else {
						console.log(err);
						throw err;
					}
				}
			);
		});
	} else {
		res.send({
			success: false,
			message: "Please enter Username and Password!",
		});
		res.end();
	}
};

const user_master_twilio_OTP = (req, res) => {
	const userRegistrationID = req.body.userRegistrationID;
	const toUser = req.body.toUser;

	pool.getConnection((err, connection) => {
		//if (err) throw err;
		connection.query(
			"SELECT m_id, m_name, m_ic, m_contact1, m_contact2 FROM user_master WHERE m_ic = ?",
			userRegistrationID,
			(err, results, fields) => {
				if (!err) {
					if (results.length > 0) {
						if (results[0].m_contact1 == toUser || results[0].m_contact2 == toUser) {
							client.verify
								.services(process.env.TWILIO_SERVICE_ID)
								.verifications.create({
									to: `+6${toUser}`,
									channel: "sms",
								})
								.then((data) => {
									res.send({
										success: true,
										message: `Verification is sent to ${toUser}`,
										result: data.sid,
									});
								})
								.catch((err) => {
									res.send({
										success: false,
										message: `Verification is not sent to ${toUser}`,
										result: err.status,
									});
								});
						} else {
							const response = `Patient with phone number ${results[0].m_contact1} not found`;
							res.send({
								success: false,
								message: `Registration ID or phone number not found`,
								result: err,
							});
							// userLoginLogger.error(response);
						}
					} else {
						//logger.log(`error`,`Username or Registration ID not found`)
						res.send({
							success: false,
							message: `Registration ID or phone number not found`,
							result: err,
						});
					}
				} else {
					console.log(err);
					throw err;
				}
			}
		);
	});
};

const user_master_twilio_verify = (req, res) => {
	const toUser = req.body.toUser;
	const verifyToken = req.body.verifyToken;

	if (toUser && verifyToken.length === 4) {
		client.verify
			.services(process.env.TWILIO_SERVICE_ID)
			.verificationChecks.create({
				to: toUser,
				code: verifyToken,
			})
			.then((data) => {
				if (data.status === "approved") {
					res.status(200).send({
						success: true,
						message: "User is Verified!!",
						data,
					});
				} else {
					res.status(401).send({
						success: false,
						message: "Not Verified. Try again",
						data,
					});
				}
			});
	} else {
		res.status(400).send({
			message: "Wrong phone number or code :(",
			phonenumber: toUser,
		});
	}
};

const user_reset_password = async (req, res) => {
	const userRegistration = req.body.userRegistration;
	const password = req.body.password;
	const password1 = req.body.password1;
	const updatedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

	if (userRegistration && password && password1 && password == password1) {
		try {
			const salt = await bcrypt.genSalt();
			const hashedPassword = await bcrypt.hash(password, salt);
			console.log(password);
			console.log(salt);
			console.log(hashedPassword);

			const paramsArray = [hashedPassword, updatedDate, userRegistration];

			pool.getConnection((err, connection) => {
				if (err) {
					console.log(err);
					res.sendStatus(500);
					return;
				}

				let query = "UPDATE user_master SET password = ?, updated_at = ? WHERE m_ic = ?";
				connection.query(query, paramsArray, (err, rows) => {
					connection.release();
					if (!err) {
						let response = `Password has been reset successfully`;
						res.status(200).send({
							success: true,
							message: response,
						});
					} else {
						console.log(err);
						res.status(501).send({
							success: false,
							message: `Error: ${err.sqlMessage} found. Please try again.`,
						});
					}
				});
			});
		} catch {
			res.status(500).send();
		}
	} else {
		res.send({
			success: false,
			message: "Please fill in all the fields!",
		});
	}
};

const user_master_update_details = (req, res) => {
	const userContact1 = req.body.userContact1;
	const userContact2 = req.body.userContact2;
	const userID = req.body.userID;

	const updatedDate = new Date().toISOString().slice(0, 19).replace("T", " ");

	const paramsArray = [userContact1, userContact2, updatedDate, userID];

	console.log(paramsArray);

	pool.getConnection((err, connection) => {
		if (err) throw err;

		let query = "UPDATE user_master SET m_contact1 = ?, m_contact2 = ?, updated_at = ? WHERE m_id = ?";
		connection.query(query, paramsArray, (err, rows) => {
			connection.release(); // release the connection to pool

			if (!err) {
				res.send({
					success: true,
					message: "Details have been updated successfully!",
				});
				//console.log(rows)
			} else {
				res.send({
					success: false,
					message: "Update failed. Please try again later!",
				});
				console.log(err);
			}
		});
	});
};

const user_master_getAll = (req, res) => {
	pool.getConnection((err, connection) => {
		if (err) throw err;

		// query(sqlString, callback)
		connection.query("SELECT * FROM user_master", (err, rows) => {
			connection.release(); // release the connection to pool

			if (!err) {
				res.send(rows);
			} else {
				console.log(err);
			}
		});
	});
};

module.exports = {
	user_master_update_details,
	user_master_getAll,
	user_master_auth,
	user_master_register,
	user_master_twilio_OTP,
	user_master_twilio_verify,
	user_reset_password,
};
