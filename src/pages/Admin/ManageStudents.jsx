// src/pages/Admin/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";

import { toast } from "react-toastify";

export default function ManageStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // GET all users, then filter to only students
      const res = await primaryAPI.get("/auth");
      const allUsers = res.data;
      const studentsOnly = allUsers.filter((u) => u.userType === "student");
      setStudents(studentsOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredStudents = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await primaryAPI.delete(`/auth/${id}`);
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
      !newStudent.email.endsWith("@tuwaiq.edu.sa")
    ) {
      toast.error(
        "All fields required and email must end with '@tuwaiq.edu.sa'"
      );
      return;
    }
    try {
      setAdding(true);
      // POST to /auth, marking this new user as a student
      await primaryAPI.post("/auth", {
        fullName: newStudent.fullName,
        email: newStudent.email,
        password: newStudent.password,
        userType: "student",
      });
      toast.success("New student added");
      setNewStudent({ fullName: "", email: "", password: "" });
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add student");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Manage Students</h1>

        {user.userType === "admin" && (
          <form
            onSubmit={handleAddStudent}
            className="bg-indigo-800 text-neutral-100 p-6 rounded-2xl shadow space-y-4"
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
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
              />
              <input
                type="email"
                placeholder="Email (@tuwaiq.edu.sa)"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
              />
              <input
                type="password"
                placeholder="Password"
                value={newStudent.password}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, password: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2 bg-neutral-100 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Student"}
            </button>
          </form>
        )}

        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/3 px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full bg-neutral-100 rounded-lg overflow-hidden shadow">
            <thead className="bg-indigo-800 text-neutral-100">
              <tr>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-200">
                  <td className="px-6 py-4">{s.fullName}</td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4">
                    {user.userType === "admin" && (
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-indigo-800 text-neutral-100 px-3 py-1 rounded hover:bg-indigo-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-indigo-800">
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
