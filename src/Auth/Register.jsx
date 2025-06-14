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

    if (!values.fullName) {
      errors.fullName = "Required";
    } else if (values.fullName.length < 3) {
      errors.fullName = "Must be at least 3 characters";
    } else if (values.fullName.length > 50) {
      errors.fullName = "Can't exceed 50 characters";
    }

    if (!values.email) {
      errors.email = "Required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    } else if (!values.email.endsWith("@tuwaiq.edu.sa")) {
      errors.email = 'Email must end with "@tuwaiq.edu.sa".';
    }

    if (!values.password) {
      errors.password = "Required";
    } else if (values.password.length < 8) {
      errors.password = "Must be at least 8 characters";
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = "Required";
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = "Passwords must match";
    }

    return errors;
  };

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    const payload = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      userType: "student", // always register as student
    };

    try {
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
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-100">
            Create Student Account
          </h2>
        </div>

        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={onSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
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
                  className="w-full px-4 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  placeholder="Your Name"
                />
                <ErrorMessage
                  name="fullName"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

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
                  className="w-full px-4 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  placeholder="Re-enter Password"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-neutral-100 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>

              <Link
                to="/"
                className="w-full block text-center  py-2 bg-neutral-200 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-300 transition"
              >
                Home
              </Link>

              <p className="mt-6 text-center text-neutral-100">
                Already have an account?{" "}
                <a
                  href="/login"
                  className="text-indigo-300 font-medium hover:underline"
                >
                  Log In
                </a>
              </p>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
