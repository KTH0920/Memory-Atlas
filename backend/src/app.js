const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

// 라우트 불러오기
const authRoutes = require("./routes/authRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
const app = express();

// ======================= 미들웨어 =======================

// CORS 허용 (React 프론트엔드 연결 대비)
app.use(
  cors({
    origin: process.env.FRONT_ORIGIN || "*", // 필요 시 Vercel URL로 변경
    credentials: true,
  })
);

// JSON 데이터 파싱
app.use(express.json());

// 요청 로깅 (개발용)
app.use(morgan("dev"));

// ======================= DB 연결 =======================
connectDB();

// ======================= 라우트 연결 =======================
app.use("/api/auth", authRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/admin", adminRoutes);

// ======================= 기본 경로 =======================
app.get("/", (req, res) => {
  res.send("🚀 Memory Atlas Backend Running...");
});

module.exports = app;
