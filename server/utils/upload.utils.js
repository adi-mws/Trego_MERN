import fs from "fs";
import path from "path";

/**
 * Deletes a file from /uploads safely
 * @param {string} fileUrl - full URL or relative path
 */
export const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    let filePath = fileUrl;

    if (fileUrl.startsWith("http")) {
      const url = new URL(fileUrl);
      filePath = url.pathname; 
    }

    if (!filePath.startsWith("/uploads")) return;

    const fullPath = path.join(process.cwd(), filePath);

    const uploadsDir = path.join(process.cwd(), "uploads");

    if (!fullPath.startsWith(uploadsDir)) return;

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }

  } catch (err) {
    console.error("File delete skipped:", err.message);
  }
};