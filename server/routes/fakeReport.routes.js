import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminMiddleware as isAdmin } from "../middleware/admin.middleware.js";
import {
  submitReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
  forwardToDRAP
} from "../Controllers/fakeReport.controller.js";

const router = express.Router();

router.use(protect);

router.post("/submit",          submitReport);
router.get("/my-reports",       getUserReports);
router.get("/all",              isAdmin, getAllReports);
router.put("/:id/status",       isAdmin, updateReportStatus);
router.post("/:id/forward",     isAdmin, forwardToDRAP);

export default router;
