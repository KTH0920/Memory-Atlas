const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { upload } = require("../utils/upload");
const {
  createMemory,
  getAllMemories,
  deleteMemory,
} = require("../controllers/memoryController");

// 이미지 업로드 + 추억 등록
router.post("/", verifyToken, upload.single("image"), createMemory);

// 전체 추억 조회 (공개용)
router.get("/", getAllMemories);

// 특정 추억 삭제 (본인 또는 관리자)
router.delete("/:id", verifyToken, deleteMemory);

module.exports = router;
