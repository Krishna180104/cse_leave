import mongoose from "mongoose";

const leaveApplicationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectionReason: { type: String },
    pdfPath: { type: String } // Path to the generated PDF leave letter
}, { timestamps: true });

const LeaveApplication = mongoose.model("LeaveApplication", leaveApplicationSchema);
export default LeaveApplication;
