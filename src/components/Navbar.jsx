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
      <div className="space-y-2 text-sm text-gray-800">
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
        {/* Logo/Home */}
        <Link
          to="/"
          className="p-0.5 bg-neutral-100 rounded hover:bg-gray-100 flex items-center"
        >
          <img src="/logo-h.png" alt="Logo" className="w-32 object-cover" />
        </Link>

        {/* Desktop Links */}
        <ul className="hidden lg:flex space-x-8">
          {roleLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`relative px-1 py-2 group transition-colors duration-200
                  ${
                    isActive(link.to)
                      ? "text-blue-300"
                      : "text-white hover:text-gray-300"
                  }`}
              >
                <span className="relative z-10">{link.label}</span>
                <span
                  className={`absolute left-0 bottom-0 h-0.5 w-full bg-blue-300 transform transition-transform duration-300
                    ${
                      isActive(link.to) ? "scale-x-100" : "scale-x-0"
                    } group-hover:scale-x-100`}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* User Info & Logout (Desktop) */}
        <div className="hidden lg:flex items-center space-x-6">
          <span className="text-sm">
            {user.fullName} (
            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)})
          </span>
          <button
            onClick={confirmLogout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 text-sm transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="lg:hidden p-2 focus:outline-none transition-transform duration-200"
        >
          {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Mobile Menu with Smooth Animation */}
        <div
          className={`absolute top-full left-0 w-full bg-indigo-800 lg:hidden z-10 overflow-hidden transform origin-top transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? "scale-y-100" : "scale-y-0"}`}
        >
          <ul className="flex flex-col p-4 space-y-2">
            {/* User Info */}
            <li className="px-3 py-2 text-neutral-100 border-b border-gray-700">
              {user.fullName} (
              {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)})
            </li>
            {roleLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded transition-colors duration-200
                    ${
                      isActive(link.to)
                        ? "text-blue-300 bg-indigo-700"
                        : "text-white hover:bg-gray-700"
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
                className="w-full text-center  px-3 py-2 bg-red-600 rounded hover:bg-red-700 text-sm transition-colors duration-200 "
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
