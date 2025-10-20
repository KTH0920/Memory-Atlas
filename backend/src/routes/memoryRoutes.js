const express = require("express");
const router = express.Router();

// 테스트용 라우트
router.get("/", (req, res) => {
  res.send("✅ Memory Routes Working!");
});

module.exports = router;
