// src/router/Router.jsx
import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router"; // (or "react-router-dom" if that's what your version uses)

import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

// ── Public Pages ──────────────────────────────────────────────────────
import HomePage from "../pages/HomePage";
import LoginPage from "../Auth/LoginPage";
import Register from "../Auth/Register";

// ── Admin Pages ───────────────────────────────────────────────────────
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageStudents from "../pages/Admin/ManageStudents";
import ManageTeachers from "../pages/Admin/ManageTeachers";
import ManageIdeas from "../pages/Admin/ManageIdeas";
import AssignStudent from "../pages/Admin/AssignStudent";

// ── Teacher Pages ─────────────────────────────────────────────────────
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import ReviewIdeas from "../pages/Teacher/ReviewIdeas";

// ── Student Pages ─────────────────────────────────────────────────────
import StudentDashboard from "../pages/Student/StudentDashboard";
import SubmitIdea from "../pages/Student/SubmitIdea";

// ── 404 / Fallback ─────────────────────────────────────────────────────
import NotFound from "../pages/NotFound";

// A simple root layout that just renders child routes via <Outlet />
function RootLayout() {
  return <Outlet />;
}

const router = createBrowserRouter([
  // ────────────────────────── Public Routes ──────────────────────────
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <Register /> },
    ],
  },

  // ───────────────────── Protected: Admin (userType === "admin") ─────────────────────
  {
    path: "admin",
    // Wrap all /admin/* routes in ProtectedRoute (role = "admin")
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "students", element: <ManageStudents /> },
      { path: "teachers", element: <ManageTeachers /> },
      { path: "ideas", element: <ManageIdeas /> },
      { path: "assign", element: <AssignStudent /> },
    ],
  },

  // ───────────────────── Protected: Teacher (userType === "teacher") ─────────────────────
  {
    path: "teacher",
    element: <ProtectedRoute requiredRole="teacher" />,
    children: [
      { index: true, element: <TeacherDashboard /> },
      { path: "ideas", element: <ReviewIdeas /> },
    ],
  },

  // ───────────────────── Protected: Student (userType === "student") ─────────────────────
  {
    path: "student",
    element: <ProtectedRoute requiredRole="student" />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: "submit", element: <SubmitIdea /> },
    ],
  },

  // ───────────────────────────── Catch-All (404) ────────────────────────────
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function AppRouter() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
