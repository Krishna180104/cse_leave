import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Get all users (pending + approved)
router.get("/users", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// Approve a user (Student/Admin)
router.put("/approve/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found." });

        user.isApproved = true;
        await user.save();
        res.json({ message: `${user.role} approved successfully.` });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// Search user by registration number
router.get("/search/:regNo", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const user = await User.findOne({ registrationNumber: req.params.regNo }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// Delete a user
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});


router.get("/pending", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        // Fetch users who are not approved
        const pendingUsers = await User.find({ isApproved: false }).select("-password");
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

router.delete("/reject/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.isApproved) {
            return res.status(400).json({ message: "Cannot reject an already approved user." });
        }

        // Delete the ID card image if it exists
        if (user.idCardImage) {
            const imagePath = path.join("uploads", path.basename(user.idCardImage));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath); // Remove the image from the uploads folder
            }
        }

        await User.findByIdAndDelete(userId);
        res.json({ message: "User signup request rejected and deleted." });
    } catch (error) {
        console.error("Error rejecting user:", error);
        res.status(500).json({ message: "Server error.", error });
    }
});

export default router;
