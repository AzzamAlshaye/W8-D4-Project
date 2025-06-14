import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI } from "../../api/axiosConfig";
import { useTitle } from "../../hooks/useTitle";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ReviewIdeas() {
  const { user } = useAuth();
  useTitle("Teacher | Review Ideas");
  const [ideas, setIdeas] = useState([]);
  const [editingIdea, setEditingIdea] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, [user.id]);

  const fetchIdeas = async () => {
    if (!user?.id) return setIdeas([]);
    try {
      // 1) Get assignments
      const assignRes = await secondaryAPI.get("/assignments", {
        params: { teacherId: user.id },
      });
      const studentIds = assignRes.data.map((a) => a.studentId);
      if (!studentIds.length) return setIdeas([]);

      // 2) Fetch ideas for each student
      const ideaPromises = studentIds.map((id) =>
        secondaryAPI.get("/ideas", { params: { studentId: id } })
      );
      const ideaResults = await Promise.all(ideaPromises);
      const allIdeas = ideaResults.flatMap((res) => res.data);
      setIdeas(allIdeas);
    } catch (err) {
      console.error("Failed to fetch ideas:", err);
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
        fetchIdeas();
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
      fetchIdeas();
    } catch {
      toast.error("Failed to update idea");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <ToastContainer position="top-center" />
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Review Project Ideas</h1>
        {/* Table view */}
        <div className="overflow-x-auto hidden md:block">
          {ideas.length === 0 ? (
            <p className="py-4 text-center">No ideas found.</p>
          ) : (
            <table className="w-full bg-neutral-100 rounded-lg shadow table-auto">
              <thead className="bg-indigo-800 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Status</th>
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
                    <td className="px-4 py-2 text-center space-x-1">
                      {idea.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(idea.id, "accepted")}
                            className="px-2 py-1 bg-green-600 text-white rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(idea.id, "rejected")}
                            className="px-2 py-1 bg-red-600 text-white rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEdit(idea)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(idea.id)}
                        className="px-2 py-1 bg-gray-500 text-white rounded"
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
        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="bg-neutral-100 p-4 rounded-lg shadow">
              <h2 className="font-semibold text-indigo-800">{idea.title}</h2>
              <p className="text-sm">By: {idea.studentName}</p>
              <p className="text-sm">
                <strong>Status:</strong> {idea.status}
              </p>
              <div className="mt-2 flex space-x-2">
                {idea.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(idea.id, "accepted")}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(idea.id, "rejected")}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => openEdit(idea)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmDelete(idea.id)}
                  className="px-3 py-1 bg-gray-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Edit Modal */}
        {editingIdea && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold">Edit Idea</h2>
              <input
                type="text"
                value={editingIdea.title}
                onChange={(e) =>
                  setEditingIdea({ ...editingIdea, title: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              <textarea
                rows={4}
                value={editingIdea.description}
                onChange={(e) =>
                  setEditingIdea({
                    ...editingIdea,
                    description: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingIdea(null)}
                  className="px-4 py-2 bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedIdea}
                  className="px-4 py-2 bg-indigo-800 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
