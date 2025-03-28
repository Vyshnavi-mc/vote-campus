const express = require('express');
const { registerUser, userLogin, getAllFaculty, fetchAllVoters } = require('../Controllers/userController');

const router = express.Router();

router.post('/add-user',registerUser);
router.post('/login-user',userLogin);
router.get('/get-all-faculty',getAllFaculty);
router.get('/get-all-voters',fetchAllVoters);

module.exports={userRouter:router}