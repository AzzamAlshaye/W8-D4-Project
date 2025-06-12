// src/pages/Admin/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const res = await primaryAPI.get("/auth", {
        params: { userType: "student" },
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    }
  }

  async function deleteStudent(id) {
    try {
      await primaryAPI.delete(`/auth/${id}`);
      toast.success("Student deleted");
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student");
    }
  }

  function confirmDelete(id, name) {
    const toastId = toast.info(
      <div className="space-y-2">
        <p className="text-sm">
          Delete <strong>{name}</strong>?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              deleteStudent(id);
              toast.dismiss(toastId);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 text-sm"
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  }

  async function handleAddStudent(e) {
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
      toast.success("New student added");
      setNewStudent({ fullName: "", email: "", password: "" });
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add student");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(s) {
    setEditingStudent({
      id: s.id,
      fullName: s.fullName,
      email: s.email,
      password: "",
    });
  }

  async function saveEdit() {
    const { id, fullName, email, password } = editingStudent;
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
      setEditingStudent(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update student");
    }
  }

  const filtered = students.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-center" />

      <Navbar />

      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Students</h1>

        {user.userType === "admin" && (
          <form
            onSubmit={handleAddStudent}
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
          className="w-full sm:w-1/2 lg:w-1/3 px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
        />

        <div className="overflow-x-auto">
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
                  <td colSpan="3" className="py-4 text-center text-indigo-800">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-200">
                    <td className="px-4 py-2">{s.fullName}</td>
                    <td className="px-4 py-2">{s.email}</td>
                    <td className="px-4 py-2 text-center space-x-1">
                      {user.userType === "admin" && (
                        <>
                          <button
                            onClick={() => startEdit(s)}
                            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(s.id, s.fullName)}
                            className="px-2 py-1 bg-indigo-800 text-neutral-100 rounded hover:bg-indigo-900 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-neutral-100 text-indigo-800 rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Edit Student</h2>
            <input
              type="text"
              value={editingStudent.fullName}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  fullName: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <input
              type="email"
              value={editingStudent.email}
              onChange={(e) =>
                setEditingStudent({ ...editingStudent, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <input
              type="password"
              placeholder="New Password (optional)"
              value={editingStudent.password}
              onChange={(e) =>
                setEditingStudent({
                  ...editingStudent,
                  password: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-800"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingStudent(null)}
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
