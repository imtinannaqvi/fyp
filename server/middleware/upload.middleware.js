// Process uploaded images without sharp (Vercel compatible)
export const processImage = async (req, res, next) => {
  try {
    if (!req.file) return next();

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    // Pass buffer directly — OCR.space handles raw image buffers fine
    req.file.processedBuffer = req.file.buffer;
    next();
  } catch (error) {
    console.error("Image processing error:", error.message);
    res.status(500).json({ message: "Failed to process image" });
  }
};