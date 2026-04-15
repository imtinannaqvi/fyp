import FakeReport from "../models/fakeReport.js";
import sendEmail from "../utils/sendEmail.js";

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

// Forward report to DRAP via email (Admin only)
export const forwardToDRAP = async (req, res) => {
  try {
    const report = await FakeReport.findById(req.params.id).populate("user", "name email");
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (report.status === "forwarded") return res.status(400).json({ message: "Already forwarded to DRAP" });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
        <div style="background:#dc2626;padding:20px 24px">
          <h2 style="color:#fff;margin:0">⚠️ Fake Medicine Report — Medico Guidance App</h2>
          <p style="color:#fecaca;margin:4px 0 0;font-size:13px">Report ID: ${report.reportId}</p>
        </div>
        <div style="padding:24px;background:#fff">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#6b7280;width:40%">Medicine Name</td><td style="padding:8px 0;font-weight:600">${report.medicineName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Batch Number</td><td style="padding:8px 0">${report.batchNumber || "N/A"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Manufacturer</td><td style="padding:8px 0">${report.manufacturer || "N/A"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Purchase Location</td><td style="padding:8px 0">${report.purchaseLocation}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">City</td><td style="padding:8px 0">${report.city}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Reason for Suspicion</td><td style="padding:8px 0">${report.suspicionReason}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Reporter Name</td><td style="padding:8px 0">${report.reporterName || "Anonymous"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Reporter Phone</td><td style="padding:8px 0">${report.reporterPhone}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Reporter Email</td><td style="padding:8px 0">${report.reporterEmail || "N/A"}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Submitted By</td><td style="padding:8px 0">${report.user?.name || "N/A"} (${report.user?.email || "N/A"})</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Date Submitted</td><td style="padding:8px 0">${new Date(report.createdAt).toLocaleDateString("en-PK")}</td></tr>
          </table>
        </div>
        <div style="background:#f9fafb;padding:16px 24px;font-size:12px;color:#9ca3af">
          This report was submitted via Medico Guidance — a medicine safety platform for Pakistan.
        </div>
      </div>
    `;

    await sendEmail("complaints@drap.gov.pk", `Fake Medicine Report: ${report.medicineName} — ${report.reportId}`, html);

    // Also notify the reporter if they provided email
    if (report.reporterEmail) {
      const confirmHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#16a34a">✅ Your Report Has Been Forwarded to DRAP</h2>
          <p>Dear ${report.reporterName || "Reporter"},</p>
          <p>Your fake medicine report (ID: <strong>${report.reportId}</strong>) for <strong>${report.medicineName}</strong> has been reviewed and forwarded to the Drug Regulatory Authority of Pakistan (DRAP) for investigation.</p>
          <p style="color:#6b7280;font-size:13px">DRAP will investigate and take appropriate action. Thank you for helping protect public health in Pakistan.</p>
        </div>
      `;
      await sendEmail(report.reporterEmail, `Report Forwarded to DRAP — ${report.reportId}`, confirmHtml);
    }

    await FakeReport.findByIdAndUpdate(req.params.id, { status: "forwarded" });
    res.json({ message: "Report forwarded to DRAP successfully" });
  } catch (error) {
    console.error("Forward to DRAP error:", error.message);
    res.status(500).json({ message: "Failed to forward report" });
  }
};
