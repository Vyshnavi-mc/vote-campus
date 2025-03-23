const express = require('express');
const { insertBatch, getBatch, getAllBatch } = require('../Controllers/batchController');
const router = express.Router();

router.post('/add-batch',insertBatch);
router.post('/get-batch',getBatch);
router.get('/get-all-batch',getAllBatch);

module.exports={batchRouter:router}