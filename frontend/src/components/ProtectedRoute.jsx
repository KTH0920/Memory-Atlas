import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 로그인 안 되어 있으면 로그인 페이지로
  if (!token || !user) return <Navigate to="/login" replace />;

  // 관리자 전용 페이지 접근 제한
  if (role && user.role !== role) {
    alert("관리자 권한이 필요합니다.");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
