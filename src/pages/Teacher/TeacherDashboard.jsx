// src/pages/Teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";

export default function TeacherDashboard() {
  const { user } = useAuth(); // user.userId is teacher’s ID
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchAssignedStudents();
  }, []);

  const fetchAssignedStudents = async () => {
    try {
      const res = await axiosInstance.get(
        `/assignments?teacherId=${user.userId}`
      );
      // res.data is array of assignments; each has studentName & studentId
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.fullName}</h1>
        <h2 className="text-xl font-medium mb-2">Your Students:</h2>
        {students.length === 0 ? (
          <p className="text-gray-600">No students assigned.</p>
        ) : (
          <ul className="list-disc list-inside space-y-2">
            {students.map((a) => (
              <li key={a.id}>{a.studentName}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
