import React, { useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

const AddMemory = () => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("tags", tags);
    formData.append("date", date);
    formData.append("image", image);

    try {
      await api.post("/memories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("추억 등록 완료!");
      navigate("/dashboard");
    } catch (err) {
      alert("업로드 실패: " + err.response?.data?.message);
    }
  };

  return (
    <div className="container">
      <h2>추억 등록</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="내용" value={desc} onChange={(e) => setDesc(e.target.value)} required />
        <input type="text" placeholder="태그 (쉼표로 구분)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="file" onChange={(e) => setImage(e.target.files[0])} required />
        <button type="submit">등록</button>
      </form>
    </div>
  );
};

export default AddMemory;
