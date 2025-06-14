// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { primaryAPI } from "../api/axiosConfig";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const login = async (email, password) => {
    let users = [];

    try {
      // Try fetching matching user(s)
      const resp = await primaryAPI.get("/auth", { params: { email } });
      // If your API returns an array on success:
      users = Array.isArray(resp.data)
        ? resp.data.filter((u) => u.email.toLowerCase() === email.toLowerCase())
        : [];
    } catch (fetchErr) {
      // If it's a 404, no account exists
      if (fetchErr.response?.status === 404) {
        toast.error("No account found with that email.");
      } else {
        console.error("API error:", fetchErr);
        toast.error("Unable to reach the server. Please try again later.");
      }
      return;
    }

    // In case your API returns [] with 200 OK
    if (users.length === 0) {
      toast.error("No account found with that email.");
      return;
    }

    const found = users[0];
    if (found.password !== password) {
      toast.error("Incorrect password.");
      return;
    }

    // Success → store token + user
    const token = `mock-token-${found.id}`;
    localStorage.setItem("token", token);

    const safeUser = {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      userType: found.userType,
    };
    localStorage.setItem("user", JSON.stringify(safeUser));
    localStorage.setItem("isAuthenticated", "true");

    setUser(safeUser);
    setIsAuthenticated(true);
    toast.success("Login successful!");

    // Redirect by role
    if (found.userType === "admin") navigate("/admin");
    else if (found.userType === "teacher") navigate("/teacher");
    else if (found.userType === "student") navigate("/student");
    else navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    setUser(null);
    setIsAuthenticated(false);
    toast.info("You have been logged out.");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
