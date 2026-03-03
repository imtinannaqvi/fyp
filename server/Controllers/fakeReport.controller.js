import FakeReport from "../models/fakeReport.js";

// Submit fake medicine report
export const submitReport = async (req, res) => {
  try {
    const {
      medicineName,
      batchNumber,
      manufacturer,
      purchaseLocation,
      city,
      suspicionReason,
      reporterName,
      reporterPhone,
      reporterEmail
    } = req.body;

    if (!medicineName || !purchaseLocation || !city || !suspicionReason || !reporterPhone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const report = await FakeReport.create({
      user: req.user._id,
      medicineName,
      batchNumber,
      manufacturer,
      purchaseLocation,
      city,
      suspicionReason,
      reporterName,
      reporterPhone,
      reporterEmail
    });

    res.status(201).json({
      message: "Report submitted successfully",
      reportId: report.reportId
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit report" });
  }
};

// Get user's reports
export const getUserReports = async (req, res) => {
  try {
    const reports = await FakeReport.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// Get all reports (Admin only)
export const getAllReports = async (req, res) => {
  try {
    const reports = await FakeReport.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// Update report status (Admin only)
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await FakeReport.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Status updated", report });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
};
