import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI, primaryAPI } from "../../api/axiosConfig";
import { useTitle } from "../../hooks/useTitle";
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
  useTitle("Teacher | Dashboard");
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalIdeas: 0,
    ideasByStatus: { pending: 0, accepted: 0, rejected: 0 },
    studentsPerTeacher: {},
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        // 1) Fetch assignments for this teacher
        const assignRes = await secondaryAPI.get("/assignments", {
          params: { teacherId: user.id },
        });
        const assignments = assignRes.data;
        const totalStudents = assignments.length;
        setStats((prev) => ({ ...prev, totalStudents }));

        if (!totalStudents) {
          setStudents([]);
          return;
        }

        // 2) Fetch each student record
        const studentIds = assignments.map((a) => a.studentId);
        const userPromises = studentIds.map((id) =>
          primaryAPI.get(`/auth/${id}`)
        );
        const userResults = await Promise.allSettled(userPromises);
        const users = userResults
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value.data);

        // 3) Merge student info
        const withEmail = assignments.map((a) => {
          const u = users.find((u) => u.id === a.studentId);
          return {
            id: a.id,
            studentName: a.studentName,
            email: u?.email || "unknown@example.com",
          };
        });
        setStudents(withEmail);

        // 4) Fetch ideas per student
        const ideaPromises = studentIds.map((id) =>
          secondaryAPI.get("/ideas", { params: { studentId: id } })
        );
        const ideaResults = await Promise.allSettled(ideaPromises);
        const ideas = ideaResults
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => r.value.data);

        const totalIdeas = ideas.length;
        const ideasByStatus = { pending: 0, accepted: 0, rejected: 0 };
        ideas.forEach((idea) => {
          if (idea.status === "pending") ideasByStatus.pending++;
          else if (idea.status === "accepted") ideasByStatus.accepted++;
          else if (idea.status === "rejected") ideasByStatus.rejected++;
        });

        // 5) Students per teacher stats
        const studentsPerTeacher = {};
        assignments.forEach((a) => {
          const name = a.teacherName || a.teacherId;
          studentsPerTeacher[name] = (studentsPerTeacher[name] || 0) + 1;
        });

        setStats({
          totalStudents,
          totalIdeas,
          ideasByStatus,
          studentsPerTeacher,
        });
      } catch (err) {
        if (err.response?.status === 404) return;
        console.error("Failed to fetch teacher data:", err);
      }
    };

    fetchData();
  }, [user.id]);

  const { totalStudents, totalIdeas, ideasByStatus, studentsPerTeacher } =
    stats;

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
    labels: Object.keys(studentsPerTeacher),
    datasets: [
      {
        label: "Students",
        data: Object.values(studentsPerTeacher),
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
      <div className="p-6 space-y-8">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium">Total Students</h2>
            <p className="text-3xl font-bold">{totalStudents}</p>
          </div>
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium">Total Ideas</h2>
            <p className="text-3xl font-bold">{totalIdeas}</p>
          </div>
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium">Students/Teacher</h2>
            <p className="text-3xl font-bold">
              {Object.keys(studentsPerTeacher).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Ideas by Status</h3>
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
          <div className=" bg-indigo-800 text-neutral-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Students per Teacher</h3>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-medium">Your Assigned Students:</h3>
          {students.length === 0 ? (
            <p className="text-indigo-600">No students assigned.</p>
          ) : (
            <ul className="list-disc list-inside space-y-2">
              {students.map((s) => (
                <li key={s.id} className="text-indigo-800">
                  {s.studentName} –{" "}
                  <a
                    href={`mailto:${s.email}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {s.email}
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
