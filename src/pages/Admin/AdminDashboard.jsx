// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../api/axiosConfig";
import Navbar from "../../components/Navbar";
import AdminNavbar from "./AdminNavbar";

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
    studentsPerTeacher: {}, // { teacherName: count }
  });

  useEffect(() => {
    // Fetch stats from backend:
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, ideasRes, assignmentsRes] =
          await Promise.all([
            axiosInstance.get("/students"), // Admin only
            axiosInstance.get("/teachers"),
            axiosInstance.get("/ideas"),
            axiosInstance.get("/assignments"),
          ]);

        const students = studentsRes.data;
        const teachers = teachersRes.data;
        const ideas = ideasRes.data;
        const assignments = assignmentsRes.data;

        // Calculate total counts
        const totalStudents = students.length;
        const totalTeachers = teachers.length;
        const totalIdeas = ideas.length;

        // Count ideas by status
        const ideasByStatus = { pending: 0, accepted: 0, rejected: 0 };
        ideas.forEach((idea) => {
          if (idea.status === "pending") ideasByStatus.pending++;
          else if (idea.status === "accepted") ideasByStatus.accepted++;
          else if (idea.status === "rejected") ideasByStatus.rejected++;
        });

        // Count students per teacher
        const studentsPerTeacher = {};
        assignments.forEach((a) => {
          const teacherName = a.teacherName; // assume backend populates teacherName
          if (!studentsPerTeacher[teacherName]) {
            studentsPerTeacher[teacherName] = 0;
          }
          studentsPerTeacher[teacherName]++;
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

  // Prepare data for Doughnut (ideas by status)
  const doughnutData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [
      {
        label: "# of Ideas",
        data: [
          ideasByStatus.pending,
          ideasByStatus.accepted,
          ideasByStatus.rejected,
        ],
        backgroundColor: ["#f59e0b", "#10b981", "#ef4444"], // amber, green, red
        hoverOffset: 4,
      },
    ],
  };

  // Prepare data for Bar (students per teacher)
  const barData = {
    labels: Object.keys(studentsPerTeacher),
    datasets: [
      {
        label: "# Students",
        data: Object.values(studentsPerTeacher),
        backgroundColor: "#3b82f6", // blue-500
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <AdminNavbar />

      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700">
              Total Students
            </h2>
            <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700">
              Total Teachers
            </h2>
            <p className="text-3xl font-bold text-gray-900">{totalTeachers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-700">Total Ideas</h2>
            <p className="text-3xl font-bold text-gray-900">{totalIdeas}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Ideas by Status
            </h3>
            <Doughnut data={doughnutData} />
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Students per Teacher
            </h3>
            <Bar
              data={barData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
