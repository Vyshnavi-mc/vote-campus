const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userFullName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    signUpRole: {
        type: String,
        required: true,
        enum: ["Student", "Faculty", "Admin"]  // Restrict to allowed roles
    },
    departmentRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "department",
        required: true,
    },
    studentAdmissionNumber: {
        type: String,
        required: function () { return this.signUpRole === "Student"; }, // Required only for Students
    },
    batchRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "batch",
        required: function () { return this.signUpRole === "Student"; }, // Required only for Students
    },
    password: {
        type: String,
        required: true
    },
    secretCode: {
        type: String,
        required: function () { return this.signUpRole !== "Student"; } // Required for Faculty & Admin
    },
    isTutor: {
        type:Boolean,
        required:true
    },
    isVoter: {
        type:Boolean,
        required:false
    },
    isNominee:{
        type:Boolean,
        required:false
    },
    isRejected:{
        type:Boolean,
        required:false 
    },
    voterRejectReason:{
        type:String,
        required:false
    },
    approvedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    rejectedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
