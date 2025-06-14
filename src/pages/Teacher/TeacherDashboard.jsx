import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI, primaryAPI } from "../../api/axiosConfig";
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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalIdeas: 0,
    ideasByStatus: { pending: 0, accepted: 0, rejected: 0 },
    ideasPerStudent: {},
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        // 1) Fetch assignments for this teacher
        const assignRes = await secondaryAPI.get(
          `/assignments?teacherId=${user.id}`
        );
        const assignments = assignRes.data;

        // Update student count
        const totalStudents = assignments.length;
        setStats((prev) => ({ ...prev, totalStudents }));

        if (totalStudents === 0) {
          setStudents([]);
          return;
        }

        // 2) Collect student IDs
        const studentIds = assignments.map((a) => a.studentId);

        // 3) Fetch student user records
        const usersRes = await primaryAPI.get(
          `/auth?${studentIds.map((id) => `id=${id}`).join("&")}`
        );
        const users = usersRes.data;

        // 4) Merge email & prepare student list
        const withEmail = assignments.map((a) => {
          const u = users.find((u) => u.id === a.studentId);
          return {
            id: a.id,
            studentId: a.studentId,
            studentName: a.studentName,
            email: u?.email || "unknown@example.com",
          };
        });
        setStudents(withEmail);

        // 5) Fetch ideas submitted by these students
        const ideasRes = await secondaryAPI.get(
          `/ideas?${studentIds.map((id) => `studentId=${id}`).join("&")}`
        );
        const ideas = ideasRes.data;

        const totalIdeas = ideas.length;
        const ideasByStatus = { pending: 0, accepted: 0, rejected: 0 };
        ideas.forEach((idea) => {
          if (idea.status === "pending") ideasByStatus.pending++;
          else if (idea.status === "accepted") ideasByStatus.accepted++;
          else if (idea.status === "rejected") ideasByStatus.rejected++;
        });

        // 6) Compute ideas per student
        const ideasPerStudent = {};
        withEmail.forEach((s) => {
          ideasPerStudent[s.studentName] = 0;
        });
        ideas.forEach((idea) => {
          const s = withEmail.find((st) => st.studentId === idea.studentId);
          const name = s?.studentName || idea.studentId;
          ideasPerStudent[name] = (ideasPerStudent[name] || 0) + 1;
        });

        setStats({ totalStudents, totalIdeas, ideasByStatus, ideasPerStudent });
      } catch (err) {
        // Suppress 404 errors from appearing in console
        if (err.response && err.response.status === 404) {
          return;
        }
        console.error("Failed to fetch teacher data:", err);
      }
    };

    fetchData();
  }, [user.id]);

  const { totalStudents, totalIdeas, ideasByStatus, ideasPerStudent } = stats;

  const doughnutData = {
    labels: ["Pending", "Accepted", "Rejected"],
    datasets: [
      {
        label: "Ideas",
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
    labels: Object.keys(ideasPerStudent),
    datasets: [
      {
        label: "Ideas per Student",
        data: Object.values(ideasPerStudent),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: { labels: { color: "#ffffff" } },
      tooltip: { titleColor: "#ffffff", bodyColor: "#ffffff" },
    },
    scales: {
      x: { ticks: { color: "#ffffff" } },
      y: { beginAtZero: true, ticks: { stepSize: 1, color: "#ffffff" } },
    },
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <h2 className="text-xl font-medium">Welcome, {user.fullName}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Total Students</h3>
            <p className="text-3xl font-bold">{totalStudents}</p>
          </div>
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium">Total Ideas</h3>
            <p className="text-3xl font-bold">{totalIdeas}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Ideas by Status</h3>
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Ideas per Student</h3>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium">Your Assigned Students:</h3>
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
    </div>
  );
}
