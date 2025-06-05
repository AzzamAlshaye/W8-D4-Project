// src/pages/Student/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [assignedTeacher, setAssignedTeacher] = useState(null);
  const [approvedIdeas, setApprovedIdeas] = useState([]);

  useEffect(() => {
    fetchAssignedTeacher();
    fetchApprovedIdeas();
  }, []);

  const fetchAssignedTeacher = async () => {
    try {
      const res = await axiosInstance.get(
        `/assignments?studentId=${user.userId}`
      );
      if (res.data.length > 0) {
        setAssignedTeacher(res.data[0].teacherName);
      } else {
        setAssignedTeacher(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApprovedIdeas = async () => {
    try {
      const res = await axiosInstance.get("/ideas?status=accepted");
      setApprovedIdeas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>

        <div>
          <h2 className="text-xl font-medium mb-2">Assigned Teacher:</h2>
          <p className="text-gray-700">
            {assignedTeacher || "Not assigned yet."}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-2">Approved Project Ideas:</h2>
          {approvedIdeas.length === 0 ? (
            <p className="text-gray-600">No approved ideas yet.</p>
          ) : (
            <ul className="list-disc list-inside space-y-2">
              {approvedIdeas.map((idea) => (
                <li key={idea.id} className="text-gray-800">
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
