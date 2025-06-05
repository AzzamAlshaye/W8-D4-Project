// src/pages/Teacher/ReviewIdeas.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import { toast } from "react-toastify";

export default function ReviewIdeas() {
  const { user } = useAuth(); // teacher
  const [ideas, setIdeas] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudentsAndIdeas();
  }, []);

  const fetchStudentsAndIdeas = async () => {
    try {
      // 1) fetch assignments for this teacher
      const assignmentsRes = await axiosInstance.get(
        `/assignments?teacherId=${user.userId}`
      );
      const assignedStudents = assignmentsRes.data.map((a) => a.studentId);

      // 2) fetch ideas for those students
      if (assignedStudents.length === 0) {
        setIdeas([]);
        return;
      }
      // e.g. /ideas?studentId=1&studentId=2&studentId=3
      const query = assignedStudents.map((id) => `studentId=${id}`).join("&");
      const ideasRes = await axiosInstance.get(`/ideas?${query}`);
      setIdeas(ideasRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch ideas");
    }
  };

  const updateStatus = async (ideaId, newStatus) => {
    if (newStatus === "rejected") {
      const reason = prompt("Please provide reason for rejection:");
      if (reason === null) return; // Cancelled
      try {
        await axiosInstance.put(`/ideas/${ideaId}`, {
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
      // accepted
      try {
        await axiosInstance.put(`/ideas/${ideaId}`, {
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Review Project Ideas</h1>
        {ideas.length === 0 ? (
          <p className="text-gray-600">No ideas from your students.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea) => (
                  <tr key={idea.id} className="hover:bg-gray-100">
                    <td className="px-6 py-4">{idea.title}</td>
                    <td className="px-6 py-4">{idea.studentName}</td>
                    <td className="px-6 py-4 capitalize">{idea.status}</td>
                    <td className="px-6 py-4 space-x-2">
                      {idea.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(idea.id, "accepted")}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(idea.id, "rejected")}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {idea.status !== "pending" && (
                        <span className="text-gray-600">
                          {idea.status.charAt(0).toUpperCase() +
                            idea.status.slice(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {ideas.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
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
  );
}
