import express from "express";
import { createAccount, getAccounts, deposit, withdraw, transfer } from "../controllers/accountController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Apply authMiddleware to all routes to ensure they are protected
router.use(authMiddleware);

// Create a new account
router.post("/", authMiddleware, createAccount);

// Get all accounts of the authenticated user
router.get("/", authMiddleware, getAccounts);

// Deposit into an account
router.post("/:id/deposit",authMiddleware, deposit);

// Withdraw from an account
router.post("/:id/withdraw",authMiddleware, withdraw);

// Transfer between accounts
router.post("/transfer",authMiddleware, transfer);

export default router;
