const path = require('path')
const multer = require('multer')

//----- Local file storage ------------
module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter(req, file, cb) {
        let extTypes = [".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"]
        let ext = path.extname(file.originalname)
        if (!extTypes.includes(ext)) {
            cb(new Error("File type is not supported"), false)
            return
        }
        cb(null, true)
    }
})

