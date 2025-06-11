// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // If not logged in, don’t show the navbar
  if (!user) return null;

  const basePath = location.pathname.split("/")[1]; // "admin", "teacher", or "student"

  const commonLinks = [
    { to: "/", label: "Home" },
    // you could add a “Profile” link here
  ];

  let roleLinks = [];
  if (user.userType === "admin") {
    roleLinks = [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/students", label: "Students" },
      { to: "/admin/teachers", label: "Teachers" },
      { to: "/admin/ideas", label: "Ideas" },
      { to: "/admin/assign", label: "Assign" },
    ];
  } else if (user.userType === "teacher") {
    roleLinks = [
      { to: "/teacher", label: "Dashboard" },
      { to: "/teacher/ideas", label: "Review Ideas" },
    ];
  } else if (user.userType === "student") {
    roleLinks = [
      { to: "/student", label: "Dashboard" },
      { to: "/student/submit", label: "Submit Idea" },
    ];
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <ul className="flex space-x-4">
        {roleLinks.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`hover:text-gray-300 ${
                location.pathname === link.to ? "underline" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex items-center space-x-4">
        <span className="text-sm">
          {user.fullName} (
          {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)})
        </span>
        <button
          onClick={logout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
