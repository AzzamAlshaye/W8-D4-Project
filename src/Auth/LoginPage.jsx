// src/pages/Auth/LoginPage.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import { useTitle } from "../hooks/useTitle";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const { login } = useAuth();
  const initialValues = { email: "", password: "" };
  useTitle("Login | Tuwaiq");
  const validate = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@tuwaiq\.edu\.sa$/i.test(values.email)) {
      errors.email = 'Email must end with "@tuwaiq.edu.sa".';
    }
    if (!values.password) {
      errors.password = "Required";
    }
    return errors;
  };

  const onSubmit = async (values, { setSubmitting }) => {
    await login(values.email, values.password);
    setSubmitting(false);
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center
        bg-[url('/background.svg')] bg-cover bg-center
        p-6
      "
    >
      <ToastContainer position="top-center" />

      <div className="bg-indigo-800 shadow-lg rounded-3xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="p-0.5 bg-neutral-100 rounded hover:bg-gray-100 flex items-center justify-center mb-6">
          <img src="/logo-h.png" alt="Logo" className="w-35 object-cover" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-neutral-100 mb-6 text-center">
          Log In
        </h2>

        {/* Form */}
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-neutral-100 font-medium mb-1"
                >
                  Email Address
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  placeholder="you@tuwaiq.edu.sa"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-neutral-100 font-medium mb-1"
                >
                  Password
                </label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  className="w-full px-4 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  placeholder="********"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Log In button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-neutral-100 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {isSubmitting ? "Logging In..." : "Log In"}
              </button>

              {/* Home button (darker) */}
              <Link
                to="/"
                className="w-full block text-center mt-4 py-2 bg-neutral-200 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-300 transition"
              >
                Home
              </Link>

              <p className="text-neutral-100 text-center mt-4">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-300 hover:underline font-medium"
                >
                  Register
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
