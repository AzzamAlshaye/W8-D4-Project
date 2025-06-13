// src/pages/Admin/ManageIdeas.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI } from "../../api/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManageIdeas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIdea, setEditingIdea] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function fetchIdeas() {
    try {
      const res = await secondaryAPI.get("/ideas");
      setIdeas(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ideas");
    }
  }

  function confirmDelete(id) {
    const tid = toast.info(
      <div className="space-y-2 text-sm">
        <p>Delete this idea?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={async () => {
              try {
                await secondaryAPI.delete(`/ideas/${id}`);
                toast.dismiss(tid);
                toast.success("Idea deleted");
                fetchIdeas();
              } catch {
                toast.error("Failed to delete idea");
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(tid)}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  }

  function handleAccept(id) {
    secondaryAPI
      .put(`/ideas/${id}`, { status: "accepted", reason: "" })
      .then(() => {
        toast.success("Idea accepted");
        fetchIdeas();
      })
      .catch(() => toast.error("Failed to accept idea"));
  }

  function handleReject(id) {
    const tid = toast.info(
      <div className="space-y-2 text-sm">
        <p>Reason for rejection:</p>
        <textarea
          id={`reason-${id}`}
          rows="3"
          onKeyDown={(e) => e.stopPropagation()}
          className="w-full border rounded p-1 focus:ring-2 focus:ring-indigo-800"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={async () => {
              const reason = document.getElementById(`reason-${id}`).value;
              try {
                await secondaryAPI.put(`/ideas/${id}`, {
                  status: "rejected",
                  reason,
                });
                toast.dismiss(tid);
                toast.success("Idea rejected");
                fetchIdeas();
              } catch {
                toast.error("Failed to reject idea");
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Submit
          </button>
          <button
            onClick={() => toast.dismiss(tid)}
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, closeButton: false }
    );
  }

  function openEdit(idea) {
    setEditingIdea({ ...idea });
  }

  async function saveEditedIdea() {
    try {
      await secondaryAPI.put(`/ideas/${editingIdea.id}`, {
        title: editingIdea.title,
        description: editingIdea.description,
      });
      toast.success("Idea updated");
      setEditingIdea(null);
      fetchIdeas();
    } catch {
      toast.error("Failed to update idea");
    }
  }

  const filtered = ideas.filter(
    (i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800  p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-center" />

      <div className="max-w-5xl mx-auto space-y-6 mt-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Project Ideas</h1>

        <input
          type="text"
          placeholder="Search by title or student..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded focus:ring-2 focus:ring-indigo-800"
        />

        {/* Desktop Table with Description */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <p className="py-4 text-center">No ideas found.</p>
          ) : (
            <table className="w-full bg-neutral-100 rounded-lg shadow overflow-hidden table-auto">
              <thead className="bg-indigo-800 text-neutral-100">
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-neutral-200">
                    <td className="px-4 py-2">{i.title}</td>
                    <td className="px-4 py-2">{i.studentName}</td>
                    <td className="px-4 py-2">
                      {i.description.length > 50
                        ? i.description.slice(0, 50) + "..."
                        : i.description}
                    </td>
                    <td className="px-4 py-2 capitalize">{i.status}</td>
                    <td className="px-4 py-2">{i.reason || "—"}</td>
                    <td className="px-4 py-2 text-center space-x-1">
                      {i.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAccept(i.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(i.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEdit(i)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(i.id)}
                        className="px-2 py-1 bg-indigo-800 text-neutral-100 rounded hover:bg-indigo-900 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Cards including short Description */}
        <div className="md:hidden space-y-4">
          {filtered.length === 0 ? (
            <p className="text-center">No ideas found.</p>
          ) : (
            filtered.map((i) => (
              <div
                key={i.id}
                className="bg-neutral-100 p-4 rounded-lg shadow space-y-2"
              >
                <p className="font-semibold text-indigo-800">{i.title}</p>
                <p className="text-sm text-indigo-800">By: {i.studentName}</p>
                <p className="text-sm text-indigo-800">
                  <strong>Description:</strong>{" "}
                  {i.description.length > 100
                    ? i.description.slice(0, 100) + "..."
                    : i.description}
                </p>
                <p className="text-sm text-indigo-800">
                  <strong>Status:</strong> {i.status}
                </p>
                {i.reason && (
                  <p className="text-sm text-indigo-800">
                    <strong>Reason:</strong> {i.reason}
                  </p>
                )}
                <div className="flex justify-between flex-wrap gap-2">
                  <div className="flex space-x-2">
                    {i.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(i.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(i.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEdit(i)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(i.id)}
                      className="px-3 py-1 bg-indigo-800 text-neutral-100 rounded hover:bg-indigo-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingIdea && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-neutral-100 text-indigo-800 rounded-lg p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold">Edit Idea</h2>
            <label className="block">
              <span className="font-medium">Title:</span>
              <input
                type="text"
                value={editingIdea.title}
                onChange={(e) =>
                  setEditingIdea({ ...editingIdea, title: e.target.value })
                }
                className="mt-1 block w-full border rounded p-2 focus:ring-2 focus:ring-indigo-800"
              />
            </label>
            <label className="block">
              <span className="font-medium">Description:</span>
              <textarea
                rows="4"
                value={editingIdea.description}
                onChange={(e) =>
                  setEditingIdea({
                    ...editingIdea,
                    description: e.target.value,
                  })
                }
                className="mt-1 block w-full border rounded p-2 focus:ring-2 focus:ring-indigo-800"
              />
            </label>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingIdea(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedIdea}
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
