const path = require('path')
const multer = require('multer')

//----- Local file storage ------------
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images")
    },
    filename: (req, file, cb) => {
        console.log(file)
        const ext = path.extname(file.originalname)
        // Try making another folder
        // upload/public
        // upload/patient
        const filepath = `patient/${Date.now()}${ext}`
        cb(
            null, filepath)
    }
})

const upload = multer({ storage: fileStorage })

module.exports = upload
