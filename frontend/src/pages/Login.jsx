import React, { useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      alert("로그인 성공!");
      navigate("/dashboard");
    } catch (err) {
      alert("로그인 실패: " + err.response?.data?.message);
    }
  };

  return (
    <div className="container">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">로그인</button>
      </form>
      <p>
        계정이 없나요? <a href="/register">회원가입</a>
      </p>
    </div>
  );
};

export default Login;
