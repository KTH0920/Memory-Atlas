import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles.css";

const MyPage = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);

  // 검색 및 정렬 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("latest"); // latest, oldest, title

  // 수정 기능 상태
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState(null);

  // ✅ 로그인 유저의 추억 목록 불러오기
  const fetchMemories = async () => {
    try {
      const res = await api.get("/memories");
      setMemories(res.data);
    } catch (err) {
      console.error("메모리 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // ✅ 로그아웃
  const handleLogout = () => {
    if (window.confirm("정말 로그아웃 하시겠습니까?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // ✅ 추억 등록 페이지로 이동
  const handleAddMemory = () => {
    navigate("/add");
  };

  // ✅ 지도 보기 이동
  const handleMapView = () => {
    navigate("/map");
  };

  // ✅ 추억 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("이 추억을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/memories/${id}`);
      setMemories(memories.filter((m) => m._id !== id));
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // ✅ 수정 모드 시작
  const handleEditStart = (memory) => {
    setEditingId(memory._id);
    setEditTitle(memory.title);
    setEditDesc(memory.desc);
    setEditImage(null);
  };

  // ✅ 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDesc("");
    setEditImage(null);
  };

  // ✅ 추억 수정
  const handleUpdate = async (id) => {
    if (!editTitle.trim() || !editDesc.trim()) {
      return alert("제목과 내용을 입력해주세요!");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("desc", editDesc);
    if (editImage) {
      formData.append("image", editImage);
    }

    try {
      const res = await api.patch(`/memories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("추억이 수정되었습니다!");

      // 목록 갱신
      setMemories(memories.map((m) => (m._id === id ? res.data.memory : m)));

      // 수정 모드 종료
      handleEditCancel();
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 검색 및 정렬 적용
  const getFilteredAndSortedMemories = () => {
    let filtered = memories;

    // 검색 필터
    if (searchTerm.trim()) {
      filtered = filtered.filter((m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.desc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    let sorted = [...filtered];
    if (sortOption === "latest") {
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === "oldest") {
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  };

  const displayedMemories = getFilteredAndSortedMemories();

  return (
    <div className="dashboard-container">
      {/* 상단 헤더 */}
      <div className="dashboard-header">
        <h1 className="page-title">📸 나의 추억 아카이브</h1>
        <div className="header-buttons">
          <button className="add-memory-btn" onClick={handleAddMemory}>
            추억 등록
          </button>
          <button className="map-btn" onClick={handleMapView}>
            지도 보기
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 검색 및 정렬 */}
      <div className="filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 제목 또는 내용 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 15px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </div>
        <div className="sort-box">
          <label style={{ fontSize: "14px", color: "#666", marginRight: "8px" }}>
            정렬:
          </label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
              backgroundColor: "white",
            }}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="title">제목순</option>
          </select>
        </div>
      </div>

      {/* 추억 목록 */}
      <div className="memory-list">
        {displayedMemories.length === 0 ? (
          <p className="empty-text">
            {searchTerm ? "검색 결과가 없습니다 🔍" : "등록된 추억이 없습니다 🕊️"}
          </p>
        ) : (
          displayedMemories.map((m) => (
            <div key={m._id} className="memory-card">
              {editingId === m._id ? (
                // 수정 모드
                <div className="edit-form">
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt={m.title}
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "10px",
                      }}
                    />
                  )}
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="제목"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ddd",
                    }}
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="내용"
                    style={{
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ddd",
                      minHeight: "100px",
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files[0])}
                    style={{
                      marginBottom: "10px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      className="save-btn"
                      onClick={() => handleUpdate(m._id)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        height: "42px",
                        padding: "10px",
                        fontSize: "14px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "500",
                        opacity: loading ? 0.7 : 1,
                        boxSizing: "border-box",
                      }}
                    >
                      {loading ? "저장 중..." : "저장"}
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={handleEditCancel}
                      style={{
                        flex: 1,
                        height: "42px",
                        padding: "10px",
                        fontSize: "14px",
                        backgroundColor: "#999",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "500",
                        boxSizing: "border-box",
                      }}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 일반 표시 모드
                <>
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt={m.title}
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "10px",
                      }}
                    />
                  )}
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <span className="date">
                    {new Date(m.date).toLocaleDateString()}
                  </span>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "center" }}>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditStart(m)}
                      style={{
                        flex: 1,
                        height: "42px",
                        padding: "10px",
                        fontSize: "14px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "500",
                        boxSizing: "border-box",
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(m._id)}
                      style={{
                        flex: 1,
                        height: "42px",
                        padding: "10px",
                        fontSize: "14px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "500",
                        boxSizing: "border-box",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyPage;
