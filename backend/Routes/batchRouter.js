const express = require('express');
const { insertBatch, getBatch } = require('../Controllers/batchController');
const router = express.Router();

router.post('/add-batch',insertBatch);
router.post('/get-batch',getBatch);

module.exports={batchRouter:router}