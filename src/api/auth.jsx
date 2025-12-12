import api from "./axios";

export const loginApi = (payload) => api.post("/api/auth/token", payload);
export const backendLogoutApi = () =>axios.post("/api/auth/logout", {}, { withCredentials: false });