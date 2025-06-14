// src/pages/HomeScreen.jsx
import React from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { useTitle } from "../hooks/useTitle";

export default function HomeScreen() {
  const isAuth = localStorage.getItem("isAuthenticated") === "true";
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;
  useTitle("Home | Tuwaiq");

  let dashboardPath = "/";
  if (user?.userType === "admin") dashboardPath = "/admin";
  else if (user?.userType === "teacher") dashboardPath = "/teacher";
  else if (user?.userType === "student") dashboardPath = "/student";

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-100 px-6 flex flex-col">
      {/* Decorative blobs */}
      <div className="lg:block hidden absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-800 opacity-10 rounded-full animate-pulse" />
      <div className="lg:block hidden absolute bottom-[-15%] right-[-15%] w-96 h-96 bg-indigo-800 opacity-10 rounded-full animate-spin-slow" />
      <div className="lg:block hidden absolute top-1/2 right-20 w-56 h-56 bg-indigo-800 opacity-5 rounded-full" />

      {/* 1) Logo always at top lower on lg */}
      <div className="pt-12 lg:pt-16 flex justify-center z-10">
        <img
          src="/logo-h.png"
          alt="Tuwaiq Academy Logo"
          className="h-32 lg:h-52"
        />
      </div>

      {/* 2) Hero text/buttons centered in remaining space */}
      <div className="flex-grow flex items-center justify-center z-10">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-800 drop-shadow-xs">
            Tuwaiq Academy Project Manager
          </h1>
          <p className="mt-4 text-indigo-800/90 text-base sm:text-lg md:text-xl">
            Submit, review, and track graduation project ideas seamlessly.
            Students, teachers, and admins—manage every step in one place.
          </p>

          {/* buttons */}
          <div className="mt-20 lg:mt-8 flex flex-col sm:flex-row gap-4 justify-center">
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
    </div>
  );
}
