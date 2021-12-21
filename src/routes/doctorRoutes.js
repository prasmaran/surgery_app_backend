const express = require('express')
const router = express.Router()
const pool = require('../../config/dbConfig.js')
const { checkToken } = require('../../auth/token_validation.js')
const { doctor_get_allPatients, doctor_post_feedback, doctor_get_wound_feedback } = require('../controllers/doctorCOntroller.js')

/**
 * Routes to create
 * 1. Get all the assigned patients' records list
 * 2. Send feedback to patient wound images
 * 3. Retrieve the specific wound image feedback
 * 4. Check/Receive appointments notifications --> Under Progress
 */

/**
 * Get all assigned patients by doctor ID
 */
router.get('/getAllPatients/:doctorId', checkToken, doctor_get_allPatients)

/**
 * Post feedback to patients
 */
router.post('/sendFeedback', checkToken, doctor_post_feedback)

/**
 * Retrieve feedback by wound image ID
 */
router.get('/getFeedback/:woundImageID', checkToken, doctor_get_wound_feedback)

module.exports = router
