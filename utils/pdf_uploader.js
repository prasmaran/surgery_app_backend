const { error } = require('winston')
const { cloudinary } = require('../config/cloudinary.js')

/**
 * Backup function
 * just in case the new Promise() failed
 */
const uploadPDFCloudinary = function (file) {

    let url = ""

    cloudinary.uploader.upload(
        file,
        { upload_preset: 'dev_patients' },
        //function (error, result) { console.log(result.secure_url, error); }
        (error, result) => {
            if (error) {
                return console.error(`Error: ${error}`)
            } else {
                url = result.secure_url
                console.log(`PDF UPLOADER FILE : ${url}`)
            }

            return url
        }
    )
}

const uploadPDF_v2 = (pdf) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            pdf,
            { upload_preset: 'patient_pdf' },
            (err, url) => {
                if (err) return reject(err);
                console.log(`Second method: ${url.secure_url}`)
                return resolve(url.secure_url);
            })
    });
}

module.exports = { uploadPDF_v2 }