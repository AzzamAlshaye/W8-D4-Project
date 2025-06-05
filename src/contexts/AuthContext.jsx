// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosConfig";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = Boolean(user);

  // Login function: call backend /auth/login
  const login = async (email, password) => {
    try {
      const resp = await axiosInstance.post("/auth/login", { email, password });
      // Expected response: { token, userId, email, fullName, userType }
      const { token, userId, fullName, userType, email: userEmail } = resp.data;

      // Save in localStorage:
      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({ userId, fullName, userType, email: userEmail })
      );

      setUser({ userId, fullName, userType, email: userEmail });
      toast.success("Login successful!");
      // Redirect based on userType:
      if (userType === "admin") navigate("/admin");
      else if (userType === "teacher") navigate("/teacher");
      else if (userType === "student") navigate("/student");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  // Logout function: clear everything
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("You have been logged out.");
    navigate("/login");
  };

  // We could implement a function to register a new student here, but we'll do it in the page

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth:
export function useAuth() {
  return useContext(AuthContext);
}
