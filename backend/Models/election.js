const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    electionName: { type: String, required: true },
    electionRole: { type: String, required: true },
    electionBatch: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'batch' },
    electionDuty: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
    electionFrom: { type: Date, required: true },
    electionTo: { type: Date, required: true },
    electionVenue: { type: String, required: true },
    isDeleted: { type: Boolean, default: null },
    isTerminated: { type: Boolean, default: null },
    isPublished: { type: Boolean, default: null },
    isFacultyAccepted: { type: Boolean, default: null },
    facultyRejectReason: { type: String, default: null },
    
    electionNominee: [
        {
            nominationId: { type: mongoose.Schema.Types.ObjectId, ref: 'nomination' },
            nomineeName: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, 
            votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }]
        }
    ],

    votesCastByUser: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            voteCount: { type: Number, default: 0 }
        }
    ],

    electionInitiate: { type: Boolean, default: false }
});

electionSchema.virtual('isElectionOver').get(function () {
    return this.electionTo < new Date();
});

electionSchema.set('toJSON', { virtuals: true });
electionSchema.set('toObject', { virtuals: true });

const electionModel = mongoose.model('election', electionSchema);
module.exports = electionModel;
