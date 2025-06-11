// src/api/axiosConfig.js
import axios from "axios";

// ────────────────────────────────────────────────────────────────────────
// Replace these with your three MockAPI base URLs:
export const primaryAPI = axios.create({
  baseURL: "https://6849101645f4c0f5ee6fda64.mockapi.io",
});

export const secondaryAPI = axios.create({
  baseURL: "https://6849106445f4c0f5ee6fdbc4.mockapi.io",
});

export const tertiaryAPI = axios.create({
  baseURL: "https://6849109a45f4c0f5ee6fdc32.mockapi.io",
});
// ────────────────────────────────────────────────────────────────────────

// Shared interceptor (optional): automatically attach token if present
[primaryAPI, secondaryAPI, tertiaryAPI].forEach((api) => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});
