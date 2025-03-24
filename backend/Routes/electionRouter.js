const express = require('express');
const { addElection, getAllElection, deleteElection, getSingleElection, getElectionsOnCurrentDay } = require('../Controllers/electionController');
const router = express.Router();

router.get('/get-election/:id', getSingleElection);
router.get('/list-election',getAllElection);
router.get('/get-election-today', getElectionsOnCurrentDay);
router.post('/add-election',addElection);
router.put('/add-election/:id',addElection);
router.delete('/delete-election/:id', deleteElection);

module.exports={electionRouter:router}