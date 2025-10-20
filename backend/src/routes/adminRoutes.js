const express = require("express");
const router = express.Router();
const { verifyAdmin } = require("../middleware/adminMiddleware");
const { getAllUsers, getAllMemories, getDashboardStats } = require("../controllers/adminController");

// 모든 유저 조회
router.get("/users", verifyAdmin, getAllUsers);

// 모든 추억 조회
router.get("/memories", verifyAdmin, getAllMemories);

// 관리자 대시보드 통계
router.get("/stats", verifyAdmin, getDashboardStats);

module.exports = router;
