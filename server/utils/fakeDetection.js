import stringSimilarity from "string-similarity";
import Medicine from "../models/Medicine.js";

export const detectDuplicateMedicine = async (newName) => {
  const medicines = await Medicine.find({}, "name");

  if (medicines.length === 0) {
    return { isDuplicate: false };
  }

  const existingNames = medicines.map((m) => m.name.toLowerCase());

  const result = stringSimilarity.findBestMatch(
    newName.toLowerCase(),
    existingNames
  );

  const { rating, target } = result.bestMatch;

  // Threshold can be adjusted (85% similarity)
  if (rating > 0.85) {
    return {
      isDuplicate: true,
      matchedWith: target,
      similarityScore: rating,
    };
  }

  return { isDuplicate: false };
};