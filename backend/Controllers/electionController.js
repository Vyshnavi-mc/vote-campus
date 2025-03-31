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

const getFacultyAssignedElection = async (req, res) => {
    const { id } = req.params;

    try {
        const faculty = await electionModel.find({
            electionDuty: id,
            isDeleted:{$ne : true},
            isFacultyAccepted:true
        }).populate("electionDuty", "userFullName userEmail"); 

        return res.status(200).json(faculty);
    } catch (err) {
        console.error("Error fetching faculty assigned elections:", err);
        return res.status(500).json({ error: err.message });
    }
};

const getApprovedElectionList = async (req,res) =>{
    try{
        const electionList = await electionModel.find({ isDeleted: { $ne: true },isFacultyAccepted:true })
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


const getFacultyApproveList = async (req,res) =>{
    const {id} = req.params;
    try{
        const query = {
            isDeleted: { $ne: true },
            isFacultyAccepted: null
        };
    
        if (id) {
            query.electionDuty = id;
        }
    
        const electionList = await electionModel.find(query)
            .populate({
                path: 'electionBatch',   // Populate batch to get batch details
                select: 'batchName'     // Only get batchName if needed
            })
            .populate({
                path: 'electionDuty',    // Populate electionDuty to get user details
                select: 'userFullName'  // Only get userFullName if needed
            });
        return res.status(200).json(electionList);

    }catch(err){
        res.status(500).json({ error: err.message });
    }
}

const facultyApproveOrReject = async (req, res) => {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    try {
        let electionObj;

        if (status === 'accept_duty') {
            electionObj = await electionModel.findByIdAndUpdate(
                id,
                { $set: { isFacultyAccepted: true, facultyRejectReason: '' } }, // Clear rejectReason if accepted
                { new: true }
            );
        }

        if (status === 'reject_duty') {
            electionObj = await electionModel.findByIdAndUpdate(
                id,
                { $set: { isFacultyAccepted: false, facultyRejectReason: rejectReason } }, // Set reject reason if rejected
                { new: true }
            );
        }

        // Check if electionObj is null or undefined
        if (!electionObj) {
            return res.status(404).json({ error: "Election not found!" });
        }

        if (status === 'accept_duty') {
            return res.status(200).json({ message: 'You have accepted the election duty!' });
        } else {
            return res.status(200).json({ message: 'You have rejected the election duty!' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const startElectionFlag  = async (req,res)=>{
    const {id} = req.params;
    try{
        const electionObj = await electionModel.findById(id);
        if(!electionObj){
            return res.status(404).json({message : 'Cannot fetch election object'});
        }

    }catch(err){
        return res.status(500).json({error : err.message})
    }
}





module.exports={
    addElection, 
    getAllElection, 
    deleteElection, 
    getSingleElection,
    getElectionsOnCurrentDay, 
    getFacultyAssignedElection,
    getApprovedElectionList,
    getFacultyApproveList,
    facultyApproveOrReject,
    startElectionFlag
};