const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    electionName: {
        type:String,
        required:true
    },
    electionRole: {
        type:String,
        required:true
    },
    electionBatch: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'batch'
    },
    electionDuty: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    electionFrom: {
        type:Date,
        required:true
    },
    electionTo: {
        type:Date,
        required:true
    },
    electionVenue: {
        type:String,
        required:true
    },
    isDeleted: {
        type:Boolean,
        required:false
    },
    isTerminated:{
        type:Boolean,
        required:false
    },
    isFacultyAccepted:{
        type:Boolean,
        required:false
    },
    facultyRejectReason:{
        type:String,
        required:false
    },
    electionNominee: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'nomination' 
        }
    ],
    electionInitiate:{
        type:Boolean,
        required:false
    }

    
})

const electionModel = mongoose.model('election', electionSchema);
module.exports = electionModel;