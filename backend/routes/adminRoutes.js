import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

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

export default router;
