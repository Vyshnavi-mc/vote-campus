const userModel = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types; // Import ObjectId

const registerUser = async (req, res) => {
    try {
        const { userFullName, userEmail, signUpRole, departmentRef, studentAdmissionNumber, batchRef,facultyBatchRef, password, secretCode, isTutor } = req.body;
        console.log(isTutor);
        if (!userEmail) {
            return res.status(400).json({ error: "Email required" });
        }

        if (signUpRole !== "Student" && !secretCode) {
            return res.status(400).json({ error: "Secret code needed!" });
        }

        if (signUpRole === "Student" && !studentAdmissionNumber) {
            return res.status(400).json({ error: "Admission number required." });
        }

        if (signUpRole === "Faculty" && secretCode !== process.env.FACULTY_CODE) {
            return res.status(400).json({ error: "Incorrect faculty code!" });
        }

        if (signUpRole === "Admin" && secretCode !== process.env.ADMIN_CODE) {
            return res.status(400).json({ error: "Incorrect Admin code!" });
        }

        const existingUser = await userModel.findOne({ userEmail });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        let departmentId = departmentRef;
        if (!ObjectId.isValid(departmentRef)) {
            return res.status(400).json({ error: "Invalid department reference" });
        } else {
            departmentId = new ObjectId(departmentRef);
        }

        let batchId = batchRef;
        if (batchRef && batchRef !== "Select year...") {
            if (!ObjectId.isValid(batchRef)) {
                return res.status(400).json({ error: "Invalid batch reference" });
            }
            batchId = new ObjectId(batchRef);
        } else {
            batchId = null;
        }

        batchId = '';
        if(signUpRole === 'Student'){
            batchId = batchRef
        }else{
            batchId = facultyBatchRef
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            userFullName,
            userEmail,
            password: hashedPassword,
            signUpRole,
            departmentRef: departmentId,
            studentAdmissionNumber,
            batchRef: batchId, 
            secretCode,
            isTutor
        });

        const userSave = await newUser.save();
        return res.status(201).json(userSave);

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: err.message });
    }
};


const userLogin = async (req, res) => {
    const { userEmail, password } = req.body;
    try {
        // Find a single user instead of an array
        const user = await userModel.findOne({ userEmail : userEmail });

        if (!user) {
            console.log("User not found in DB.");
            return res.status(404).json({ message: "User not registered!" });
        }

        console.log("User Found:", user);

        if (!user.password) {
            console.log("Error: User record is missing a password.");
            return res.status(500).json({ message: "User record is missing a password." });
        }

        // Compare hashed password
        const loggedIn = await bcrypt.compare(password, user.password);

        if (!loggedIn) {
            console.log("Incorrect password.");
            return res.status(401).json({ message: "Username/Password Incorrect" });
        }
        // Generate JWT token, we want this to be saved in the localstorage inorder to retrieve profile information!
        const token = jwt.sign({ id: user._id, role:user.signUpRole,isTutor: user.isTutor,departmentRef: user.departmentRef,batchRef: user.batchRef }, "secret", { expiresIn: "1h" });

        if(user.isVoter === true || user.signUpRole !== 'Student'){
            console.log('batchref');
            console.log(user.batchRef);
            return res.status(200).json({ token, userID: user._id,userFullName:user.userFullName, userRole : user.signUpRole, isTutor : user.isTutor, departmentRef : user.departmentRef, batchRef: user.batchRef, admissionNo : user.studentAdmissionNumber });
        }
        return res.status(500).json({ message: "Your access is prohibited. Your profile is not approved by the faculty. Once approved, you will be added as a voter!"})

    } catch (error) {
        console.error("Login Error:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: error.message });
        }
    }
};

    const getAllFaculty = async(req,res)=>{
        try{
            const result = await userModel.find({signUpRole:'Faculty'});
            return res.status(200).json(result);
        }catch(err){
            res.status(500).json({ error: err.message });
        }
    }

    const fetchAllVoters = async (req, res) => {
        try {
            const { userFullName, departmentRef, batchRef, source="" } = req.query;
            let query = {};
    
            query.signUpRole = "Student"; // Always filter for Students
            console.log(batchRef);
            // Exclude rejected voters unless explicitly asked for all
            if (source && source !== "voter_all") {
                query.isRejected = { $ne: true };
            }
    
            // Handle voter approval logic
            if (source === "voter_approval") {
                query.isVoter = { $ne: true }; // For approval requests
            } else if (source === "voter_all") {
                delete query.isVoter; // Show all voters without filtering
            } else {
                query.isVoter = true; // Default: show approved voters
            }
    
            // Apply filters only if provided
            if (userFullName) {
                query.userFullName = { $regex: userFullName, $options: "i" }; // Case-insensitive partial match
            }
    
            // Validate ObjectId for department and batch
            const mongoose = require("mongoose");
            if (departmentRef && mongoose.Types.ObjectId.isValid(departmentRef)) {
                query.departmentRef = departmentRef;
            }
            if (batchRef && mongoose.Types.ObjectId.isValid(batchRef)) {
                query.batchRef = batchRef;
            }
    
            // Fetch users based on query and populate department and batch references
            const result = await userModel
                .find(query)
                .populate("departmentRef", "departmentShortName") // Show department name
                .populate("batchRef", "batchName"); // Show batch name
    
            return res.status(200).json(result);
        } catch (err) {
            console.error("Error fetching voters:", err.message);
            res.status(500).json({ error: err.message });
        }
    };
    

    const approveOrRejectUserAsVoter = async (req, res) => {
        const { id } = req.params; 
        const { approveStatus, rejectStatus, rejectReason } = req.body;
    
        try {
            const user = await userModel.findById(id);   
            if (!user) {
                return res.status(404).json({ message: "Cannot find user" });
            }

            let updateFields = {};
            if (approveStatus === true) {
                updateFields.isVoter = true;
                updateFields.isRejected = false;
                updateFields.voterRejectReason = ""; 
            } else if (rejectStatus === true) {
                updateFields.isVoter = false;
                updateFields.isRejected = true;
                updateFields.voterRejectReason = rejectReason || "No reason provided"; 
            }
    
            const updatedUser = await userModel.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { new: true, runValidators: true }
            );
    
            if (approveStatus === true) {
                return res.status(200).json({
                    message: `User ${user.userFullName} approved successfully`,
                    user: updatedUser,
                });
            } else if (rejectStatus === true) {
                return res.status(200).json({
                    message: `User ${user.userFullName} rejected successfully`,
                    user: updatedUser,
                });
            } else {
                return res.status(400).json({ message: "Invalid request: No action specified" });
            }
        } catch (err) {
            console.error("Error updating voter status:", err.message);
            return res.status(500).json({ error: err.message });
        }
    };

    const fetchUserDetails = async (req, res) => {
        const { id } = req.params;
        try {
            const user = await userModel
                .findById(id)
                .populate('batchRef', 'batchName') // Populate batchRef with batchName
                .populate('departmentRef', 'departmentShortName'); // Populate departmentRef if needed
    
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
    
            return res.status(200).json(user);
        } catch (err) {
            return res.status(500).json({ err: err.message });
        }
    };
    
    
    



  module.exports={registerUser, userLogin, getAllFaculty, fetchAllVoters, approveOrRejectUserAsVoter,fetchUserDetails}