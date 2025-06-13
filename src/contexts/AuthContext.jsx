import React, { createContext, useContext, useState } from "react";
import { primaryAPI } from "../api/axiosConfig";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Just parse whatever "user" is in localStorage (we only ever write safe fields)
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // Load authentication flag
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  // Perform login by checking mock API, then store only safe user + token + flag
  const login = async (email, password) => {
    try {
      // Fetch matching user(s) — we do get their password from the API to verify...
      const resp = await primaryAPI.get("/auth", { params: { email } });
      const users = resp.data;
      if (users.length === 0) {
        toast.error("No account found with that email.");
        return;
      }
      const found = users[0];

      // verify password, but never store it
      if (found.password !== password) {
        toast.error("Incorrect password.");
        return;
      }

      // create mock token
      const token = `mock-token-${found.id}`;
      localStorage.setItem("token", token);

      // only these four fields ever go into localStorage
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

      // redirect
      if (found.userType === "admin") navigate("/admin");
      else if (found.userType === "teacher") navigate("/teacher");
      else if (found.userType === "student") navigate("/student");
      else navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please try again later.");
    }
  };

  // Clear all auth data on logout
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
