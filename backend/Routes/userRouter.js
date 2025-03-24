const express = require('express');
const { registerUser, userLogin, getAllFaculty } = require('../Controllers/userController');

const router = express.Router();

router.post('/add-user',registerUser);
router.post('/login-user',userLogin);
router.get('/get-all-faculty',getAllFaculty);

module.exports={userRouter:router}