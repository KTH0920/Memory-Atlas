import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(  res.data.user));

      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      else navigate("/dashboard");
    } catch (err) {
      alert("❌ 로그인 실패: " + (err.response?.data?.message || "서버 오류"));
    }
  };

  return (
    <div className="login-container">
      <h1>로그인</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn">로그인</button>

        <p className="register-text">
          아직 계정이 없으신가요?{" "}
          <span className="register-link" onClick={() => navigate("/register")}>
            회원가입
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
