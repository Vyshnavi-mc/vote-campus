const express = require('express');
const { registerUser, userLogin, getAllFaculty, fetchAllVoters, approveOrRejectUserAsVoter, fetchUserDetails } = require('../Controllers/userController');

const router = express.Router();

router.post('/add-user',registerUser);
router.post('/login-user',userLogin);
router.get('/get-all-faculty',getAllFaculty);
router.get('/get-all-voters',fetchAllVoters);
router.put('/add-voter-privilege/:id',approveOrRejectUserAsVoter);
router.get('/get-user/:id',fetchUserDetails);

module.exports={userRouter:router}