// src/utils/upload.js
const multer = require("multer");

// ✅ 메모리에 임시 저장 (파일 직접 S3 업로드는 memoryController에서 수행)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("이미지 파일만 업로드 가능합니다."), false);
    }
  },
});

module.exports = { upload };
