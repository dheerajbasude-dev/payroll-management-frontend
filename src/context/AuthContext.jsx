import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios";
import { loginApi, backendLogoutApi } from "../api/auth";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Sync token with axios + localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [token, user]);

  // LOGIN
  const login = async (credentials) => {
    setLoading(true);

    // Prevent old token during login
    delete axios.defaults.headers.common["Authorization"];

    try {
      const res = await loginApi(credentials);
      const data = res.data;

      const newToken = data.token || data.accessToken;

      setToken(newToken);
      setUser(data.user || { username: credentials.username });

      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // LOGOUT — now calls BACKEND + clears everything
  const logout = async () => {
    try {
      // Make backend logout call
      await backendLogoutApi();
    } catch (err) {
      console.warn("Logout failed on backend (ignored):", err?.response?.data);
    }

    // Clear local state + axios header
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];

    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
