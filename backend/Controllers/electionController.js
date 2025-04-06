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



const getAllElection = async (req, res) => {
    try {
        const electionList = await electionModel.find({ isDeleted: { $ne: true } })
            .populate({
                path: 'electionBatch',   // Populate batch details
                select: 'batchName'
            })
            .populate({
                path: 'electionDuty',    // Populate user details
                select: 'userFullName'
            })
            .lean(); // Converts Mongoose document to plain JavaScript object

        // ✅ Add isElectionOver dynamically
        const updatedElections = electionList.map(election => ({
            ...election,
            isElectionOver: election.electionTo < new Date() // Check if election is over
        }));

        return res.status(200).json(updatedElections);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


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
const startElectionFlag = async (req, res) => {
    const { id } = req.params;

    try {
        const electionObj = await electionModel
            .findById(id)
            .populate({
                path: 'electionNominee',
                populate: {
                    path: 'nominationId', // Fetch nomination details
                    select: 'nomineeStatement nominatedRole'
                }
            });

        if (!electionObj) {
            return res.status(404).json({ message: "Cannot fetch election object" });
        }

        // Check if election is already terminated
        if (electionObj.isTerminated) {
            return res.status(400).json({ message: "Election has already been terminated" });
        }

        // Check if election is already started
        if (electionObj.electionInitiate) {
            return res.status(400).json({ message: "Election already started" });
        }

        // ✅ Ensure at least 2 valid nominees with nominationId exist
        const validNominees = electionObj.electionNominee.filter(nominee => nominee.nominationId);
        if (validNominees.length < 2) {
            return res.status(400).json({ message: "At least 2 nominees are required to start the election." });
        }

        // Start the election
        electionObj.electionInitiate = true;
        await electionObj.save();

        return res.status(200).json({ message: "Election has been started. Voting will be completed after the configured duration" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


const terminateElectionFlag = async (req, res) => {
    const { id } = req.params;

    try {
        const electionObj = await electionModel.findById(id);

        if (!electionObj) {
            return res.status(404).json({ message: "Cannot fetch election object" });
        }

        // Check if election is already terminated
        if (electionObj.isTerminated) {
            return res.status(400).json({ message: "Election has already been terminated" });
        }

        // Start the election
        electionObj.isTerminated = true;
        await electionObj.save();

        return res.status(200).json({ message: "Election has been Terminated. You can now publish results!" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


const getAllStartedElection = async (req, res) => {
    try {
        const data = await electionModel
            .find({ electionInitiate: true, isDeleted: { $ne: true }, isTerminated: { $ne: true } })
            .populate({
                path: 'electionNominee',
                populate: [
                    {
                        path: 'nomineeName', // Fetch user details
                        select: 'userFullName batchRef studentAdmissionNumber'
                    },
                    {
                        path: 'nominationId', // Fetch nomination details
                        select: 'nomineeStatement nominatedRole'
                    }
                ]
            });

        if (!data || data.length === 0) {
            return res.status(400).json([]);
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

async function checkAndTerminateElections() {
    try {
        const now = new Date();

        // Find elections that have ended but are not terminated
        const expiredElections = await electionModel.find({
            electionTo: { $lt: now },
            isTerminated: { $ne: true }
        });

        if (expiredElections.length > 0) {
            await electionModel.updateMany(
                { electionTo: { $lt: now }, isTerminated: { $ne: true } },
                { $set: { isTerminated: true } }
            );
            console.log(`✅ Marked ${expiredElections.length} elections as terminated.`);
        }
    } catch (err) {
        console.error("❌ Error updating elections:", err);
    }
}

// Run this check every 10 seconds
setInterval(checkAndTerminateElections, 10000);


const castVote = async (req, res) => {
    try {
        const { id } = req.params; // Election ID
        const { nomineeId, userId } = req.body; // Nominee ID & Voter ID

        // 1️⃣ Find the election
        const election = await electionModel.findById(id);
        if (!election) {
            return res.status(404).json({ message: "Election not found." });
        }

        // 2️⃣ Check if election is ongoing
        if (!election.electionInitiate || election.isTerminated) {
            return res.status(400).json({ message: "Voting is not allowed at this time." });
        }

        // 3️⃣ Find the nominee in the election
        const nominee = election.electionNominee.find(n => n._id.toString() === nomineeId);
        if (!nominee) {
            return res.status(400).json({ message: "Nominee not found." });
        }

        // 4️⃣ Check if the user has already voted for this nominee
        if (nominee.votes.includes(userId)) {
            return res.status(400).json({ message: "You have already voted for this nominee." });
        }

        // 5️⃣ Add the user's vote to the nominee
        nominee.votes.push(userId);

        // 6️⃣ Track total votes the user has cast
        const userVoteEntry = election.votesCastByUser.find(entry => entry.userId.toString() === userId);
        if (userVoteEntry) {
            userVoteEntry.voteCount += 1;
        } else {
            election.votesCastByUser.push({ userId, voteCount: 1 });
        }

        // 7️⃣ Save election document
        await election.save();

        // 8️⃣ Send response with updated vote count
        return res.status(200).json({ 
            message: "Vote cast successfully!",
            totalVotesForNominee: nominee.votes.length
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


const getRunningElection = async (req,res) =>{
    try {
        const runningElections = await electionModel.find({ 
            electionInitiate: true, 
            isTerminated: {$ne:true} 
        }).populate('electionNominee.nomineeName', 'userFullName'); 

        res.status(200).json(runningElections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const publishResult = async (req,res)=>{
    try {
        const electionId = req.params.id;

        const election = await electionModel.findById(electionId);
        if (!election) {
            return res.status(404).json({ error: 'Election not found' });
        }

        // Set termination flag
        election.isTerminated = true;
        election.isPublished = true;
        await election.save();

        res.status(200).json({ message: 'Election terminated successfully' });
    } catch (error) {
        console.error('Error terminating election:', error);
        res.status(500).json({ error: 'Failed to terminate election' });
    }
}

const viewElectionResults  = async (req,res)=>{
    try {
    

        const election = await electionModel.find()
        
        .populate({
            path: 'electionNominee.nomineeName',
            select: 'userFullName profileImage'
        })
        .populate('electionBatch', 'name');

        if (!election) {
            return res.status(404).json({ error: 'Election not found' });
        }

        return res.status(200).json({
            message: 'Election results published successfully',
            election
        });
    } catch (error) {
        console.error('Error publishing election:', error);
        return res.status(500).json({ error: 'Internal server error' });
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
    startElectionFlag,
    terminateElectionFlag,
    getAllStartedElection,
    checkAndTerminateElections,
    castVote,
    getRunningElection,
    publishResult,
    viewElectionResults
};