import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddMemory from "./pages/AddMemory";
import AdminDashboard from "./pages/AdminDashboard";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<AddMemory />} />
        <Route path="/admin" element={<AdminDashboard />} /> {/* 👑 추가 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
