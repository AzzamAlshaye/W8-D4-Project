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

  const roleLinks =
    user.userType === "admin"
      ? [
          { to: "/admin", label: "Dashboard" },
          { to: "/admin/students", label: "Students" },
          { to: "/admin/teachers", label: "Teachers" },
          { to: "/admin/ideas", label: "Ideas" },
          { to: "/admin/assign", label: "Assign" },
        ]
      : user.userType === "teacher"
      ? [
          { to: "/teacher", label: "Dashboard" },
          { to: "/teacher/ideas", label: "Review Ideas" },
        ]
      : [
          { to: "/student", label: "Dashboard" },
          { to: "/student/submit", label: "Submit Idea" },
        ];

  const isActive = (to) => location.pathname === to;

  const confirmLogout = () => {
    const id = toast.info(
      <div className="space-y-2 text-sm">
        <p>Are you sure you want to logout?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              logout();
              toast.dismiss(id);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(id)}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  };

  return (
    <>
      <ToastContainer position="top-center" />
      <nav className="bg-indigo-900 text-white px-4 py-3 flex items-center justify-between relative">
        {/* Logo/Home with white background */}
        <Link
          to="/"
          className="p-0.5 bg-neutral-100 rounded hover:bg-gray-100 flex items-center 
        "
        >
          <img src="/logo-h.png" alt="Logo" className=" w-35  object-cover  " />
        </Link>

        {/* Desktop Links */}
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

        {/* Right side desktop */}
        <div className="hidden lg:flex items-center space-x-4">
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="lg:hidden p-2 focus:outline-none"
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-indigo-800 lg:hidden z-10">
            <ul className="flex flex-col p-4 space-y-2">
              {/* User Info */}
              <li className="px-3 py-2 text-neutral-100 border-b border-gray-700">
                {user.fullName} (
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                )
              </li>
              {roleLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded hover:bg-gray-700 ${
                      isActive(link.to) ? "underline" : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    confirmLogout();
                  }}
                  className="w-full text-left px-3 py-2 bg-red-600 rounded hover:bg-red-700 text-sm"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
