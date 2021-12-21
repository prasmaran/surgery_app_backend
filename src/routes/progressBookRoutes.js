const express = require('express')
const router = express.Router()
const multer = require('multer')
const pool = require('../../config/dbConfig.js')
const { upload } = require('../../config/fileStorage.js')
const { checkToken } = require('../../auth/token_validation.js')
const { cloudinary } = require('../../config/cloudinary.js')
const cloudinaryMulter = require('../../config/cloudinaryMulter.js')
const sharp = require('sharp')
const path = require('path')
const {
    progress_book_upload,
    progress_book_upload_backup,
    progress_book_get_all,
    progress_book_get_allArchived,
    progress_book_get_one,
    progress_book_edit, 
    progress_book_delete,
    progress_book_archive_entry,
    progress_book_delete_wound_noFeedback} = require('../controllers/progressBookController.js')

// ------- Multipart form ----------
//----------------------------------
var multipleUpload = upload.fields([
    { name: 'masterUserId_fk' },
    { name: 'image', maxCount: 1 },
    { name: 'title' },
    { name: 'description' },
    { name: 'fluid_drain' },
    { name: 'painrate' },
    { name: 'redness' },
    { name: 'swelling' },
    { name: 'odour' },
    { name: 'fever' }
])

var cloudinaryUpload = cloudinaryMulter.fields([
    { name: 'masterUserId_fk' },
    { name: 'image', maxCount: 1 },
    { name: 'title' },
    { name: 'description' },
    { name: 'fluid_drain' },
    { name: 'painrate' },
    { name: 'redness' },
    { name: 'swelling' },
    { name: 'odour' },
    { name: 'fever' }
])

// ------ Cloudinary Image Upload Testing -----------
// --- Changed from test_cloudinary --> upload ------
router.post('/upload', cloudinaryUpload, progress_book_upload)

// --- API Route to upload new entry form ---
// --- Changed from upload --> upload2 ------
// --- Backup route for uploading -----------
router.post('/upload2', checkToken, multipleUpload, progress_book_upload_backup)

// ----- Get all progress entry data by userId ---------- 
router.get('/getAll/:userId', checkToken, progress_book_get_all)

// ----- Get all archived entries by userId ---------- 
router.get('/getAllArchived/:userId', checkToken, progress_book_get_allArchived)

// ------ API to Get progress entry by entryID --------
router.get('/:entryid', checkToken, progress_book_get_one)

// -------- Edit a progress entry ------------
var getFields = multer()
router.put('/edit', checkToken, getFields.none(), progress_book_edit)

// ---------- Delete progress book entry by ID   ----------
var getFieldsDelete = multer()
router.put('/delete', checkToken, getFieldsDelete.none(), progress_book_delete)

// -------- Archiving progress entry book by ID -----------
var getFieldsArchive = multer()
router.put('/archive', checkToken, getFieldsArchive.none(), progress_book_archive_entry)


/**
 * Delete progress book only if
 * the selected entry has no feedback
 * from any doctors
 * Check wound_feedback_table before deleting
 */
var getDeleteEntryNoFeedback = multer()
router.put('/deleteEntryNoFeedback', getDeleteEntryNoFeedback.none(), progress_book_delete_wound_noFeedback)

module.exports = router