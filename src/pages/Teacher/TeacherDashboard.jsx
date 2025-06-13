// src/pages/Teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI, primaryAPI } from "../../api/axiosConfig";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAssignedStudents = async () => {
      try {
        // 1) Fetch assignments for this teacher
        const assignRes = await secondaryAPI.get(
          `/assignments?teacherId=${user.id}`
        );
        const assignments = assignRes.data; // [{ id, studentId, studentName, ... }, ...]

        if (assignments.length === 0) {
          setStudents([]);
          return;
        }

        // 2) Collect student IDs
        const studentIds = assignments.map((a) => a.studentId);

        // 3) Fetch student user records to get their emails
        //    JSON-server style supports ?id=1&id=2...
        const usersRes = await primaryAPI.get(
          `/auth?${studentIds.map((id) => `id=${id}`).join("&")}`
        );
        const users = usersRes.data; // [{ id, fullName, email, ... }, ...]

        // 4) Merge email into each assignment entry
        const withEmail = assignments.map((a) => {
          const u = users.find((u) => u.id === a.studentId);
          return {
            id: a.id,
            studentName: a.studentName,
            email: u?.email || "unknown@example.com",
          };
        });

        setStudents(withEmail);
      } catch (err) {
        console.error("Failed to fetch assigned students:", err);
      }
    };

    fetchAssignedStudents();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
        <h2 className="text-xl font-medium">Your Students:</h2>

        {students.length === 0 ? (
          <p className="text-indigo-600">No students assigned.</p>
        ) : (
          <ul className="list-disc list-inside space-y-2">
            {students.map((student) => (
              <li key={student.id} className="text-indigo-800">
                {student.studentName} –{" "}
                <a
                  href={`mailto:${student.email}`}
                  className="text-indigo-600 hover:underline"
                >
                  {student.email}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
