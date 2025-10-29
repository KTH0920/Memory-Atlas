import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [memories, setMemories] = useState([]);

  useEffect(() => {
    const fetchMemories = async () => {
      const res = await api.get("/memories");
      setMemories(res.data);
    };
    fetchMemories();
  }, []);

  return (
    <div className="container">
      <h2>나의 추억 목록</h2>
      <Link to="/add">+ 추억 추가</Link>
      <div className="memory-list">
        {memories.map((m) => (
          <div key={m._id} className="memory-card">
            <img src={m.imageUrl} alt={m.title} width="200" />
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            <small>{m.date}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
