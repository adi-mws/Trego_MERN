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





/**
 * Save uploaded file into structured folder
 * @param {Object} file - multer file (req.file)
 * @param {string} basePath - e.g. "workspaces/avatars"
 * @returns {string} stored file path
 */
export const saveFile = async (file, basePath) => {
  try {
    if (!file) return null;

    const uploadsRoot = path.join(process.cwd(), "uploads");

    // normalize base path
    const safeBasePath = basePath.replace(/^\/+|\/+$/g, "");

    const targetDir = path.join(uploadsRoot, safeBasePath);

    // ensure directory exists
    await fs.promises.mkdir(targetDir, { recursive: true });

    // file extension
    const ext = path.extname(file.originalname);

    // unique filename
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e6
    )}${ext}`;

    const fullPath = path.join(targetDir, fileName);

    // move file (from temp to final)
    await fs.promises.rename(file.path, fullPath);

    // return relative path (used in DB)
    const relativePath = path.join(
      "uploads",
      safeBasePath,
      fileName
    );

    return "/" + relativePath.replace(/\\/g, "/");

  } catch (err) {
    console.error("File save failed:", err.message);
    throw err;
  }
};