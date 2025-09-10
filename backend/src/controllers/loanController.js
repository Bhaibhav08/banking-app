import { Loan } from "../models/loan.js";
import { Account } from "../models/Account.js";
import { v4 as uuidv4 } from "uuid";

// Create a loan request
export const createLoan = async (req, res) => {
    try {
        const { accountId, amount, interestRate } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid loan amount." });
        }

        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ error: "Account not found." });
        }

        if (account.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: "You can only request a loan for your own account." });
        }

        const loan = new Loan({
            loanId: uuidv4(),
            userId: req.user.userId,
            accountId,
            amount,
            interestRate: interestRate || 5, // default interest rate
        });

        await loan.save();

        res.status(201).json({ message: "Loan request created.", loan });
    } catch (err) {
        res.status(500).json({ error: "Failed to create loan: " + err.message });
    }
};

// Get all loans for the authenticated user
export const getLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ userId: req.user.userId }).populate("accountId");
        res.status(200).json(loans);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch loans: " + err.message });
    }
};
