import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { primaryAPI, secondaryAPI } from "../../api/axiosConfig";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [assignedTeacher, setAssignedTeacher] = useState({
    name: "",
    email: "",
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [approvedIdeas, setApprovedIdeas] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        // 1) Get this student's assignment
        const assignRes = await secondaryAPI.get(`/assignments`, {
          params: { studentId: user.id },
        });
        const assignment = assignRes.data[0];
        if (!assignment) return;

        // 2) Fetch teacher info
        try {
          const teacherRes = await primaryAPI.get(
            `/auth/${assignment.teacherId}`
          );
          setAssignedTeacher({
            name: assignment.teacherName,
            email: teacherRes.data.email,
          });
        } catch (e) {
          if (e.response?.status !== 404)
            console.error("Error fetching teacher info:", e);
        }

        // 3) Fetch assignments for team members
        let studentIds = [];
        try {
          const teamRes = await secondaryAPI.get(`/assignments`, {
            params: { teacherId: assignment.teacherId },
          });
          studentIds = teamRes.data.map((a) => a.studentId);
        } catch (e) {
          if (e.response?.status !== 404)
            console.error("Error fetching team assignments:", e);
        }

        // 4) Fetch team member details individually to avoid filtering issues
        try {
          if (studentIds.length > 0) {
            const userPromises = studentIds.map((id) =>
              primaryAPI.get(`/auth/${id}`)
            );
            const results = await Promise.all(userPromises);
            setTeamMembers(results.map((r) => r.data));
          }
        } catch (e) {
          if (e.response?.status !== 404)
            console.error("Error fetching team members:", e);
        }

        // 5) Fetch approved ideas for the team
        try {
          if (studentIds.length > 0) {
            const ideasRes = await secondaryAPI.get(`/ideas`, {
              params: { status: "accepted" },
            });
            const filtered = ideasRes.data.filter((idea) =>
              studentIds.includes(idea.studentId)
            );
            setApprovedIdeas(filtered);
          }
        } catch (e) {
          if (e.response?.status === 404) return;
          console.error("Error fetching approved ideas:", e);
        }
      } catch (err) {
        // Suppress 404 errors globally
        if (err.response?.status === 404) return;
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, [user.id]);

  // Prepare chart data: ideas per student
  const ideasPerStudent = {};
  teamMembers.forEach((m) => {
    ideasPerStudent[m.fullName] = 0;
  });
  approvedIdeas.forEach((idea) => {
    const author = teamMembers.find((m) => m.id === idea.studentId);
    if (author) ideasPerStudent[author.fullName]++;
  });

  const barData = {
    labels: Object.keys(ideasPerStudent),
    datasets: [
      {
        label: "# Approved Ideas",
        data: Object.values(ideasPerStudent),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6 text-gray-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Hello, {user.fullName}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Your Teacher</h2>
            {assignedTeacher.name ? (
              <div>
                <p className="font-medium">{assignedTeacher.name}</p>
                <a
                  href={`mailto:${assignedTeacher.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {assignedTeacher.email}
                </a>
              </div>
            ) : (
              <p>Not assigned yet.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Team Members</h2>
            <p className="text-2xl font-bold mb-2">{teamMembers.length}</p>
            {teamMembers.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {teamMembers.map((m) => (
                  <li key={m.id} className="flex flex-col">
                    <span className="font-medium">{m.fullName}</span>
                    <a
                      href={`mailto:${m.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {m.email}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No teammates found.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-2">Approved Ideas</h2>
            <p className="text-2xl font-bold">{approvedIdeas.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ideas by Student</h2>
          {approvedIdeas.length > 0 ? (
            <Bar data={barData} options={{ responsive: true }} />
          ) : (
            <p className="text-center">No approved ideas yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
