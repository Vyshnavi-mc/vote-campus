const userModel = require("../Models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types; // Import ObjectId

const registerUser = async (req, res) => {
    try {
        const { userFullName, userEmail, signUpRole, departmentRef, studentAdmissionNumber, batchRef, password, secretCode } = req.body;

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

        // ✅ Ensure departmentRef is a valid ObjectId
        let departmentId = departmentRef;
        if (!ObjectId.isValid(departmentRef)) {
            return res.status(400).json({ error: "Invalid department reference" });
        } else {
            departmentId = new ObjectId(departmentRef);
        }

        // ✅ Ensure batchRef is a valid ObjectId (Only if provided)
        let batchId = batchRef;
        if (batchRef && batchRef !== "Select year...") {
            if (!ObjectId.isValid(batchRef)) {
                return res.status(400).json({ error: "Invalid batch reference" });
            }
            batchId = new ObjectId(batchRef);
        } else {
            batchId = null; // Optional batchRef can be set to null
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            userFullName,
            userEmail,
            password: hashedPassword,
            signUpRole,
            departmentRef: departmentId,
            studentAdmissionNumber,
            batchRef: batchId, // ✅ Ensure ObjectId or null
            secretCode
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
    
    console.log("Received Login Request:");
    console.log("Email:", userEmail);
    console.log("Password:", password);

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

        console.log("Password matched. Generating token...");
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "1h" });

        console.log("Login successful.");
        return res.status(200).json({ token, userID: user._id });

    } catch (error) {
        console.error("Login Error:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: error.message });
        }
    }
};



  module.exports={registerUser, userLogin}