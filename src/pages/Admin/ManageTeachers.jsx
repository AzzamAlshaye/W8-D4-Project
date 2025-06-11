// src/pages/Admin/ManageTeachers.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import AdminNavbar from "./AdminNavbar";
import { toast } from "react-toastify";

export default function ManageTeachers() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTeacher, setNewTeacher] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      // Fetch all users, then keep only those with userType "teacher"
      const res = await primaryAPI.get("/auth");
      const allUsers = res.data;
      const teachersOnly = allUsers.filter((u) => u.userType === "teacher");
      setTeachers(teachersOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredTeachers = teachers.filter((t) =>
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;
    try {
      await primaryAPI.delete(`/auth/${id}`);
      toast.success("Teacher deleted");
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete teacher");
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    const { fullName, email, password } = newTeacher;
    if (!fullName || !email || !password) {
      toast.error("All fields are required");
      return;
    }
    try {
      setAdding(true);
      await primaryAPI.post("/auth", {
        fullName,
        email,
        password,
        userType: "teacher",
      });
      toast.success("New teacher added");
      setNewTeacher({ fullName: "", email: "", password: "" });
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add teacher");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <Navbar />
      <AdminNavbar />

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Manage Teachers</h1>

        {user.userType === "admin" && (
          <form
            onSubmit={handleAddTeacher}
            className="bg-indigo-800 text-neutral-100 p-6 rounded-2xl shadow space-y-4"
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
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
              />
              <input
                type="email"
                placeholder="Email"
                value={newTeacher.email}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
              />
              <input
                type="password"
                placeholder="Password"
                value={newTeacher.password}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, password: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-2 bg-neutral-100 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Teacher"}
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
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-200">
                  <td className="px-6 py-4">{t.fullName}</td>
                  <td className="px-6 py-4">{t.email}</td>
                  <td className="px-6 py-4">
                    {user.userType === "admin" && (
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-indigo-800 text-neutral-100 px-3 py-1 rounded hover:bg-indigo-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-indigo-800">
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
