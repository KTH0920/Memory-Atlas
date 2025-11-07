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

  const handleLogout = () => {
    if (window.confirm("정말 로그아웃 하시겠습니까?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  if (!stats) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", padding: "100px 20px" }}>
        <div className="loading"></div>
        <p style={{ marginTop: "20px", color: "#64748b" }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container admin-dashboard">
      {/* 헤더 */}
      <div className="dashboard-header">
        <h1 className="page-title">👑 관리자 대시보드</h1>
        <div className="header-buttons">
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>전체 유저</h3>
            <p className="stat-number">{stats.userCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-info">
            <h3>전체 추억</h3>
            <p className="stat-number">{stats.memoryCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>최근 7일</h3>
            <p className="stat-number">{stats.recentMemories}</p>
          </div>
        </div>
      </div>

      {/* 사용자 목록 */}
      <section className="admin-section">
        <h2 className="section-title">👥 사용자 목록</h2>
        <div className="table-container">
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
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role === "admin" ? "관리자" : "사용자"}
                    </span>
                  </td>
                  <td>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 등록된 추억 */}
      <section className="admin-section">
        <h2 className="section-title">🖼️ 등록된 추억</h2>
        <div className="memory-list">
          {memories.map((m) => (
            <div key={m._id} className="memory-card">
              <div className="memory-card-content">
                {m.imageUrl && <img src={m.imageUrl} alt={m.title} />}
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <div className="memory-meta">
                  <span className="author">
                    👤 {m.createdBy?.nickname || "알 수 없음"}
                  </span>
                  <span className="date">
                    {m.date ? new Date(m.date).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
