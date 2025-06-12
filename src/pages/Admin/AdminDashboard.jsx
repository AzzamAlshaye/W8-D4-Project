// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI, secondaryAPI } from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalIdeas: 0,
    ideasByStatus: { pending: 0, accepted: 0, rejected: 0 },
    studentsPerTeacher: {},
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, ideasRes, assignmentsRes] =
          await Promise.all([
            primaryAPI.get("/students"),
            primaryAPI.get("/teachers"),
            secondaryAPI.get("/ideas"),
            secondaryAPI.get("/assignments"),
          ]);

        const students = studentsRes.data;
        const teachers = teachersRes.data;
        const ideas = ideasRes.data;
        const assignments = assignmentsRes.data;

        const totalStudents = students.length;
        const totalTeachers = teachers.length;
        const totalIdeas = ideas.length;

        const ideasByStatus = { pending: 0, accepted: 0, rejected: 0 };
        ideas.forEach((idea) => {
          if (idea.status === "pending") ideasByStatus.pending++;
          else if (idea.status === "accepted") ideasByStatus.accepted++;
          else if (idea.status === "rejected") ideasByStatus.rejected++;
        });

        const studentsPerTeacher = {};
        assignments.forEach((a) => {
          const teacherName = a.teacherName || a.teacherId;
          studentsPerTeacher[teacherName] =
            (studentsPerTeacher[teacherName] || 0) + 1;
        });

        setStats({
          totalStudents,
          totalTeachers,
          totalIdeas,
          ideasByStatus,
          studentsPerTeacher,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  const {
    totalStudents,
    totalTeachers,
    totalIdeas,
    ideasByStatus,
    studentsPerTeacher,
  } = stats;

  const doughnutData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [
      {
        data: [
          ideasByStatus.pending,
          ideasByStatus.accepted,
          ideasByStatus.rejected,
        ],
        backgroundColor: ["#f59e0b", "#10b981", "#ef4444"],
        hoverOffset: 4,
      },
    ],
  };

  const barData = {
    labels: Object.keys(studentsPerTeacher),
    datasets: [
      {
        data: Object.values(studentsPerTeacher),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <Navbar />

      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium">Total Students</h2>
            <p className="text-3xl font-bold">{totalStudents}</p>
          </div>
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium">Total Teachers</h2>
            <p className="text-3xl font-bold">{totalTeachers}</p>
          </div>
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium">Total Ideas</h2>
            <p className="text-3xl font-bold">{totalIdeas}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Ideas by Status</h3>
            <Doughnut data={doughnutData} />
          </div>
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Students per Teacher</h3>
            <Bar
              data={barData}
              options={{
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
