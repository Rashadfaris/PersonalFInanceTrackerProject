import express from "express";
import authenticateAdmin from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", authenticateAdmin, (req, res) => {
    res.json({ message: "Welcome to Admin Dashboard", success: true });
});

export default router;
