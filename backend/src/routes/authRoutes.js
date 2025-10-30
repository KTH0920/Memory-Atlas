const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register); // 회원가입
router.post("/login", login);       // 로그인

module.exports = router;
