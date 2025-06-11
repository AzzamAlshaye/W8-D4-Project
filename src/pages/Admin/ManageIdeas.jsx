// src/pages/Admin/ManageIdeas.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import AdminNavbar from "./AdminNavbar";
import { toast } from "react-toastify";

export default function ManageIdeas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIdea, setEditingIdea] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await secondaryAPI.get("/ideas");
      setIdeas(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ideas");
    }
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredIdeas = ideas.filter(
    (idea) =>
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateIdeaStatus = async (id, newStatus, reason = "") => {
    try {
      await secondaryAPI.put(`/ideas/${id}`, { status: newStatus, reason });
      toast.success(`Idea ${newStatus}`);
      fetchIdeas();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update idea");
    }
  };

  const deleteIdea = async (id) => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return;
    try {
      await secondaryAPI.delete(`/ideas/${id}`);
      toast.success("Idea deleted");
      fetchIdeas();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete idea");
    }
  };

  const openEditModal = (idea) => {
    setEditingIdea({ ...idea });
    setShowModal(true);
  };

  const saveEditedIdea = async () => {
    try {
      await secondaryAPI.put(`/ideas/${editingIdea.id}`, {
        title: editingIdea.title,
        description: editingIdea.description,
      });
      toast.success("Idea updated");
      setShowModal(false);
      setEditingIdea(null);
      fetchIdeas();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update idea");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <Navbar />
      <AdminNavbar />

      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Manage Project Ideas</h1>

        <input
          type="text"
          placeholder="Search by title or student..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/3 px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full bg-neutral-100 rounded-lg overflow-hidden shadow">
            <thead className="bg-indigo-800 text-neutral-100">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.map((idea) => (
                <tr key={idea.id} className="hover:bg-neutral-200">
                  <td className="px-6 py-4">{idea.title}</td>
                  <td className="px-6 py-4">{idea.studentName}</td>
                  <td className="px-6 py-4 capitalize">{idea.status}</td>
                  <td className="px-6 py-4">{idea.reason || "—"}</td>
                  <td className="px-6 py-4 space-x-2">
                    {idea.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateIdeaStatus(idea.id, "accepted")}
                          className="bg-indigo-800 text-neutral-100 px-3 py-1 rounded hover:bg-indigo-900"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Reason for rejection:");
                            if (reason !== null) {
                              updateIdeaStatus(idea.id, "rejected", reason);
                            }
                          }}
                          className="bg-red-600 text-neutral-100 px-3 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openEditModal(idea)}
                      className="bg-yellow-500 text-neutral-100 px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="bg-indigo-800 text-neutral-100 px-3 py-1 rounded hover:bg-indigo-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredIdeas.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-indigo-800">
                    No ideas found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {showModal && editingIdea && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-neutral-100 text-indigo-800 rounded-lg w-full max-w-lg p-6 space-y-4">
              <h2 className="text-xl font-bold">Edit Idea</h2>
              <label className="block">
                <span className="font-medium">Title:</span>
                <input
                  type="text"
                  value={editingIdea.title}
                  onChange={(e) =>
                    setEditingIdea({ ...editingIdea, title: e.target.value })
                  }
                  className="mt-1 block w-full border border-indigo-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-800"
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
                  className="mt-1 block w-full border border-indigo-800 rounded-lg p-2 focus:ring-2 focus:ring-indigo-800"
                />
              </label>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false) && setEditingIdea(null)}
                  className="px-4 py-2 bg-indigo-800 text-neutral-100 rounded-lg hover:bg-indigo-900"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedIdea}
                  className="px-4 py-2 bg-indigo-800 text-neutral-100 rounded-lg hover:bg-indigo-900"
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
