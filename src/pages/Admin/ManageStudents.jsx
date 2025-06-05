// src/pages/Admin/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import AdminNavbar from "./AdminNavbar";
import { toast } from "react-toastify";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axiosInstance.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await axiosInstance.delete(`/students/${studentId}`);
      toast.success("Student deleted");
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (
      !newStudent.fullName ||
      !newStudent.email ||
      !newStudent.password ||
      !newStudent.email.includes("Tuwaiq")
    ) {
      toast.error("All fields are required, and email must contain 'Tuwaiq'");
      return;
    }

    try {
      // Backend should accept userType="student"
      await axiosInstance.post("/students", {
        ...newStudent,
        userType: "student",
      });
      toast.success("New student added");
      setNewStudent({ fullName: "", email: "", password: "" });
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add student");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <AdminNavbar />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Manage Students</h1>

        {/* Add Student Form */}
        <form
          onSubmit={handleAddStudent}
          className="bg-white rounded-lg shadow p-6 space-y-4"
        >
          <h2 className="text-lg font-medium">Add New Student</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newStudent.fullName}
              onChange={(e) =>
                setNewStudent({ ...newStudent, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border rounded bg-gray-50"
            />
            <input
              type="email"
              placeholder="Email (must contain 'Tuwaiq')"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({ ...newStudent, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded bg-gray-50"
            />
            <input
              type="password"
              placeholder="Password"
              value={newStudent.password}
              onChange={(e) =>
                setNewStudent({ ...newStudent, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded bg-gray-50"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Student
          </button>
        </form>

        {/* Search Field */}
        <div>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full md:w-1/3 px-3 py-2 border rounded bg-white"
          />
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Assigned Teacher</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((stu) => (
                <tr key={stu.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4">{stu.fullName}</td>
                  <td className="px-6 py-4">{stu.email}</td>
                  <td className="px-6 py-4">
                    {stu.assignedTeacherName || "—"}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleDelete(stu.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                    {/* If you want an “Edit” button, implement edit logic similarly */}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
