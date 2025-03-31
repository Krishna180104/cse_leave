import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import LeaveRequest from "../models/LeaveApplication.js";
import { generateLeavePDF } from "../utils/pdfGenerator.js";
import { sendEmail } from "../utils/emailService.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

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

// Fetch all pending leave applications
router.get("/leave-requests", async (req, res) => {
    try {
        const pendingRequests = await LeaveRequest.find({ status: "pending" })
            .populate("student", "name email"); // Populate student details (adjust fields as needed)
        
        console.log(pendingRequests);
        res.json(pendingRequests);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Approve a leave request
router.put("/approve-leave/:id", async (req, res) => {
    try {
        const leaveRequest = await LeaveRequest.findById(req.params.id).populate("student");

        if (!leaveRequest) {
            return res.status(404).json({ message: "Leave request not found." });
        }

        // Update status to "approved"
        leaveRequest.status = "approved";
        await leaveRequest.save();

        // Generate PDF
        const pdfPath = await generateLeavePDF(leaveRequest);

        // Construct public link (assuming server serves static files from "uploads" folder)
        const pdfLink = `${process.env.SERVER_URL}/uploads/leave_${leaveRequest._id}.pdf`;

        // Send Email with PDF link
        const emailBody = `
            Dear ${leaveRequest.student.name},

            Your leave request has been approved.

            You can download your approval letter from the link below:
            ${pdfLink}

            Best regards,
            CSE Department
        `;

        await sendEmail(leaveRequest.student.email, "Leave Approved", emailBody);

        res.json({ message: "Leave approved and email sent successfully.", pdfLink });

    } catch (error) {
        console.error("Error approving leave:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Reject a leave request
router.delete("/reject-leave/:id", async (req, res) => {
    try {
        const leaveRequest = await LeaveRequest.findById(req.params.id).populate("student");

        if (!leaveRequest) {
            return res.status(404).json({ message: "Leave request not found." });
        }

        // Update status to "rejected"
        leaveRequest.status = "rejected";
        await leaveRequest.save();

        // Send rejection email
        await sendEmail(leaveRequest.student.email, "Leave Rejected", "Your leave request has been rejected.");

        res.json({ message: "Leave rejected and email sent successfully." });

    } catch (error) {
        console.error("Error rejecting leave:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});


export default router;
