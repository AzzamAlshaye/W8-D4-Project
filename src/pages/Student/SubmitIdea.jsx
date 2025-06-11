// src/pages/Student/SubmitIdea.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI } from "../../api/axiosConfig";
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
      const res = await primaryAPI.get(`/ideas?studentId=${user.userId}`);
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
      await primaryAPI.post("/ideas", {
        title: newIdea.title,
        description: newIdea.description,
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
    <div className="min-h-screen bg-indigo-800 text-neutral-100 p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Submit a New Project Idea</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-neutral-100 text-indigo-800 rounded-2xl shadow p-6 space-y-4"
        >
          <div>
            <label className="block font-medium mb-1">Title:</label>
            <input
              type="text"
              value={newIdea.title}
              onChange={(e) =>
                setNewIdea({ ...newIdea, title: e.target.value })
              }
              className="w-full border border-indigo-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-800"
              placeholder="Enter idea title"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description:</label>
            <textarea
              rows="4"
              value={newIdea.description}
              onChange={(e) =>
                setNewIdea({ ...newIdea, description: e.target.value })
              }
              className="w-full border border-indigo-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-800"
              placeholder="Describe your project idea..."
            />
          </div>
          <button
            type="submit"
            className="bg-neutral-100 text-indigo-800 font-semibold rounded-lg px-6 py-2 hover:bg-neutral-200 transition"
          >
            Submit Idea
          </button>
        </form>

        <div>
          <h2 className="text-xl font-medium mb-2 text-neutral-100">
            My Project Ideas
          </h2>
          {myIdeas.length === 0 ? (
            <p className="text-neutral-300">
              You have not submitted any ideas yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-neutral-100 rounded-lg overflow-hidden shadow">
                <thead className="bg-indigo-800 text-neutral-100">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {myIdeas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-neutral-200">
                      <td className="px-6 py-4">{idea.title}</td>
                      <td className="px-6 py-4 capitalize">{idea.status}</td>
                      <td className="px-6 py-4">{idea.reason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
