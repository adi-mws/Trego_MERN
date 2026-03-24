import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

/* -------------------- Helpers -------------------- */

const ensureFolderExists = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

export const createFileFilter = (types) => {
  return (req, file, cb) => {
    if (types.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type"));
  };
};

const getMemoryStorage = () => multer.memoryStorage();

const getDiskStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), "uploads", folder);
      ensureFolderExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${file.fieldname}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

/* -------------------- Main Uploader -------------------- */

/**
 * createUploader
 *
 * @param {string} folder
 * @param {"single"|"multiple"} mode
 * @param {string} fieldName
 * @param {number} maxCount
 * @param {string[]} allowedTypes
 * @param {boolean} optimize
 * @param {{
 *   width?: number,
 *   height?: number,
 *   quality?: number
 * }} resizeOptions
 */
export const createUploader = (
  folder,
  mode,
  fieldName,
  maxCount = 100,
  allowedTypes = null,
  optimize = true,
  resizeOptions = { width: 1200, quality: 80 }
) => {
  const defaultTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf",
  ];

  const fileFilter = createFileFilter(allowedTypes || defaultTypes);

  const storage = optimize
    ? getMemoryStorage()
    : getDiskStorage(folder);

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  });

  const multerMiddleware =
    mode === "single"
      ? upload.single(fieldName)
      : upload.array(fieldName, maxCount);

  // If optimization disabled → normal multer
  if (!optimize) return multerMiddleware;

  // Wrapped middleware with Sharp optimization
  return (req, res, next) => {
    multerMiddleware(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file && !req.files) return next();

      const files = req.file ? [req.file] : req.files;
      const uploadPath = path.join(process.cwd(), "uploads", folder);
      ensureFolderExists(uploadPath);

      try {
        for (const file of files) {
          // Skip non-images (PDF etc.)
          if (!file.mimetype.startsWith("image/")) continue;

          const filename = `${file.fieldname}-${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}.webp`;

          const fullPath = path.join(uploadPath, filename);

          /* ---- Resize Logic (Safe & Flexible) ---- */
          const resizeConfig = { withoutEnlargement: true };

          if (resizeOptions.width && resizeOptions.height) {
            resizeConfig.width = resizeOptions.width;
            resizeConfig.height = resizeOptions.height;
            resizeConfig.fit = "cover";
          } else if (resizeOptions.width) {
            resizeConfig.width = resizeOptions.width;
          } else if (resizeOptions.height) {
            resizeConfig.height = resizeOptions.height;
          }

          await sharp(file.buffer)
            .rotate() // auto-fix EXIF orientation
            .resize(resizeConfig)
            .webp({ quality: resizeOptions.quality ?? 80 })
            .toFile(fullPath);

          const stats = await fs.promises.stat(fullPath);

          // Normalize Multer file object
          file.filename = filename;
          file.path = fullPath;
          file.destination = uploadPath;
          file.mimetype = "image/webp";
          file.size = stats.size;
          file.originalname = filename;
        }

        next();
      } catch (error) {
        next(error);
      }
    });
  };
};
