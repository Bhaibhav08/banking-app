import { Account } from "../models/Account.js";
import User from "../models/user.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Joi from "joi";

// Joi schema for account creation validation
const accountCreationSchema = Joi.object({
  type: Joi.string().valid("savings", "current").required(),
});

// Joi schema for transaction validation
const transactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

// @route POST /api/accounts
// @desc Create a new account for the authenticated user
// @access Private
export const createAccount = async (req, res) => {
  try {
    const { error } = accountCreationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "Authenticated user not found." });
    }

    const newAccount = new Account({
      ...req.body,
      userId: req.user.userId,
      accountNumber: uuidv4(),
    });

    await newAccount.save();
    res.status(201).json(newAccount);
  } catch (err) {
    res.status(500).json({ error: "Failed to create account: " + err.message });
  }
};

// @route GET /api/accounts
// @desc Get all accounts for the authenticated user
// @access Private
export const getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.userId });
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accounts: " + err.message });
  }
};

// @route POST /api/accounts/:id/deposit
// @desc Deposit funds into an account
// @access Private (Owner only)
export const deposit = async (req, res) => {
  try {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    if (account.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden: You do not own this account." });
    }

    account.balance += req.body.amount;
    account.transaction.push({
      txnId: uuidv4(),
      type: "deposit",
      amount: req.body.amount,
      timestamp: new Date()
    });

    await account.save();

    res.status(200).json({ message: "Deposit successful.", account });
  } catch (err) {
    res.status(500).json({ error: "Failed to process deposit: " + err.message });
  }
};

// @route POST /api/accounts/:id/withdraw
// @desc Withdraw funds from an account
// @access Private (Owner only)
export const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number." });
    }

    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    if (account.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden: You do not own this account." });
    }

    if (account.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    account.balance -= amount;
    account.transaction.push({
      txnId: uuidv4(),
      type: "withdraw",
      amount: amount,
      timestamp: new Date()
    });

    await account.save();

    res.status(200).json({ message: "Withdrawal successful.", account });
  } catch (err) {
    res.status(500).json({ error: "Failed to process withdrawal: " + err.message });
  }
};

// @route POST /api/accounts/transfer
// @desc Transfer funds between accounts
// @access Private (Owner only)
export const transfer = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { fromAccountId, toAccountId, amount } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Amount must be a positive number." });
    }

    if (fromAccountId === toAccountId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Cannot transfer to the same account." });
    }

    const fromAccount = await Account.findById(fromAccountId).session(session);
    const toAccount = await Account.findById(toAccountId).session(session);

    if (!fromAccount || !toAccount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "One or both accounts not found." });
    }

    if (fromAccount.userId.toString() !== req.user.userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ error: "Forbidden: You do not own the source account." });
    }

    if (fromAccount.balance < amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Insufficient balance for transfer." });
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    fromAccount.transaction.push({
      txnId: uuidv4(),
      type: "transfer",
      amount: -amount,
      timestamp: new Date()
    });
    toAccount.transaction.push({
      txnId: uuidv4(),
      type: "transfer",
      amount: amount,
      timestamp: new Date()
    });

    await fromAccount.save({ session });
    await toAccount.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Transfer successful.",
      fromAccount,
      toAccount,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: "Failed to process transfer: " + err.message });
  }
};
