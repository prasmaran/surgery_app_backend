const express = require('express')
const multer = require('multer')
const router = express.Router()
const { checkToken } = require('../../auth/token_validation.js')
const {
    user_master_update_details,
    user_master_getAll,
    user_master_auth,
    user_master_register } = require('../controllers/userMasterController')

// ---------- Regitser User ----------------
/**
 * Done by Dept of Pathology 
 * Create users with unique ID and role to login
 * This is only for demo purposes
 */
router.post('/register', user_master_register)

// ---------- Authenticate user ------------
router.post('/auth', user_master_auth);

// ---------- Get all master users ----------
router.get('/getAll', user_master_getAll)

// ------- Update User Contact Number -----
var updatePhoneNumber = multer()
router.put('/update_phone_number', checkToken, updatePhoneNumber.none(), user_master_update_details)


module.exports = router