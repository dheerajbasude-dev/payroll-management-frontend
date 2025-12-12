import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor adds token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: optional global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // you can handle global auth/logout logic here based on status
    return Promise.reject(err);
  }
);

export default api;
