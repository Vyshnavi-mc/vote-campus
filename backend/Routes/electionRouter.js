const express = require('express');
const { addElection, getAllElection, deleteElection, getSingleElection, getElectionsOnCurrentDay, getFacultyAssignedElection, getApprovedElectionList, getFacultyApproveList, facultyApproveOrReject, startElectionFlag, terminateElectionFlag, getAllStartedElection, castVote, getRunningElection } = require('../Controllers/electionController');
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
router.put('/start-election/:id',startElectionFlag);
router.put('/terminate-election/:id',terminateElectionFlag);
router.get('/get-started-election',getAllStartedElection);
router.put('/cast-vote/:id',castVote);
router.get('/get-running-election',getRunningElection);

module.exports={electionRouter:router}