import express from "express";
import { createLoan, getLoans } from "../controllers/loanController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createLoan);
router.get("/", authMiddleware, getLoans);

export default router;
