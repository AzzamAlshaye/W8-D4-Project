// src/pages/Student/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { tertiaryAPI, primaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [assignedTeacher, setAssignedTeacher] = useState(null);
  const [approvedIdeas, setApprovedIdeas] = useState([]);

  useEffect(() => {
    const fetchAssignedTeacher = async () => {
      try {
        const res = await tertiaryAPI.get(
          `/assignments?studentId=${user.userId}`
        );
        setAssignedTeacher(
          res.data.length > 0 ? res.data[0].teacherName : null
        );
      } catch (err) {
        console.error(err);
      }
    };

    const fetchApprovedIdeas = async () => {
      try {
        const res = await primaryAPI.get("/ideas?status=accepted");
        setApprovedIdeas(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAssignedTeacher();
    fetchApprovedIdeas();
  }, [user.userId]);

  return (
    <div className="min-h-screen bg-indigo-800 text-neutral-100 p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>

        <div>
          <h2 className="text-xl font-medium mb-2">Assigned Teacher:</h2>
          <p className="text-neutral-300">
            {assignedTeacher || "Not assigned yet."}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">Approved Project Ideas:</h2>
          {approvedIdeas.length === 0 ? (
            <p className="text-neutral-300">No approved ideas yet.</p>
          ) : (
            <ul className="list-disc list-inside space-y-2">
              {approvedIdeas.map((idea) => (
                <li key={idea.id} className="text-neutral-100">
                  {idea.title} (by {idea.studentName})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
