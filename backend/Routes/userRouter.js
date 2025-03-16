const express = require('express');
const { registerUser, userLogin } = require('../Controllers/userController');

const router = express.Router();

router.post('/add-user',registerUser);
router.post('/login-user',userLogin);

module.exports={userRouter:router}