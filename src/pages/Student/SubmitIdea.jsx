// src/pages/Student/SubmitIdea.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";

export default function SubmitIdea() {
  const { user } = useAuth();
  const [myIdeas, setMyIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchMyIdeas();
  }, []);

  const fetchMyIdeas = async () => {
    try {
      const res = await axiosInstance.get(`/ideas?studentId=${user.userId}`);
      setMyIdeas(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch your ideas");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newIdea.title || !newIdea.description) {
      toast.error("Both title and description are required");
      return;
    }

    try {
      await axiosInstance.post("/ideas", {
        ...newIdea,
        studentId: user.userId,
        studentName: user.fullName,
        status: "pending",
        reason: "",
      });
      toast.success("Idea submitted (status: pending)");
      setNewIdea({ title: "", description: "" });
      fetchMyIdeas();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit idea");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Submit a New Project Idea</h1>

        {/* Submission Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 space-y-4 max-w-lg"
        >
          <div>
            <label className="block text-gray-700 mb-1">Title:</label>
            <input
              type="text"
              value={newIdea.title}
              onChange={(e) =>
                setNewIdea({ ...newIdea, title: e.target.value })
              }
              className="w-full border rounded px-3 py-2 bg-gray-50"
              placeholder="Enter idea title"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Description:</label>
            <textarea
              rows="4"
              value={newIdea.description}
              onChange={(e) =>
                setNewIdea({ ...newIdea, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2 bg-gray-50"
              placeholder="Describe your project idea..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Idea
          </button>
        </form>

        {/* My Past Ideas */}
        <div>
          <h2 className="text-xl font-medium mb-2">My Project Ideas</h2>
          {myIdeas.length === 0 ? (
            <p className="text-gray-600">
              You have not submitted any ideas yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Reason (if rejected)</th>
                  </tr>
                </thead>
                <tbody>
                  {myIdeas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4">{idea.title}</td>
                      <td className="px-6 py-4 capitalize">{idea.status}</td>
                      <td className="px-6 py-4">{idea.reason || "—"}</td>
                    </tr>
                  ))}
                  {myIdeas.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-4 text-gray-500"
                      >
                        No ideas to display.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
