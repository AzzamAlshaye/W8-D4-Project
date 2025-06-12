// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  // Build role‐based links
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
  } else {
    roleLinks = [
      { to: "/student", label: "Dashboard" },
      { to: "/student/submit", label: "Submit Idea" },
    ];
  }

  const isActive = (to) => location.pathname === to;

  // Confirmation toast before logout
  function confirmLogout() {
    const id = toast.info(
      <div className="space-y-2">
        <p className="text-sm">Are you sure you want to logout?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              logout();
              toast.dismiss(id);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(id)}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
            No
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      }
    );
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <nav className="bg-gray-800 text-white px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between relative">
        {/* Left: Home */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-lg font-semibold hover:text-gray-300">
            Home
          </Link>
        </div>

        {/* Center: Desktop links + Mobile burger */}
        <div className="flex items-center">
          <ul className="hidden lg:flex space-x-6">
            {roleLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`hover:text-gray-300 ${
                    isActive(link.to) ? "underline" : ""
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="lg:hidden p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Right: User info + Logout */}
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            {user.fullName} (
            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)})
          </span>
          <button
            onClick={confirmLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-gray-800 lg:hidden z-10">
            <ul className="flex flex-col space-y-2 p-4">
              {roleLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 px-3 rounded hover:bg-gray-700 ${
                      isActive(link.to) ? "underline" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
