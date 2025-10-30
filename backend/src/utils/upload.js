const multer = require("multer");

// 메모리에 임시 저장 (파일 직접 S3 업로드)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 최대 5MB
});

module.exports = { upload };
