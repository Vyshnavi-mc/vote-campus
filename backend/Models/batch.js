const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
     batchName: {
        type : String,
        required : true
     },
     departmentRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "department",
        required: true,
      },
})

const batchModel = mongoose.model('batch', batchSchema);
module.exports = batchModel;