const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// 회원가입
const register = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname)
      return res.status(400).json({ message: "모든 필드를 입력해주세요." });

    // 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });

    // 사용자 생성
    const newUser = new User({ email, password, nickname });
    await newUser.save();

    res.status(201).json({ message: "회원가입 완료", user: newUser });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// 로그인
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "이메일과 비밀번호를 입력해주세요." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "존재하지 않는 이메일입니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

    // JWT 발급
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "로그인 성공",
      token,
      user: { id: user._id, email: user.email, nickname: user.nickname, role: user.role },
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login };
