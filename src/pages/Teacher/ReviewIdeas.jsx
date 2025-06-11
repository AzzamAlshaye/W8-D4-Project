// src/pages/Teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { tertiaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        const res = await tertiaryAPI.get(
          `/assignments?teacherId=${user.userId}`
        );
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssignedStudents();
  }, [user.userId]);

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <Navbar />
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
        <h2 className="text-xl font-medium">Your Students:</h2>

        {students.length === 0 ? (
          <p className="text-indigo-600">No students assigned.</p>
        ) : (
          <ul className="list-disc list-inside space-y-2">
            {students.map((a) => (
              <li key={a.id} className="text-indigo-800">
                {a.studentName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
