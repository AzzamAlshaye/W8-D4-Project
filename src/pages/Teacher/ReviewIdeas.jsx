// src/pages/Teacher/ReviewIdeas.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";

export default function ReviewIdeas() {
  const { user } = useAuth(); // teacher
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    fetchStudentsAndIdeas();
  }, []);

  const fetchStudentsAndIdeas = async () => {
    try {
      // 1) fetch assignments for this teacher from secondaryAPI
      const assignmentsRes = await secondaryAPI.get(
        `/assignments?teacherId=${user.userId}`
      );
      const assignedStudents = assignmentsRes.data.map((a) => a.studentId);

      // 2) fetch ideas for those students
      if (assignedStudents.length === 0) {
        setIdeas([]);
        return;
      }
      const query = assignedStudents.map((id) => `studentId=${id}`).join("&");
      const ideasRes = await secondaryAPI.get(`/ideas?${query}`);
      setIdeas(ideasRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ideas");
    }
  };

  const updateStatus = async (ideaId, newStatus) => {
    if (newStatus === "rejected") {
      const reason = prompt("Please provide reason for rejection:");
      if (reason === null) return;
      try {
        await secondaryAPI.put(`/ideas/${ideaId}`, {
          status: "rejected",
          reason,
        });
        toast.success("Idea rejected");
        fetchStudentsAndIdeas();
      } catch (err) {
        console.error(err);
        toast.error("Failed to reject");
      }
    } else {
      try {
        await secondaryAPI.put(`/ideas/${ideaId}`, {
          status: "accepted",
          reason: "",
        });
        toast.success("Idea accepted");
        fetchStudentsAndIdeas();
      } catch (err) {
        console.error(err);
        toast.error("Failed to accept");
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <Navbar />

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Review Project Ideas</h1>

        {ideas.length === 0 ? (
          <p className="text-indigo-800">No ideas from your students.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-neutral-100 rounded-lg shadow">
              <thead className="bg-indigo-800 text-neutral-100">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-neutral-200">
                    <td className="px-6 py-4">{idea.title}</td>
                    <td className="px-6 py-4">{idea.studentName}</td>
                    <td className="px-6 py-4 capitalize">{idea.status}</td>
                    <td className="px-6 py-4 space-x-2">
                      {idea.status === "pending" ? (
                        <>
                          <button
                            onClick={() => updateStatus(idea.id, "accepted")}
                            className="bg-indigo-800 text-neutral-100 px-3 py-1 rounded hover:bg-indigo-900"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(idea.id, "rejected")}
                            className="bg-neutral-100 text-indigo-800 px-3 py-1 rounded hover:bg-neutral-200"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-indigo-800">
                          {idea.status.charAt(0).toUpperCase() +
                            idea.status.slice(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
