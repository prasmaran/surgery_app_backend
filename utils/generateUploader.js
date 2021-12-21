const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require("path");
const { uploadPDF_v2 } = require("./pdf_uploader.js");
const template = fs.readFileSync("./template-pdf/template.html", "utf-8");

/**
 * Function to generate and upload PDF
 * and return the URL to view the PDF
 */

const generate_and_upload = (patientData) => {
	return new Promise((resolve, reject) => {
		let url = "";

		const options = {
			format: "A4",
			orientation: "potrait",
			border: "10mm",
		};

		const document = {
			html: template,
			data: {
				title: patientData.progressTitle,
				description: patientData.progressDescription,
				patientId: patientData.masterUserId_fk,
				image: patientData.progressImage,
				painRate: patientData.quesPain,
				dateCreated: String(patientData.dateCreated),
			},
			path: `./images/pdf_generated/${
				patientData.entryID
			}-${Date.now()}-${patientData.masterUserId_fk}.pdf`,
		};
		pdf.create(document, options)
			.then(async (res) => {
				let filepath = String(res.filename);
				url = await uploadPDF_v2(filepath);
				//console.log(`Coming from Generate file : ${url}`)
				return resolve(url);
			})
			.catch((err) => {
				//console.log(err)
				return reject(`Error in generate file: ${err}`);
			});
	});
};

module.exports = { generate_and_upload };
