// src/router/Router.jsx
import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router";

import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";

// Layouts
function PublicLayout() {
  return <Outlet />;
}

function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

// Public Pages
import HomePage from "../pages/HomePage";
import LoginPage from "../Auth/LoginPage";
import Register from "../Auth/Register";

// Admin Pages
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageStudents from "../pages/Admin/ManageStudents";
import ManageTeachers from "../pages/Admin/ManageTeachers";
import ManageIdeas from "../pages/Admin/ManageIdeas";
import AssignStudent from "../pages/Admin/AssignStudent";

// Teacher Pages
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import ReviewIdeas from "../pages/Teacher/ReviewIdeas";

// Student Pages
import StudentDashboard from "../pages/Student/StudentDashboard";
import SubmitIdea from "../pages/Student/SubmitIdea";

// Fallback
import NotFound from "../pages/NotFound";

const router = createBrowserRouter([
  {
    // Public, no Navbar
    element: (
      <AuthProvider>
        <PublicLayout />
      </AuthProvider>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    // Authenticated, with Navbar
    element: (
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    ),
    children: [
      // Admin
      {
        path: "admin",
        element: <ProtectedRoute requiredRole="admin" />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "students", element: <ManageStudents /> },
          { path: "teachers", element: <ManageTeachers /> },
          { path: "ideas", element: <ManageIdeas /> },
          { path: "assign", element: <AssignStudent /> },
        ],
      },
      // Teacher
      {
        path: "teacher",
        element: <ProtectedRoute requiredRole="teacher" />,
        children: [
          { index: true, element: <TeacherDashboard /> },
          { path: "ideas", element: <ReviewIdeas /> },
        ],
      },
      // Student
      {
        path: "student",
        element: <ProtectedRoute requiredRole="student" />,
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: "submit", element: <SubmitIdea /> },
        ],
      },
      // 404
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
