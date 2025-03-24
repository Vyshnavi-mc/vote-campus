const batchModel = require("../Models/batch");
const electionModel = require("../Models/election");
const userModel = require("../Models/user");

const addElection = async (req, res) => {
    const { id } = req.params; // Check if update
    const { electionName, electionRole, electionBatch, electionFrom, electionTo, electionDuty, electionVenue } = req.body;

    try {
        const electionBatchObj = await batchModel.findById(electionBatch);
        const electionDutyObj = await userModel.findById(electionDuty);

        if (!electionBatchObj || !electionDutyObj) {
            return res.status(404).json({ error: "Invalid Batch or User ID" });
        }

        let election;
        if (id) {
            election = await electionModel.findByIdAndUpdate(
                id,
                {
                    electionName,
                    electionRole,
                    electionBatch: electionBatchObj,
                    electionFrom,
                    electionTo,
                    electionDuty: electionDutyObj,
                    electionVenue,
                },
                { new: true, runValidators: true }
            );

            if (!election) {
                return res.status(404).json({ error: "Election not found." });
            }
        } else {
            election = await new electionModel({
                electionName,
                electionRole,
                electionBatch: electionBatchObj,
                electionFrom,
                electionTo,
                electionDuty: electionDutyObj,
                electionVenue,
            }).save();
        }

        return res.status(200).json(election);
    } catch (err) {
        console.error("Error saving election:", err);
        return res.status(500).json({ error: err.message });
    }
};



const getAllElection = async(req,res)=>{
    try{
        const electionList = await electionModel.find({ isDeleted: { $ne: true } })
        .populate({
            path: 'electionBatch',   // Populate batch to get batch details
            select: 'batchName'     // Only get batchName if needed
        })
        .populate({
            path: 'electionDuty',    // Populate electionDuty to get user details
            select: 'userFullName'  // Only get userFullName if needed
        });;
        return res.status(200).json(electionList);

    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

const deleteElection = async(req,res)=>{
    const{id} = req.params;
    try{
        const updatedElection = await electionModel.findByIdAndUpdate(
            id,
            {$set : {isDeleted:true}},
            {new: true}
        );
        if (!updatedElection) {
            return res.status(404).json({ error: "Election not found!" });
        }
        res.status(200).json({
            message: "Election deleted successfully!",
            data: updatedElection,
        });

    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

const getSingleElection = async (req, res) => {
    const { id } = req.params;

    try {
        const electionList = await electionModel
            .findById(id)
            .populate('electionBatch', 'batchName') 
            .populate('electionDuty', 'userFullName'); 
        
        if (!electionList) {
            return res.status(404).json({ error: "Election not found!" });
        }

        return res.status(200).json(electionList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getElectionsOnCurrentDay = async (req,res) =>{
    try{
        const currentDateUTC = new Date();

        // Convert to Indian Standard Time (IST)
        const currentDateIST = new Date(currentDateUTC.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

        const currentDayList = await electionModel.find({
            isDeleted: { $ne: true }, 
            isTerminated: { $ne: true }, 
            electionFrom: { $lte: currentDateIST }, 
            electionTo: { $gte: currentDateIST }    
        });
        return res.status(200).json(currentDayList);
    }catch(err){
        res.status(500).json({error:err.message})
    }
}



module.exports={addElection, getAllElection, deleteElection, getSingleElection,getElectionsOnCurrentDay};