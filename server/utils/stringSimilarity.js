import stringSimilarity from "string-similarity";

// ── Check if text is similar to any item in the database ─────────────────────
export const checkSimilarity = (text, databaseTexts) => {
  // ✅ Guard — if not array or empty, return false (not fake)
  if (!Array.isArray(databaseTexts) || databaseTexts.length === 0) return false;

  // ✅ Filter out nulls and convert everything to string
  const cleanTexts = databaseTexts
    .filter(t => t !== null && t !== undefined)
    .map(t => String(t).toLowerCase().trim())
    .filter(t => t.length > 0);

  if (cleanTexts.length === 0) return false;

  const matches = cleanTexts.map(t =>
    stringSimilarity.compareTwoStrings(text.toLowerCase().trim(), t)
  );

  return matches.some(score => score > 0.8); // 80% similarity = fake
};

// ── Get similarity score between two strings (0-1) ───────────────────────────
export const getSimilarityScore = (str1, str2) => {
  if (!str1 || !str2) return 0;
  return stringSimilarity.compareTwoStrings(
    str1.toLowerCase().trim(),
    str2.toLowerCase().trim()
  );
};