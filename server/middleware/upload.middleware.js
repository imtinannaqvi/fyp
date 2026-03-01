import sharp from "sharp";

// Process uploaded images with Sharp
export const processImage = async (req, res, next) => {
  try {
    if (!req.file) return next(); // No file uploaded, skip
    console.log("req.file:", req.file);

    // Validate file type
    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    // Resize and convert to JPEG
    const processedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024 }) // Resize width to 1024px, keep aspect ratio
      .jpeg({ quality: 80 })   // Convert to JPEG with 80% quality
      .toBuffer();

    // Attach processed buffer to req.file for controllers
    req.file.processedBuffer = processedBuffer;

    next();
  } catch (error) {
    console.error("Image processing error:", error.message);
    res.status(500).json({ message: "Failed to process image" });
  }
};