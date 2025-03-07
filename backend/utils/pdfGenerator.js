import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateLeavePDF = async (application) => {
    return new Promise((resolve, reject) => {
        try {
            console.log("Inside generateLeavePDF function");

            const pdfPath = path.join("uploads", `leave_${application._id}.pdf`);
            const doc = new PDFDocument();

            console.log(`Creating PDF at: ${pdfPath}`);

            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            // Header
            doc.fontSize(16).text("CSE Department - Leave Approval Letter", { align: "center" });
            doc.moveDown(2);

            // Student Details
            doc.fontSize(12).text(`Student Name: ${application.student.name}`);
            doc.text(`Registration Number: ${application.student.registrationNumber}`);

            // Convert date objects safely
            const startDate = new Date(application.startDate).toDateString();
            const endDate = new Date(application.endDate).toDateString();
            doc.text(`Leave Dates: ${startDate} to ${endDate}`);
            doc.text(`Reason: ${application.reason}`);

            doc.moveDown(2);
            doc.text("Approved by: Admin", { align: "left" });

            // Add Signature Only If It Exists
            const signaturePath = "uploads/admin_signature.png";
            if (fs.existsSync(signaturePath)) {
                console.log("Adding admin signature to PDF...");
                doc.image(signaturePath, { width: 100, align: "left" });
            } else {
                console.warn("Warning: Admin signature file not found. PDF will be generated without it.");
            }

            doc.end();

            // Ensure the write stream finishes before resolving
            writeStream.on("finish", () => {
                console.log("PDF generation complete:", pdfPath);
                resolve(pdfPath);
            });

            writeStream.on("error", (error) => {
                console.error("PDF writeStream error:", error);
                reject(error);
            });

        } catch (error) {
            console.error("Error generating PDF:", error);
            reject(error);
        }
    });
};
