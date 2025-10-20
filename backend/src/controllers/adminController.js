const User = require("../models/userModel");
const Memory = require("../models/memoryModel");

// 모든 유저 조회
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // 비밀번호 제외
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 모든 추억 조회
const getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find().populate("createdBy", "email nickname");
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 관리자 대시보드 통계
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMemories = await Memory.countDocuments();
    const latestMemory = await Memory.findOne().sort({ createdAt: -1 });

    res.json({
      totalUsers,
      totalMemories,
      latestMemory: latestMemory ? latestMemory.title : "등록된 추억 없음",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getAllMemories,
  getDashboardStats,
};
