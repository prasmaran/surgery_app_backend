const express = require("express");
const helmet = require("helmet");
const { urlencoded } = require("body-parser");
const { title } = require("process");
const port = process.env.PORT || 5000;
const path = require("path");
const { MongoClient } = require("mongodb");

// Import cron job functions
// Changingggg
const {
	doCronTask,
	doCronUnlinkFiles,
	doCronDeleteCloudinaryPDF,
	doCronDeleteCloudinaryImages,
	doCronKeepServerAlive,
} = require("./config/cron.js");

// Global middlware
const app = express();
// app.use(helmet())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("images"));

// Testing EJS for upload
app.set("view engine", "ejs");

// Importing routes
const dummyUserRoutes = require("./src/routes/dummyUserRoutes.js");
const userMasterRoutes = require("./src/routes/userMasterRoutes.js");
const progressBookRoutes = require("./src/routes/progressBookRoutes");
const doctorRoutes = require("./src/routes/doctorRoutes.js");
const utilsRoutes = require("./src/routes/utilsRoutes.js");
const researcherRoutes = require("./src/routes/researcherRoutes.js");

// Logger config
const { serverLogger } = require("./config/loggerUpdated.js");

app.get("/", (req, res) => {
	res.render("home");
});

// about page
app.get("/about", (req, res) => {
	res.render("pages/about");
});

app.get("/upload", (req, res) => {
	const filePath = __dirname;
	console.log(filePath);
	res.render("upload");
});

/**
 * Base API Routes
 * 1 --> Progress Book Routes
 * 2 --> User routes
 * 3 --> Doctor Routes
 * 4 --> Dummy User Routes : testing
 */

app.use("/books/progress", progressBookRoutes);
app.use("/user", userMasterRoutes);
app.use("/dummyUser", dummyUserRoutes);
app.use("/doctor", doctorRoutes);
app.use("/utils", utilsRoutes);
app.use("/researcher", researcherRoutes);

/**
 * Run the cron jobs
 * 1. Cloudinary delete PDF files
 * 2. Deleting PDFs from the server
 * 3. Deleting Images from the server
 * 4. Automating deleting DB rows
 * 5. Keep server alive for every 20 minutes
 */

doCronDeleteCloudinaryPDF();
doCronUnlinkFiles();
doCronDeleteCloudinaryImages();
doCronTask();
//doCronKeepServerAlive();

// app.listen(port, () => {
// 	console.log(` Server listenining on port ${port} ...`);
// 	serverLogger.info(`Server listenining on port ${port} at ${new Date()}`);
// });

MongoClient.connect(process.env.MONGODB, (err, client) => {
	if (err) {
		console.log("Error connecting to MongoDB:", err);
		return;
	}
	console.log("Connected to MongoDB");

	const db = client.db();
	
	// Start server after successful MongoDB connection
	app.listen(port, () => {
		console.log(` Server listening on port ${port} ...`);
		serverLogger.info(`Server listening on port ${port} at ${new Date()}`);
	});
});
