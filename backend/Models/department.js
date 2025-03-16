const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
     departmentShortName: {
        type : String,
        required : true
     },
     departmentFullName: {
        type : String,
        required : true
     }
})

const departmentModel = mongoose.model('department', departmentSchema);
module.exports = departmentModel;