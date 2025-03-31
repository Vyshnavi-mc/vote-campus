const express = require('express');
const { sendNominationRequest, fetchAllNominations, fetchUserNominations, approveOrRejectNomination, fetchAllNominationsForList } = require('../Controllers/nominationController');
const router = express.Router();

router.post('/sent-nomination',sendNominationRequest);
router.get('/get-nomination/:id',fetchAllNominations);
router.get('/get-user-nomination/:id',fetchUserNominations);
router.put('/approve-reject-nomination/:id',approveOrRejectNomination);
router.get('/all-nomination/:id',fetchAllNominationsForList);
module.exports={nominationRouter:router}    