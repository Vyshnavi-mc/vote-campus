const express = require('express');
const { addElection, getAllElection, deleteElection, getSingleElection, getElectionsOnCurrentDay, getFacultyAssignedElection, getApprovedElectionList, getFacultyApproveList, facultyApproveOrReject } = require('../Controllers/electionController');
const router = express.Router();

router.get('/get-election/:id', getSingleElection);
router.get('/list-election',getAllElection);
router.get('/get-election-today', getElectionsOnCurrentDay);
router.post('/add-election',addElection);
router.put('/add-election/:id',addElection);
router.delete('/delete-election/:id', deleteElection);
router.get('/assigned-election/:id',getFacultyAssignedElection);
router.get('/approved-election',getApprovedElectionList);
router.get('/pending-election/:id',getFacultyApproveList);
router.put('/approve-reject-election/:id',facultyApproveOrReject);

module.exports={electionRouter:router}