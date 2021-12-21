const express = require('express')
const router = express.Router()
const pool = require('../../config/dbConfig.js')
const { checkToken } = require('../../auth/token_validation.js')
const { researcher_get_allPatients, researcher_get_wound_feedback } = require('../controllers/researcherController.js')


// Function to merge same userID
const groupBy = keys => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = keys.map(key => obj[key]).join(':');
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {})

// ----- Get all progress entry data by userId ---------- 
router.get('/getAllPatients', checkToken, researcher_get_allPatients)

// ----- Get specific feedback list by wound image entry ID ---------- 
router.get('/getFeedback/:woundImageID', checkToken, researcher_get_wound_feedback)

module.exports = router
