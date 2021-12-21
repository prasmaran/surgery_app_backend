const express = require('express')
const router = express.Router()
const {generate_and_upload} = require('../../utils/generateUploader.js')
const { utils_get_general_articles, utils_get_generated_wound_pdf } = require('../controllers/utilsController.js')

/**
 * Patients to get general articles
 * on pre and post surgery
 * to aid them in healing
 */
router.get('/general', utils_get_general_articles)

/**
 * To generate PDF version
 * of requested wound image by patient
 */
router.get('/getPdf/:entryID', utils_get_generated_wound_pdf)

module.exports = router