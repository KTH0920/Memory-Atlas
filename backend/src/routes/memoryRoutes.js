const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { upload } = require("../utils/upload");
const {
  createMemory,
  getAllMemories,
  getMemoryById,
  updateMemory,
  deleteMemory,
} = require("../controllers/memoryController");

// 추억 등록 (이미지 업로드 포함)
router.post("/", verifyToken, upload.single("image"), createMemory);

// 전체 추억 조회 (공개)
router.get("/", verifyToken, getAllMemories);

// 단일 추억 상세 조회
router.get("/:id", getMemoryById);

// 추억 수정 (본인만 가능)
router.patch("/:id", verifyToken, upload.single("image"), updateMemory);

// 추억 삭제 (본인만 가능)
router.delete("/:id", verifyToken, deleteMemory);

module.exports = router;
