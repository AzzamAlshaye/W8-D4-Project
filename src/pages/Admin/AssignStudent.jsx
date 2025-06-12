// src/pages/Admin/AssignStudent.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI, secondaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import AdminNavbar from "./AdminNavbar";
import { toast } from "react-toastify";

export default function AssignStudent() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await primaryAPI.get("/auth", {
        params: { userType: "student" },
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await primaryAPI.get("/auth", {
        params: { userType: "teacher" },
      });
      setTeachers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch teachers");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedTeacherId) {
      toast.error("Please select both a student and a teacher");
      return;
    }
    try {
      const student = students.find((s) => s.id === selectedStudentId);
      const teacher = teachers.find((t) => t.id === selectedTeacherId);

      await secondaryAPI.post("/assignments", {
        studentId: selectedStudentId,
        studentName: student.fullName,
        teacherId: selectedTeacherId,
        teacherName: teacher.fullName,
      });

      toast.success("Assigned successfully");
      setSelectedStudentId("");
      setSelectedTeacherId("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <Navbar />
      <AdminNavbar />

      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Assign Student to Teacher</h1>

        {user.userType === "admin" ? (
          <form
            onSubmit={handleAssign}
            className="bg-indigo-800 text-neutral-100 p-6 rounded-2xl shadow space-y-4"
          >
            <div>
              <label className="block mb-1">Select Student:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
              >
                <option value="">-- Choose a Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Select Teacher:</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-100 text-indigo-800 border border-indigo-800 rounded-lg focus:ring-2 focus:ring-indigo-800"
              >
                <option value="">-- Choose a Teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-neutral-100 text-indigo-800 font-semibold rounded-lg hover:bg-neutral-200 transition"
            >
              Assign
            </button>
          </form>
        ) : (
          <p className="text-center text-indigo-800">
            Only admins can assign students.
          </p>
        )}
      </div>
    </div>
  );
}
