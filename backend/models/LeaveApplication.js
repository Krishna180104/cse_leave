import mongoose from "mongoose";

const leaveApplicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reason: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    appliedAt: { type: Date, default: Date.now }
});

const LeaveApplication = mongoose.model("LeaveApplication", leaveApplicationSchema);
export default LeaveApplication;
