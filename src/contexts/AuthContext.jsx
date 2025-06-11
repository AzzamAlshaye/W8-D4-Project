// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { primaryAPI } from "../api/axiosConfig";
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

  // Login: fetch user record by email from MockAPI and validate password client-side
  const login = async (email, password) => {
    try {
      const resp = await primaryAPI.get("/auth", { params: { email } });
      const users = resp.data;
      if (users.length === 0) {
        toast.error("No account found with that email.");
        return;
      }
      const userData = users[0];
      if (userData.password !== password) {
        toast.error("Incorrect password.");
        return;
      }

      // Generate a mock token
      const token = `mock-token-${userData.id}`;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      toast.success("Login successful!");
      // Redirect based on userType
      if (userData.userType === "admin") {
        navigate("/admin");
      } else if (userData.userType === "teacher") {
        navigate("/teacher");
      } else if (userData.userType === "student") {
        navigate("/student");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please try again later.");
    }
  };

  // Logout: clear stored info and redirect to login
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.info("You have been logged out.");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access auth context
export function useAuth() {
  return useContext(AuthContext);
}
