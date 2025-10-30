import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [memories, setMemories] = useState([]);

  // 로그인한 사용자 정보 가져오기
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 관리자 아닌 경우 접근 차단
  useEffect(() => {
    if (!token || !user || user.role !== "admin") {
      alert("관리자 전용 페이지입니다.");
      navigate("/dashboard");
    }
  }, [navigate, token, user]);

  // 관리자 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statRes, usersRes, memoriesRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/memories"),
        ]);
        setStats(statRes.data);
        setUsers(usersRes.data);
        setMemories(memoriesRes.data);
      } catch (err) {
        console.error("❌ 관리자 데이터 불러오기 실패:", err);
      }
    };
    fetchData();
  }, []);

  if (!stats) return <div>로딩 중...</div>;

  return (
    <div className="container">
      <h1>👑 관리자 대시보드</h1>

      <section className="stats">
        <h2>📊 통계</h2>
        <p>전체 유저 수: <b>{stats.userCount}</b></p>
        <p>전체 추억 수: <b>{stats.memoryCount}</b></p>
        <p>최근 7일 등록된 추억: <b>{stats.recentMemories}</b></p>
      </section>

      <hr />

      <section className="users">
        <h2>👥 사용자 목록</h2>
        <table>
          <thead>
            <tr>
              <th>이메일</th>
              <th>닉네임</th>
              <th>권한</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.nickname}</td>
                <td>{u.role}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr />

      <section className="memories">
        <h2>🖼️ 등록된 추억</h2>
        <div className="memory-list">
          {memories.map((m) => (
            <div key={m._id} className="memory-card">
              <img src={m.imageUrl} alt={m.title} width="200" />
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              <small>
                작성자: {m.createdBy?.nickname || "알 수 없음"}  
                <br /> {new Date(m.date).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
