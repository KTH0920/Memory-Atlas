// 관리자만 접근 허용
const verifyAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "관리자만 접근 가능합니다." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "관리자 인증 오류" });
  }
};

module.exports = { verifyAdmin };
