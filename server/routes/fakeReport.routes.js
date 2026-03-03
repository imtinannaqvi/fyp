import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  submitReport,
  getUserReports,
  getAllReports,
  updateReportStatus
} from "../Controllers/fakeReport.controller.js";

const router = express.Router();

router.use(protect);

router.post("/submit", submitReport);
router.get("/my-reports", getUserReports);
router.get("/all", getAllReports);
router.put("/:id/status", updateReportStatus);

export default router;
