import React, { useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { email, password, nickname });
      alert("회원가입 완료!");
      navigate("/login");
    } catch (err) {
      alert("회원가입 실패: " + err.response?.data?.message);
    }
  };

  return (
    <div className="login-container">
      <h1>🌟 Memory Atlas</h1>
      <form onSubmit={handleRegister} className="login-form">
        <input
          type="email"
          placeholder="📧 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="👤 닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="🔒 비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn">회원가입</button>

        <p className="register-text">
          이미 계정이 있으신가요?{" "}
          <span className="register-link" onClick={() => navigate("/login")}>
            로그인
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
