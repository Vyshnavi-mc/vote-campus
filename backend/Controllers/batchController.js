const batchModel = require("../Models/batch");


const insertBatch = async(req,res)=>{
    const {batchName, departmentRef} = req.body;
    const newBatch = await new batchModel({batchName,departmentRef});
    try{
        const response = await newBatch.save();
        return res.status(200).json(response);

    }catch(err){
        if (!res.headersSent) {
            return res.status(500).json({ error: err.message });
        }
        console.error('Failed to send response:', err);
    }
}

const getBatch = async (req, res) => {
    const { departmentRef } = req.body;  // Change from req.body to req.query if sending as query param
    try {
        const batches = await batchModel.find({ departmentRef: departmentRef }); // Fetch multiple batches
        return res.status(200).json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllBatch = async(req,res)=>{
    try{
        const result = await batchModel.find({});
        return res.status(200).json(result);
    }catch(err){
        res.status(500).json({ error: err.message });
    }
}



module.exports={insertBatch, getBatch, getAllBatch}