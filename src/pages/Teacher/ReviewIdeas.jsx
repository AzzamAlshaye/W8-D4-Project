// src/pages/Teacher/ReviewIdeas.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI } from "../../api/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ReviewIdeas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [editingIdea, setEditingIdea] = useState(null);

  useEffect(() => {
    fetchStudentsAndIdeas();
  }, [user.id]);

  const fetchStudentsAndIdeas = async () => {
    if (!user?.id) return setIdeas([]);
    try {
      const assignmentsRes = await secondaryAPI.get(
        `/assignments?teacherId=${user.id}`
      );
      const studentIds = assignmentsRes.data.map((a) => a.studentId);
      if (!studentIds.length) return setIdeas([]);
      const query = studentIds.map((id) => `studentId=${id}`).join("&");
      const ideasRes = await secondaryAPI.get(`/ideas?${query}`);
      setIdeas(ideasRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ideas");
    }
  };

  const confirmDelete = (id) => {
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
                fetchStudentsAndIdeas();
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
  };

  const updateStatus = async (ideaId, status) => {
    if (status === "rejected") {
      const toastId = toast.info(
        <div className="space-y-2 text-sm">
          <p>Reason for rejection:</p>
          <textarea
            id={`reason-${ideaId}`}
            rows={3}
            className="w-full border rounded p-1 focus:ring-2 focus:ring-indigo-800"
            onKeyDown={(e) => e.stopPropagation()}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={async () => {
                const reason = document.getElementById(
                  `reason-${ideaId}`
                ).value;
                try {
                  await secondaryAPI.put(`/ideas/${ideaId}`, {
                    status,
                    reason,
                  });
                  toast.dismiss(toastId);
                  toast.success("Idea rejected");
                  fetchStudentsAndIdeas();
                } catch {
                  toast.error("Failed to reject idea");
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Submit
            </button>
            <button
              onClick={() => toast.dismiss(toastId)}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false, closeButton: false }
      );
    } else {
      try {
        await secondaryAPI.put(`/ideas/${ideaId}`, { status, reason: "" });
        toast.success("Idea accepted");
        fetchStudentsAndIdeas();
      } catch {
        toast.error("Failed to accept idea");
      }
    }
  };

  const openEdit = (idea) => setEditingIdea({ ...idea });

  const saveEditedIdea = async () => {
    try {
      await secondaryAPI.put(`/ideas/${editingIdea.id}`, {
        title: editingIdea.title,
        description: editingIdea.description,
      });
      toast.success("Idea updated");
      setEditingIdea(null);
      fetchStudentsAndIdeas();
    } catch {
      toast.error("Failed to update idea");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-4 sm:p-6 lg:p-8">
      <ToastContainer position="top-center" />

      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Review Project Ideas</h1>

        {/* Desktop Table with Description */}
        <div className="hidden md:block overflow-x-auto">
          {ideas.length === 0 ? (
            <p className="py-4 text-center">No ideas from your students.</p>
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
                {ideas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-neutral-200">
                    <td className="px-4 py-2">{idea.title}</td>
                    <td className="px-4 py-2">{idea.studentName}</td>
                    <td className="px-4 py-2">
                      {idea.description.length > 50
                        ? idea.description.slice(0, 50) + "..."
                        : idea.description}
                    </td>
                    <td className="px-4 py-2 capitalize">{idea.status}</td>
                    <td className="px-4 py-2">{idea.reason || "—"}</td>
                    <td className="px-4 py-2 text-center space-x-1">
                      {idea.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(idea.id, "accepted")}
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(idea.id, "rejected")}
                            className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEdit(idea)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(idea.id)}
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
          {ideas.length === 0 ? (
            <p className="text-center">No ideas from your students.</p>
          ) : (
            ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-neutral-100 p-4 rounded-lg shadow space-y-2"
              >
                <p className="font-semibold text-indigo-800">{idea.title}</p>
                <p className="text-sm text-indigo-800">
                  By: {idea.studentName}
                </p>
                <p className="text-sm text-indigo-800">
                  <strong>Description:</strong>{" "}
                  {idea.description.length > 100
                    ? idea.description.slice(0, 100) + "..."
                    : idea.description}
                </p>
                <p className="text-sm text-indigo-800">
                  <strong>Status:</strong> {idea.status}
                </p>
                {idea.reason && (
                  <p className="text-sm text-indigo-800">
                    <strong>Reason:</strong> {idea.reason}
                  </p>
                )}
                <div className="flex justify-between flex-wrap gap-2">
                  <div className="flex space-x-2">
                    {idea.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(idea.id, "accepted")}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateStatus(idea.id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEdit(idea)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(idea.id)}
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
                rows={4}
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
