import axios from "axios";

// axios 인스턴스를 생성하고 이름을 api로 지정
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 요청마다 JWT 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
