import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registrationNumber: { type: String, unique: true, sparse: true }, // Allow null values without uniqueness constraint
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    idCardImage: { type: String }, // Required only for students
    isApproved: { type: Boolean, default: false },
    role: { type: String, enum: ["student", "admin"], required: true }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
