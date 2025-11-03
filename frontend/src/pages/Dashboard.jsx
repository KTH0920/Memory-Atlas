import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import "../styles.css";

const Dashboard = () => {
  const [memories, setMemories] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

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

// ✅ 추억 추가
const handleAddMemory = async (e) => {
  e.preventDefault();

  // ✅ 이미지 선택 안 한 경우 경고 띄우기
  if (!image) {
    alert("이미지를 선택해주세요!");
    return;
  }

  setLoading(true);
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  formData.append("image", image);

  try {
    await api.post("/memories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("새 추억이 등록되었습니다!");
    setTitle("");
    setContent("");
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

  return (
    <div className="dashboard-container">
      <h1 className="page-title">📸 나의 추억 아카이브</h1>

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
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
              {m.imageUrl && <img src={m.imageUrl} alt={m.title} />}
              <h3>{m.title}</h3>
              <p>{m.content}</p>
              <span className="date">
                {new Date(m.date).toLocaleDateString()}
              </span>
              <button
                className="delete-btn"
                onClick={() => handleDelete(m._id)}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
