// src/pages/Student/SubmitIdea.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI } from "../../api/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SubmitIdea() {
  const { user } = useAuth(); // user has { id, fullName, ... }
  const [myIdeas, setMyIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchMyIdeas();
  }, [user.fullName]);

  const fetchMyIdeas = async () => {
    try {
      const res = await secondaryAPI.get("/ideas");
      const filtered = res.data.filter(
        (idea) => idea.studentName === user.fullName
      );
      setMyIdeas(filtered);
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
      await secondaryAPI.post("/ideas", {
        title: newIdea.title,
        description: newIdea.description,
        studentId: user.id,
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
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <ToastContainer position="top-center" />

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-indigo-800">
          Submit a New Project Idea
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white text-indigo-800 rounded-2xl shadow p-6 space-y-4"
        >
          <div>
            <label className="block font-medium mb-1 text-indigo-800">
              Title:
            </label>
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
            <label className="block font-medium mb-1 text-indigo-800">
              Description:
            </label>
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
            className="bg-indigo-800 text-neutral-100 font-semibold rounded-lg px-6 py-2 hover:bg-indigo-900 transition"
          >
            Submit Idea
          </button>
        </form>

        <div>
          <h2 className="text-xl font-medium mb-2 text-indigo-800">
            My Project Ideas
          </h2>

          {/* Desktop Table with Description */}
          <div className="hidden md:block overflow-x-auto">
            {myIdeas.length === 0 ? (
              <p className="text-indigo-600">
                You have not submitted any ideas yet.
              </p>
            ) : (
              <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
                <thead className="bg-indigo-800 text-neutral-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">Description</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {myIdeas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-neutral-200">
                      <td className="px-6 py-4 text-indigo-800">
                        {idea.title}
                      </td>
                      <td className="px-6 py-4 text-indigo-800">
                        {idea.description.length > 50
                          ? idea.description.slice(0, 50) + "..."
                          : idea.description}
                      </td>
                      <td className="px-6 py-4 capitalize text-indigo-800">
                        {idea.status}
                      </td>
                      <td className="px-6 py-4 text-indigo-800">
                        {idea.reason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards including short Description */}
          <div className="md:hidden space-y-4">
            {myIdeas.length === 0 ? (
              <p className="text-indigo-600 text-center">
                You have not submitted any ideas yet.
              </p>
            ) : (
              myIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white p-4 rounded-lg shadow space-y-2"
                >
                  <p className="font-semibold text-indigo-800">{idea.title}</p>
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
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
