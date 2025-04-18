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

// Search students by registration number (prefix match)
router.get("/search/:regNo", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const searchQuery = req.params.regNo;
        if (!searchQuery) {
            return res.status(400).json({ message: "Search query is required." });
        }

        // Find students whose registration number starts with the entered query
        const users = await User.find({
            registrationNumber: { $regex: `^${searchQuery}`, $options: "i" } // Case-insensitive prefix match
        }).select("-password");
        console.log(users);
        if (users.length === 0) {
            return res.status(404).json({ message: "No students found." });
        }

        res.json(users);
    } catch (error) {
        console.error("Search error:", error);
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
        const pdfLink = `https://cse-leave.onrender.com/uploads/leave_${leaveRequest._id}.pdf`;

        // Send Email with PDF link
        const emailBody = `
        Dear ${leaveRequest.student.name},\n

        Your leave request has been approved.\n

        You can download your approval letter from the link below:
        ${pdfLink}

        Best regards,\n
        Department of Computer Science and Engineering\n
        SGGSIE&T\n
            
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


//delete in bulk
router.delete("/bulk-delete", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const { userIds } = req.body; // Expecting an array of user IDs
        console.log(userIds);
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: "Invalid user IDs." });
        }

        await User.deleteMany({ _id: { $in: userIds } });

        res.json({ message: "Users deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// Total Registered Students Count
router.get("/total-students", authMiddleware, async (req, res) => {
    try {
        const count = await User.countDocuments({ role: "student", isApproved: true });
        res.json({ count });
    } catch (err) {
        console.error("Error fetching total students count:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/pending/count", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }
        const pendingCount = await User.countDocuments({ isApproved: false });
        res.json({ count: pendingCount });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// GET /api/admin/leave-requests/count
router.get("/leave-requests/count", authMiddleware, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied." });
      }
  
      const count = await LeaveRequest.countDocuments({ status: "pending" });
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

export default router;
