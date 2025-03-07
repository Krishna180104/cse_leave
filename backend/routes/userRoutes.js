import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Configure Multer for ID card image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Save images in uploads/ folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// User Registration Route
router.post("/register", upload.single("idCardImage"), async (req, res) => {
    try {
        const { name, registrationNumber, email, password, role } = req.body;
        const idCardImage = req.file ? req.file.path : null;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // ✅ Check if the email already exists
        const existingUserByEmail = await User.findOne({ email });
        if (role === "student") {
            const existingUserByRegNo = await User.findOne({ registrationNumber });
            if (existingUserByRegNo) {
                return res.status(400).json({ message: "Registration number already exists. Please check your details." });
            }
        }
        if (existingUserByEmail) {
            return res.status(400).json({ message: "Email already exists. Please use a different email." });
        }

        // ✅ Check if the registration number already exists (only for students)
        

        // Check if this is the first signup
        const existingUsers = await User.countDocuments();
        let isApproved = existingUsers === 0; // First user is auto-approved as admin

        // Prevent normal users from signing up as admin
        if (existingUsers > 0 && role === "admin") {
            isApproved = false; // Admin request needs approval
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            registrationNumber: registrationNumber || null, // Admins don't have registration numbers
            email,
            password: hashedPassword,
            idCardImage,
            isApproved,
            role
        });

        await newUser.save();
        res.status(201).json({ message: isApproved ? "Admin account created successfully." : "Registration request sent. Wait for admin approval." });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ message: "Server error.", error });
    }
});



// User Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        if (!user.isApproved) {
            return res.status(403).json({ message: "Your account is not approved yet." });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user: { name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});


export default router;
