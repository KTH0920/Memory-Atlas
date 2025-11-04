import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import "../styles.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(null);
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

  // ✅ 추억 추가
  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("이미지를 선택해주세요!");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("image", image);

    try {
      await api.post("/memories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("새 추억이 등록되었습니다!");
      setTitle("");
      setDesc("");
      setImage(null);
      fetchMemories();
    } catch (err) {
      console.error("추억 등록 실패:", err);
      alert("추억 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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

  // ✅ 수정 모드 진입
  const handleEdit = (memory) => {
    setEditMode(memory._id);
    setEditTitle(memory.title);
    setEditDesc(memory.desc);
    setEditImage(null);
  };

  // ✅ 수정 취소
  const handleCancelEdit = () => {
    setEditMode(null);
    setEditTitle("");
    setEditDesc("");
    setEditImage(null);
  };

  // ✅ 수정 저장
  const handleUpdate = async (id) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("desc", editDesc);
    if (editImage) formData.append("image", editImage);

    try {
      await api.patch(`/memories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("추억이 수정되었습니다!");
      setEditMode(null);
      fetchMemories();
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* ✅ 상단 헤더 */}
      <div className="dashboard-header">
        <h1 className="page-title">📸 나의 추억 아카이브</h1>
        <button className="logout-btn" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      {/* 업로드 폼 */}
      <form onSubmit={handleAddMemory} className="memory-form">
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="내용"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit" disabled={loading}>
          {loading ? "업로드 중..." : "추억 추가"}
        </button>
      </form>

      {/* 추억 목록 */}
      <div className="memory-list">
        {memories.length === 0 ? (
          <p className="empty-text">등록된 추억이 없습니다 🕊️</p>
        ) : (
          memories.map((m) => (
            <div key={m._id} className="memory-card">
              {editMode === m._id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files[0])}
                  />
                  <button
                    onClick={() => handleUpdate(m._id)}
                    disabled={loading}
                  >
                    {loading ? "수정 중..." : "저장"}
                  </button>
                  <button onClick={handleCancelEdit}>취소</button>
                </>
              ) : (
                <>
                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt={m.title}
                      style={{
                        width: "100%",
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
                  <div className="btn-group">
                    <button onClick={() => handleEdit(m)}>수정</button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(m._id)}
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

export default Dashboard;
