// src/pages/Admin/ManageTeachers.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI } from "../../api/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [editingTeacher, setEditingTeacher] = useState(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      const res = await primaryAPI.get("/auth");
      const teachersOnly = res.data.filter((u) => u.userType === "teacher");
      setTeachers(teachersOnly);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  }

  // show a toast with confirm/cancel buttons
  const showDeleteConfirm = (id) => {
    toast.info(
      ({ closeToast }) => (
        <div className="space-y-2">
          <p>Are you sure you want to delete this teacher?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                confirmDelete(id, closeToast);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Yes
            </button>
            <button
              onClick={() => closeToast()}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
      }
    );
  };

  // actually delete once confirmed
  async function confirmDelete(id, closeToast) {
    try {
      await primaryAPI.delete(`/auth/${id}`);
      toast.success("Teacher deleted");
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete teacher");
    } finally {
      closeToast();
    }
  }

  async function handleAddTeacher(e) {
    e.preventDefault();
    const { fullName, email, password } = newTeacher;
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      setAdding(true);
      await primaryAPI.post("/auth", {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
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
  }

  function startEdit(t) {
    setEditingTeacher({
      id: t.id,
      fullName: t.fullName,
      email: t.email,
      password: "",
    });
  }

  async function saveEdit() {
    const { id, fullName, email, password } = editingTeacher;
    if (!fullName.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    try {
      await primaryAPI.put(`/auth/${id}`, {
        fullName: fullName.trim(),
        email: email.trim(),
        ...(password.trim() && { password: password.trim() }),
        userType: "teacher",
      });
      toast.success("Teacher updated");
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update teacher");
    }
  }

  const filtered = teachers.filter((t) =>
    t.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-center" />
      <div className="max-w-5xl mx-auto space-y-8 mt-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Teachers</h1>

        {user.userType === "admin" && (
          <form
            onSubmit={handleAddTeacher}
            className="bg-indigo-800 text-neutral-100 p-4 sm:p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="text-lg sm:text-xl font-medium">Add New Teacher</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newTeacher.fullName}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, fullName: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
              />
              <input
                type="email"
                placeholder="Email"
                value={newTeacher.email}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
              />
              <input
                type="password"
                placeholder="Password"
                value={newTeacher.password}
                onChange={(e) =>
                  setNewTeacher({ ...newTeacher, password: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full sm:w-auto px-6 py-2 bg-neutral-100 text-indigo-800 font-semibold rounded hover:bg-neutral-200 disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add Teacher"}
            </button>
          </form>
        )}

        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 md:w-1/3 px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
        />

        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full bg-neutral-100 rounded-lg shadow overflow-hidden table-auto">
            <thead className="bg-indigo-800 text-neutral-100">
              <tr>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-4 text-center">
                    No teachers found.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-200">
                    <td className="px-4 py-2">{t.fullName}</td>
                    <td className="px-4 py-2">{t.email}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => startEdit(t)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => showDeleteConfirm(t.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center">No teachers found.</p>
          ) : (
            filtered.map((t) => (
              <div
                key={t.id}
                className="bg-neutral-100 p-4 rounded-lg shadow space-y-2"
              >
                <p className="font-semibold">{t.fullName}</p>
                <p className="text-sm">{t.email}</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => startEdit(t)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => showDeleteConfirm(t.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-neutral-100 text-indigo-800 rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Edit Teacher</h2>
            <input
              type="text"
              value={editingTeacher.fullName}
              onChange={(e) =>
                setEditingTeacher({
                  ...editingTeacher,
                  fullName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <input
              type="email"
              value={editingTeacher.email}
              onChange={(e) =>
                setEditingTeacher({ ...editingTeacher, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <input
              type="password"
              placeholder="New Password (optional)"
              value={editingTeacher.password}
              onChange={(e) =>
                setEditingTeacher({
                  ...editingTeacher,
                  password: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-indigo-800 text-neutral-100 rounded hover:bg-indigo-900"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
