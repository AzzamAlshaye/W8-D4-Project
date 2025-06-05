// src/pages/Admin/AdminNavbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminNavbar() {
  const location = useLocation();
  const path = location.pathname;

  const links = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/students", label: "Students" },
    { to: "/admin/teachers", label: "Teachers" },
    { to: "/admin/ideas", label: "Ideas" },
    { to: "/admin/assign", label: "Assign Student" },
  ];

  return (
    <div className="bg-gray-700 text-white px-6 py-3">
      <ul className="flex space-x-4">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`hover:text-gray-300 ${
                path === link.to ? "underline" : ""
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
