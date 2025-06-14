// src/pages/HomeScreen.jsx
import React from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen() {
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  // get the user object (we only ever store id, fullName, email, userType)
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  // decide where “dashboard” should go
  let dashboardPath = "/";
  if (user?.userType === "admin") dashboardPath = "/admin";
  else if (user?.userType === "teacher") dashboardPath = "/teacher";
  else if (user?.userType === "student") dashboardPath = "/student";

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-100 flex items-center justify-center px-6">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-800 opacity-10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-96 h-96 bg-indigo-800 opacity-10 rounded-full animate-spin-slow"></div>
      <div className="absolute top-1/2 right-20 w-56 h-56 bg-indigo-800 opacity-5 rounded-full"></div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-xl">
        <img
          src="/logo-h.png"
          alt="Tuwaiq Academy Logo"
          className="mx-auto mb-6  h-32"
        />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-800 drop-shadow-lg">
          Tuwaiq Academy Project Manager
        </h1>
        <p className="mt-4 text-indigo-800/90 text-base sm:text-lg md:text-xl">
          Submit, review, and track graduation project ideas seamlessly.
          Students, teachers, and admins—manage every step in one place.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {isAuth ? (
            <Link
              to={dashboardPath}
              className="inline-block px-8 py-3 bg-indigo-800 text-neutral-100 font-semibold rounded-full shadow-lg transform transition hover:scale-105"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-block px-8 py-3 bg-indigo-800 text-neutral-100 font-semibold rounded-full shadow-lg transform transition hover:scale-105"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="inline-block px-8 py-3 bg-indigo-900 text-neutral-100 font-semibold rounded-full shadow-lg transform transition hover:scale-105"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
