// src/pages/Admin/ManageTeachers.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import AdminNavbar from "./AdminNavbar";
import { toast } from "react-toastify";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTeacher, setNewTeacher] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axiosInstance.get("/teachers");
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTeachers = teachers.filter((t) =>
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (teacherId) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      await axiosInstance.delete(`/teachers/${teacherId}`);
      toast.success("Teacher deleted");
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete teacher");
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.fullName || !newTeacher.email || !newTeacher.password) {
      toast.error("All fields are required");
      return;
    }

    try {
      await axiosInstance.post("/teachers", {
        ...newTeacher,
        userType: "teacher",
      });
      toast.success("New teacher added");
      setNewTeacher({ fullName: "", email: "", password: "" });
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add teacher");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <AdminNavbar />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Manage Teachers</h1>

        {/* Add Teacher Form */}
        <form
          onSubmit={handleAddTeacher}
          className="bg-white rounded-lg shadow p-6 space-y-4"
        >
          <h2 className="text-lg font-medium">Add New Teacher</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newTeacher.fullName}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border rounded bg-gray-50"
            />
            <input
              type="email"
              placeholder="Email"
              value={newTeacher.email}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded bg-gray-50"
            />
            <input
              type="password"
              placeholder="Password"
              value={newTeacher.password}
              onChange={(e) =>
                setNewTeacher({ ...newTeacher, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded bg-gray-50"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Teacher
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

        {/* Teachers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3">Full Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4">{t.fullName}</td>
                  <td className="px-6 py-4">{t.email}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">
                    No teachers found.
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
