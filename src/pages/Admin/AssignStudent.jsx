// src/pages/Admin/ManageIdeas.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import AdminNavbar from "./AdminNavbar";
import { toast } from "react-toastify";

export default function ManageIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingIdea, setEditingIdea] = useState(null); // { id, title, description, status, reason }
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    try {
      const res = await axiosInstance.get("/ideas");
      setIdeas(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ideas");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredIdeas = ideas.filter((idea) => {
    return (
      idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Accept or reject
  const updateIdeaStatus = async (id, newStatus, reason = "") => {
    try {
      await axiosInstance.put(`/ideas/${id}`, { status: newStatus, reason });
      toast.success(`Idea ${newStatus}`);
      fetchIdeas();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update idea");
    }
  };

  // Delete an idea
  const deleteIdea = async (id) => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return;
    try {
      await axiosInstance.delete(`/ideas/${id}`);
      toast.success("Idea deleted");
      fetchIdeas();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete idea");
    }
  };

  // Edit idea: open modal and set editingIdea
  const openEditModal = (idea) => {
    setEditingIdea({ ...idea });
    setShowModal(true);
  };

  // Save edited idea
  const saveEditedIdea = async () => {
    try {
      await axiosInstance.put(`/ideas/${editingIdea.id}`, {
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <AdminNavbar />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Manage Project Ideas</h1>

        {/* Search Field */}
        <div>
          <input
            type="text"
            placeholder="Search by title or student..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full md:w-1/3 px-3 py-2 border rounded bg-white"
          />
        </div>

        {/* Ideas Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Student</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reason (if rejected)</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.map((idea) => (
                <tr key={idea.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4">{idea.title}</td>
                  <td className="px-6 py-4">{idea.studentName}</td>
                  <td className="px-6 py-4 capitalize">{idea.status}</td>
                  <td className="px-6 py-4">{idea.reason || "—"}</td>
                  <td className="px-6 py-4 space-x-2">
                    {idea.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateIdeaStatus(idea.id, "accepted")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
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
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => openEditModal(idea)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteIdea(idea.id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {filteredIdeas.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
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
            <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
              <h2 className="text-xl font-bold">Edit Idea</h2>
              <label className="block">
                <span className="text-gray-700">Title:</span>
                <input
                  type="text"
                  value={editingIdea.title}
                  onChange={(e) =>
                    setEditingIdea({
                      ...editingIdea,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded p-2"
                />
              </label>
              <label className="block">
                <span className="text-gray-700">Description:</span>
                <textarea
                  rows="4"
                  value={editingIdea.description}
                  onChange={(e) =>
                    setEditingIdea({
                      ...editingIdea,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded p-2"
                ></textarea>
              </label>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingIdea(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedIdea}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
