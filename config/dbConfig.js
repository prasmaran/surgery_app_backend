const mysql = require("mysql");
require("dotenv").config();

const pool = mysql.createPool({
	connectionLimit: 10,
	connectTimeout: 60 * 60 * 1000,
	acquireTimeout: 60 * 60 * 1000,
	timeout: 60 * 60 * 1000,
	host: "194.163.35.201",
	user: "u241363627_pras9999",
	password: "Pras9999",
	database: "u241363627_nodecrudapp",

	// host            : process.env.DB_HOST_REMOTE,
	// user            : process.env.DB_USER_REMOTE,
	// password        : process.env.DB_PASS_REMOTE,
	// database        : process.env.MYSQL_DB_REMOTE
});

module.exports = pool;
