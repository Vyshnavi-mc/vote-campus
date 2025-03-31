const mongoose = require('mongoose');

const nominationSchema = new mongoose.Schema({
     nomineeName: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
     },
     nomineeElection: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'election'
     },
     nominatedRole: {
        type:String,
        required:true
     },
     nomineeStatement:{
        type:String,
        required:true
     },
     isBacklog:{
        type:Boolean,
        required:true
     },
     backlogNumber:{
        type:Number,
        required:false
     },
     nominationStatus:{
        type:Boolean,
        required:false
     },
     nomineeRejectReason:{
        type:String,
        required:false
     },
     rejectedBy:{
        type:mongoose.Schema.Types.ObjectId,
        required:false,
        ref:'user'
     }
},{ timestamps: true });

const nominationModel = mongoose.model('nomination', nominationSchema);
module.exports = nominationModel;