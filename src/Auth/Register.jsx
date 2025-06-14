// src/pages/Auth/RegisterPage.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate, Link } from "react-router";
import { primaryAPI } from "../api/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const initialValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validate = (values) => {
    const errors = {};

    // Full Name: count only non-space characters
    const nameLetters = values.fullName.replace(/\s/g, "");
    if (!nameLetters) {
      errors.fullName = "Required";
    } else if (nameLetters.length < 3) {
      errors.fullName = "Must be at least 3 letters";
    } else if (nameLetters.length > 50) {
      errors.fullName = "Can't exceed 50 letters";
    }

    // Email
    if (!values.email) {
      errors.email = "Required";
    } else if (/\s/.test(values.email)) {
      errors.email = "Email cannot contain spaces";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    } else if (!values.email.endsWith("@tuwaiq.edu.sa")) {
      errors.email = 'Email must end with "@tuwaiq.edu.sa".';
    }

    // Password
    if (!values.password) {
      errors.password = "Required";
    } else if (/\s/.test(values.password)) {
      errors.password = "Password cannot contain spaces";
    } else if (values.password.length < 8) {
      errors.password = "Must be at least 8 characters";
    }

    // Confirm Password
    if (!values.confirmPassword) {
      errors.confirmPassword = "Required";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Passwords must match";
    }

    return errors;
  };

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    const emailTrimmed = values.email.trim();
    const payload = {
      fullName: values.fullName.trim(),
      email: emailTrimmed,
      password: values.password,
      userType: "student",
    };

    try {
      // Fetch all users, then check for duplicates client-side
      const { data: allUsers } = await primaryAPI.get("/auth");
      const exists = allUsers.some(
        (u) => u.email.toLowerCase() === emailTrimmed.toLowerCase()
      );

      if (exists) {
        toast.error("This email is already registered");
        setSubmitting(false);
        return;
      }

      // Register new student
      await primaryAPI.post("/auth", payload);
      toast.success("Sign-up successful! Redirecting to login…");
      resetForm();
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
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
        <h2 className="text-2xl font-bold text-neutral-100 text-center mb-6">
          Create Student Account
        </h2>

        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-neutral-100 font-medium mb-1"
                >
                  Full Name
                </label>
                <Field
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Your Name"
                  className="w-full px-4 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
                />
                <ErrorMessage
                  name="fullName"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-neutral-100 font-medium mb-1"
                >
                  Email Address (must end with “@tuwaiq.edu.sa”)
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@tuwaiq.edu.sa"
                  className="w-full px-4 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Password */}
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
                  placeholder="********"
                  className="w-full px-4 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-neutral-100 font-medium mb-1"
                >
                  Confirm Password
                </label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter Password"
                  className="w-full px-4 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Actions */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-neutral-100 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>

              <Link
                to="/"
                className="w-full block text-center py-2 bg-neutral-200 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-300 transition"
              >
                Home
              </Link>

              <p className="mt-6 text-center text-neutral-100">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-300 font-medium hover:underline"
                >
                  Log In
                </Link>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
