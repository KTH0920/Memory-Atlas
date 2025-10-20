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

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// DB 연결
connectDB();

// 라우트 연결
app.use("/api/auth", authRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/admin", adminRoutes);

// 기본 응답
app.get("/", (req, res) => {
  res.send("Memory Atlas Backend Running...");
});

module.exports = app;
