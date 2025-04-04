const { default: mongoose } = require("mongoose");
const electionModel = require("../Models/election");
const nominationModel = require("../Models/nomination");

const sendNominationRequest = async (req, res) => {
    const { nomineeId, nominatedElection, nominatedPosition, nomineeStatement, isBacklog, backlogNumber } = req.body;

    try {
        // ✅ Check if the election exists
        let electionObj = await electionModel.findById(nominatedElection);
        if (!electionObj) {
            return res.status(404).json({ error: "Cannot fetch election details!" });
        }

        // 🔎 Check if the nominee has already applied for the same election
        const existingNomination = await nominationModel.findOne({
            nomineeName: nomineeId,
            nomineeElection: nominatedElection
        });

        if (existingNomination) {
            return res.status(400).json({
                error: "Nominee has already applied for this election!"
            });
        }

        // ✅ Create a new nomination if not already applied
        const newNominee = new nominationModel({
            nomineeName: nomineeId,
            nomineeElection: nominatedElection,
            nominatedRole: nominatedPosition,
            nomineeStatement,
            isBacklog,
            backlogNumber
        });

        // 💾 Save the new nomination
        const newNomineeSave = await newNominee.save();
        return res.status(200).json(newNomineeSave);

    } catch (err) {
        console.error("Error sending nomination request:", err.message);
        return res.status(500).json({ error: err.message });
    }
};


const fetchAllNominations = async (req, res) => {
    const { id: batchId } = req.params;

    try {
        const batchObjectId = new mongoose.Types.ObjectId(batchId);

        const allNominations = await nominationModel
            .find({nominationStatus: { $eq: null }})
            .populate({
                path: 'nomineeName',
                select: 'userFullName batchRef studentAdmissionNumber',
                populate: {
                    path: 'batchRef', // To get batchName if needed
                    select: 'batchName'
                }
            });


        const filteredNominations = allNominations.filter(
            (nomination) =>
                nomination.nomineeName?.batchRef?._id?.toString() === batchObjectId.toString()
        );

        return res.status(200).json(filteredNominations);
    } catch (err) {
        console.error('Error fetching nominations:', err.message);
        return res.status(500).json({ error: err.message });
    }
};

const fetchUserNominations = async (req, res) => {
    const { id } = req.params;

    try {
        let nominations = await nominationModel
            .find({ nomineeName: new mongoose.Types.ObjectId(id)})
            .populate('nomineeName')
            .populate('nomineeElection');

        return res.status(200).json(nominations);
    } catch (err) {
        console.error('Error fetching nominations:', err.message);
        return res.status(500).json({ error: err.message });
    }
};

const approveOrRejectNomination = async (req, res) => {
    const { id } = req.params;
    const { status, rejectReason, rejectedBy, nomineeId, electionId } = req.body;

    try {
        // Find the nomination
        const nomination = await nominationModel.findById(id);
        if (!nomination) {
            return res.status(404).json({ error: "Nomination not found!" });
        }

        if (status === "approve") {
            nomination.nominationStatus = true;
            nomination.nomineeRejectReason = null; 
            nomination.rejectedBy = null;

            // ✅ Push a nominee object instead of just nomineeId
            await electionModel.findOneAndUpdate(
                { _id: electionId },
                { 
                    $addToSet: { 
                        electionNominee: { nominationId: id, nomineeName: nomineeId, votes: [] } 
                    } 
                },
                { new: true }
            );
        } 
        else if (status === "reject") {
            nomination.nominationStatus = false;
            nomination.nomineeRejectReason = rejectReason;
            nomination.rejectedBy = rejectedBy;
        } 
        else {
            return res.status(400).json({ error: "Invalid status!" });
        }

        // ✅ Update timestamp
        nomination.updatedAt = Date.now();

        await nomination.save();
        return res.status(200).json({ message: `Nomination ${status}d successfully!` });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


const fetchAllNominationsForList = async (req, res) => {
    const { id: batchId } = req.params;

    try {
        // Convert batchId to ObjectId
        const batchObjectId = new mongoose.Types.ObjectId(batchId);

        // Fetch all nominations and populate related data
        const allNominations = await nominationModel
            .find()
            .populate({
                path: 'nomineeName',
                select: 'userFullName batchRef studentAdmissionNumber',
                populate: {
                    path: 'batchRef',
                    select: 'batchName'
                }
            });

        // Filter nominations based on the selected batch
        const filteredNominations = allNominations.filter(
            (nomination) =>
                nomination.nomineeName?.batchRef?._id?.toString() === batchObjectId.toString()
        );

        return res.status(200).json(filteredNominations);
    } catch (err) {
        console.error('Error fetching nominations:', err.message);
        return res.status(500).json({ error: err.message });
    }
};






module.exports={sendNominationRequest, fetchAllNominations, fetchUserNominations, approveOrRejectNomination,fetchAllNominationsForList}