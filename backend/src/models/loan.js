import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
    loanId: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    interestRate: {
        type: Number,
        required: true,
        default: 5 // example rate
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const Loan = mongoose.model("Loan", loanSchema);
