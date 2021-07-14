const express = require('express')
const router = express.Router()
const dummyUserController = require('../controllers/dummyUserController.js')

// ---------- Get all dummy users ----------
// -----------------------------------------
router.get('/getAll', dummyUserController.dummy_user_getAll)

// ---------- Get user by ID ---------------
// -----------------------------------------
router.get('/getOne/:id', dummyUserController.dummy_user_getOne)

// ---------- Delete user by ID   ----------
// -----------------------------------------
router.delete('/delete/:id', dummyUserController.dummy_user_delete)

// ---------- Create a user record  --------
// -----------------------------------------
router.post('/create', dummyUserController.dummy_user_create)

// ---------- Update user by ID   ----------
// -----------------------------------------
router.put('/update', dummyUserController.dummy_user_update)

module.exports = router