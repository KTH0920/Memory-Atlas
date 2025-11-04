// ✅ 1️⃣ 환경변수 가장 먼저 불러오기
require("dotenv").config();

// ✅ 2️⃣ 그 다음 Express 앱 로드
const app = require("./app");

// ✅ 3️⃣ 포트 설정 및 서버 실행
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
