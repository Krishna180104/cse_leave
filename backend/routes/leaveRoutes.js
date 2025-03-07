import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);







import express from "express";
import LeaveApplication from "../models/LeaveApplication.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateLeavePDF } from "../utils/pdfGenerator.js";
import { sendEmail } from "../utils/emailService.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Submit a leave application (Student only)
router.post("/apply", authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;

        if (!startDate || !endDate || !reason) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const newApplication = new LeaveApplication({
            student: req.user._id,
            startDate,
            endDate,
            reason
        });

        await newApplication.save();
        res.status(201).json({ message: "Leave application submitted successfully." });

    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// Get all pending leave applications (Admin only)
router.get("/pending", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const pendingApplications = await LeaveApplication.find({ status: "pending" }).populate("student", "name registrationNumber email");
        res.json(pendingApplications);

    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// Approve or Reject a leave application (Admin only)
router.put("/update/:id", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const { status, rejectionReason } = req.body;
        const application = await LeaveApplication.findById(req.params.id).populate("student");

        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        if (status === "approved") {
            const pdfPath = await generateLeavePDF(application);
            application.pdfPath = pdfPath;
        } else if (status === "rejected" && rejectionReason) {
            application.rejectionReason = rejectionReason;
        }

        application.status = status;
        await application.save();
        res.json({ message: `Leave application ${status}.` });

    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

// Download approved leave application PDF
router.get("/download/:id", authMiddleware, async (req, res) => {
    try {
        const application = await LeaveApplication.findById(req.params.id);
        if (!application || application.status !== "approved") {
            return res.status(404).json({ message: "Application not found or not approved." });
        }

        if (!fs.existsSync(application.pdfPath)) {
            return res.status(404).json({ message: "PDF file not found." });
        }

        res.download(application.pdfPath);

    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const { status } = req.query; // Query parameter for filtering
        let filter = {};

        if (status) {
            if (status === "rejected") {
                // Delete rejected applications from the database
                await LeaveApplication.deleteMany({ status: "rejected" });
                return res.json({ message: "All rejected applications have been deleted." });
            }
            filter.status = status;
        }

        const leaveApplications = await LeaveApplication.find(filter).populate("student", "name registrationNumber email");
        res.json(leaveApplications);
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
});


router.put("/bulk-update", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }

        const { applications } = req.body;
        if (!applications || applications.length === 0) {
            return res.status(400).json({ message: "No applications provided." });
        }

        for (let app of applications) {
            const leaveApp = await LeaveApplication.findById(app.id).populate("student");

            if (!leaveApp) continue;

            // ✅ Update the leave application's status before processing
            leaveApp.status = app.status;
            await leaveApp.save();

            if (app.status === "approved") {
                console.log(`Processing approval for: ${leaveApp.student.name}`);

                // ✅ Generate the approval PDF
                const pdfPath = await generateLeavePDF(leaveApp);
                console.log(`PDF saved at: ${pdfPath}`);

                // ✅ Store the secure PDF path in the database
                leaveApp.pdfPath = pdfPath;
                await leaveApp.save();

                // ✅ Generate the view-only link
                const viewLink = `http://localhost:5000/api/leave/view-pdf/${leaveApp._id}`;

                // ✅ Send approval email with view-only link
                await sendEmail(
                    leaveApp.student.email,
                    "Your Leave Application Has Been Approved",
                    `Dear ${leaveApp.student.name},\n\nYour leave application has been approved.\nYou can view your approval letter using the link below:\n${viewLink}\n\nBest regards,\nAdmin`
                );

                console.log(`Approval email sent to: ${leaveApp.student.email}`);

                // ❌ Delete the approved leave application from the database
                await LeaveApplication.findByIdAndDelete(app.id);
                console.log(`Approved leave application deleted: ${app.id}`);
            } 
            else if (app.status === "rejected") {
                console.log(`Processing rejection for: ${leaveApp.student.name}`);

                // Send rejection email before deleting
                await sendEmail(
                    leaveApp.student.email,
                    "Your Leave Application Has Been Rejected",
                    `Dear ${leaveApp.student.name},\nUnfortunately, your leave application has been rejected.\nReason: ${app.rejectionReason}\n\nBest regards,\nHead Of the Department\nDepartment of Computer Science and Engineering`
                );

                console.log(`Rejection email sent to: ${leaveApp.student.email}`);

                // ❌ Delete the rejected application
                await LeaveApplication.findByIdAndDelete(app.id);
                console.log(`Rejected leave application deleted: ${app.id}`);
            }
        }

        res.json({ message: "Leave applications updated successfully." });
        console.log("Bulk update process completed.");

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error.", error });
    }
});

router.get("/view-pdf/:id", async (req, res) => {
    try {
        console.log(`🔹 Received request to serve PDF for leave ID: ${req.params.id}`);

        if (!req.params.id || req.params.id.length < 10) {
            return res.status(400).json({ message: "Invalid leave application ID." });
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>View Leave Approval</title>
                <style>
                    body { margin: 0; overflow: hidden; }
                    iframe { 
                        width: 100vw; 
                        height: 100vh; 
                        border: none; 
                        pointer-events: none;
                    }
                    /* Disable Selection & Right-Click */
                    body, iframe {
                        -webkit-user-select: none;
                        user-select: none;
                        -webkit-touch-callout: none;
                    }

                    /* ✅ Prevent Screenshots & Screen Recording */
                    @media screen {
                        html, body { 
                            -webkit-user-select: none; 
                            -moz-user-select: none; 
                            -ms-user-select: none; 
                            user-select: none; 
                        }

                        /* Disable screen recording on mobile */
                        @keyframes hide {
                            0% { opacity: 1; }
                            100% { opacity: 0; }
                        }
                        body { animation: hide 0s infinite; }
                    }
                </style>
                <script>
                    // Disable PrintScreen Key
                    document.addEventListener("keydown", function(event) {
                        if (event.key === "PrintScreen") {
                            alert("Screenshots are disabled!");
                            event.preventDefault();
                        }
                    });

                    // Disable Right-Click
                    document.addEventListener("contextmenu", function(event) {
                        event.preventDefault();
                    });

                    // Disable Download Shortcut Keys
                    document.addEventListener("keydown", function(event) {
                        if ((event.ctrlKey && event.key === "s") || 
                            (event.ctrlKey && event.key === "p") || 
                            (event.ctrlKey && event.key === "u")) {
                            alert("Downloading is disabled!");
                            event.preventDefault();
                        }
                    });
                </script>
            </head>
            <body>
                <iframe src="/api/leave/pdf-files/${req.params.id}#toolbar=0" ></iframe>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("❌ Server error while serving PDF:", error);
        res.status(500).json({ message: "Server error." });
    }
});





router.get("/pdf-files/:id", async (req, res) => {
    try {
        const pdfPath = path.join(__dirname, "../uploads", `leave_${req.params.id}.pdf`);
        console.log(`🔹 Serving PDF from: ${pdfPath}`);

        if (!fs.existsSync(pdfPath)) {
            console.error("❌ PDF file not found at:", pdfPath);
            return res.status(404).json({ message: "PDF not found.", path: pdfPath });
        }

        // ✅ Serve the PDF in the browser
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);
    } catch (error) {
        console.error("❌ Error serving PDF:", error);
        res.status(500).json({ message: "Server error." });
    }
});







export default router;
