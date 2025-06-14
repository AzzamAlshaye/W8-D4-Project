// src/pages/Admin/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI, secondaryAPI } from "../../api/axiosConfig"; // make sure secondaryAPI is imported
import { useTitle } from "../../hooks/useTitle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManageStudents() {
  const { user } = useAuth();
  useTitle("Admin | Manage Students");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const res = await primaryAPI.get("/auth", {
        params: { userType: "student" },
      });
      setStudents(res.data);
    } catch {
      toast.error("Failed to fetch students");
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const { fullName, email, password } = newStudent;
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !email.endsWith("@tuwaiq.edu.sa")
    ) {
      toast.error("All fields required & email must end with @tuwaiq.edu.sa");
      return;
    }
    try {
      setAdding(true);
      await primaryAPI.post("/auth", {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        userType: "student",
      });
      toast.success("Student added");
      setNewStudent({ fullName: "", email: "", password: "" });
      fetchStudents();
    } catch {
      toast.error("Failed to add student");
    } finally {
      setAdding(false);
    }
  }

  // delete student + all their assignments and ideas
  async function handleDelete(id) {
    try {
      // 1) delete assignments
      const { data: assigns } = await secondaryAPI.get("/assignments");
      const studentAssigns = assigns.filter(
        (a) => String(a.studentId) === String(id)
      );
      await Promise.all(
        studentAssigns.map((a) => secondaryAPI.delete(`/assignments/${a.id}`))
      );

      // 2) delete ideas
      const { data: ideas } = await secondaryAPI.get("/ideas");
      const studentIdeas = ideas.filter(
        (i) => String(i.studentId) === String(id)
      );
      await Promise.all(
        studentIdeas.map((i) => secondaryAPI.delete(`/ideas/${i.id}`))
      );

      // 3) delete student
      await primaryAPI.delete(`/auth/${id}`);

      toast.success("Student and all related data deleted");
      fetchStudents();
    } catch {
      toast.error("Failed to delete student");
    }
  }

  function confirmDelete(id, name) {
    const idToast = toast.info(
      <div className="space-y-2 text-sm">
        <p>
          Delete <strong>{name}</strong> and all their ideas & assignments?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              handleDelete(id);
              toast.dismiss(idToast);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(idToast)}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  }

  function startEdit(s) {
    setEditing({
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      password: "",
    });
  }

  async function saveEdit() {
    const { id, fullName, email, password } = editing;
    if (
      !fullName.trim() ||
      !email.trim() ||
      !email.endsWith("@tuwaiq.edu.sa")
    ) {
      toast.error("Name & valid email required (ends with @tuwaiq.edu.sa)");
      return;
    }
    try {
      await primaryAPI.put(`/auth/${id}`, {
        fullName: fullName.trim(),
        email: email.trim(),
        ...(password.trim() && { password: password.trim() }),
        userType: "student",
      });
      toast.success("Student updated");
      setEditing(null);
      fetchStudents();
    } catch {
      toast.error("Failed to update student");
    }
  }

  const filtered = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-center" />

      <div className="max-w-5xl mx-auto space-y-8 mt-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Students</h1>

        {user.userType === "admin" && (
          <form
            onSubmit={handleAdd}
            className="bg-indigo-800 text-neutral-100 p-4 sm:p-6 rounded-2xl shadow space-y-4"
          >
            <h2 className="text-lg sm:text-xl font-medium">Add New Student</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newStudent.fullName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, fullName: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
              />
              <input
                type="email"
                placeholder="Email (@tuwaiq.edu.sa)"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
              />
              <input
                type="password"
                placeholder="Password"
                value={newStudent.password}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, password: e.target.value })
                }
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full sm:w-auto px-6 py-2 bg-neutral-100 text-indigo-800 font-semibold rounded hover:bg-neutral-200 disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add Student"}
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

        {/* Desktop */}
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
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-200">
                    <td className="px-4 py-2">{s.fullName}</td>
                    <td className="px-4 py-2">{s.email}</td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => startEdit(s)}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(s.id, s.fullName)}
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

        {/* Mobile */}
        <div className="md:hidden space-y-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-neutral-100 p-4 rounded-lg shadow space-y-2"
            >
              <p className="font-semibold">{s.fullName}</p>
              <p className="text-sm">{s.email}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => startEdit(s)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(s.id, s.fullName)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-neutral-100 text-indigo-800 rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Edit Student</h2>
            <input
              type="text"
              value={editing.fullName}
              onChange={(e) =>
                setEditing({ ...editing, fullName: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <input
              type="email"
              value={editing.email}
              onChange={(e) =>
                setEditing({ ...editing, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <input
              type="password"
              placeholder="New Password (optional)"
              value={editing.password}
              onChange={(e) =>
                setEditing({ ...editing, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-indigo-800 text-white rounded hover:bg-indigo-900"
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
