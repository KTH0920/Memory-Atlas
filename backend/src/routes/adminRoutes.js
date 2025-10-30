const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");
const {
  getAllUsers,
  getAllMemories,
  getDashboardStats,
  deleteUser,
} = require("../controllers/adminController");

// ✅ 관리자 전용 라우트 (모두 JWT + 관리자 권한 필요)
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.get("/memories", verifyToken, verifyAdmin, getAllMemories);
router.get("/stats", verifyToken, verifyAdmin, getDashboardStats);
router.delete("/deleteUser/:id", verifyToken, verifyAdmin, deleteUser);

module.exports = router;
