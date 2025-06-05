// src/api/axiosConfig.js
import axios from "axios";

const API_BASE_URL = "https://your-backend.com/api";
// ↳ Replace with your actual backend URL

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach the token from localStorage on each request (if present)
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
