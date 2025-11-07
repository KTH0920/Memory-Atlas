import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyPage from "./pages/MyPage";
import AddMemory from "./pages/AddMemory";
import AdminDashboard from "./pages/AdminDashboard";
import MapView from "./pages/MapView";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기본 라우트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ✅ 보호된 유저 라우트 */}
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddMemory />
            </ProtectedRoute>
          }
        />

        {/* ✅ 지도 보기 (로그인 필요) */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapView />
            </ProtectedRoute>
          }
        />

        {/* 👑 관리자 전용 라우트 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ 존재하지 않는 경로 처리 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
