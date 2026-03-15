// routes/expiry.route.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createExpiry, getUserExpiries, deleteExpiry } from "../Controllers/expiry.controller.js";

const router = express.Router();

router.post("/",       protect, createExpiry);     // POST   /api/expiry
router.get("/",        protect, getUserExpiries);  // GET    /api/expiry
router.delete("/:id",  protect, deleteExpiry);     // DELETE /api/expiry/:id

export default router;