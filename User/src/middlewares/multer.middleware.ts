import multer from "multer";
import path from "path";
import fs from "fs";

// Resolve upload directory from project root
const uploadPath = path.resolve("public", "temp");

// Ensure directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadPath);
  },

  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Multer instance
const upload = multer({ storage });

export { upload };
