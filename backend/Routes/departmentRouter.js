const express = require('express');
const { insertDepartment, getDepartment } = require('../Controllers/departmentController');
const router = express.Router();

router.post('/add-department',insertDepartment);
router.get('/get-department',getDepartment);

module.exports={departmentRouter:router}