const User = require("../models/userModel");
const Memory = require("../models/memoryModel");

// ✅ 전체 사용자 조회
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "email nickname role createdAt");
    res.json(users);
  } catch (error) {
    console.error("❌ getAllUsers Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ 전체 추억 조회
const getAllMemories = async (req, res) => {
  try {
    const memories = await Memory.find()
      .populate("createdBy", "email nickname")
      .sort({ createdAt: -1 });
    res.json(memories);
  } catch (error) {
    console.error("❌ getAllMemories Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ 통계 데이터 조회
const getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const memoryCount = await Memory.countDocuments();

    // 최근 7일 내 새로 추가된 추억 수
    const recent = await Memory.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }).countDocuments();

    res.json({
      userCount,
      memoryCount,
      recentMemories: recent,
      lastUpdated: new Date(),
    });
  } catch (error) {
    console.error("❌ getDashboardStats Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// ✅ 사용자 삭제 (선택 기능)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    res.json({ message: "사용자 삭제 완료", user });
  } catch (error) {
    console.error("❌ deleteUser Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllMemories,
  getDashboardStats,
  deleteUser,
};
