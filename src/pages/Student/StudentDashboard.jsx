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
      let studentIds = [];

      try {
        // 1) Get this student's assignment (to find their teacher)
        const assignRes = await secondaryAPI.get("/assignments", {
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

        // 3) Fetch team assignments (to get all student IDs under the same teacher)
        try {
          const teamRes = await secondaryAPI.get("/assignments", {
            params: { teacherId: assignment.teacherId },
          });
          studentIds = teamRes.data.map((a) => a.studentId);
        } catch (e) {
          if (e.response?.status !== 404)
            console.error("Error fetching team assignments:", e);
        }

        // 4) Fetch team member details
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

        // 5) Fetch *all* accepted ideas for those team members
        try {
          if (studentIds.length > 0) {
            const ideasRes = await secondaryAPI.get("/ideas", {
              params: { status: "accepted" },
            });
            const teamIdeas = ideasRes.data.filter((idea) =>
              studentIds.includes(idea.studentId)
            );
            setApprovedIdeas(teamIdeas);
          }
        } catch (e) {
          if (e.response?.status !== 404)
            console.error("Error fetching team ideas:", e);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error("Error fetching dashboard data:", err);
        }
      }
    };

    fetchData();
  }, [user.id]);

  // Prepare chart data: count of ideas per team member
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

        {/* Teacher & Team Summary */}
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
            <h2 className="text-lg font-semibold mb-2">Team Ideas</h2>
            <p className="text-2xl font-bold">{approvedIdeas.length}</p>
          </div>
        </div>

        {/* Chart: Ideas by Team Member */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Ideas by Student</h2>
          {Object.values(ideasPerStudent).some((count) => count > 0) ? (
            <Bar data={barData} options={{ responsive: true }} />
          ) : (
            <p className="text-center text-gray-500">No approved ideas yet.</p>
          )}
        </div>

        {/* Detailed List of All Team Ideas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Team's Idea Details</h2>
          {approvedIdeas.length > 0 ? (
            <div className="space-y-4">
              {approvedIdeas.map((idea) => (
                <div key={idea.id} className="p-4 bg-gray-50 rounded">
                  <h3 className="text-lg font-medium">{idea.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {idea.description}
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong> {idea.status}
                  </p>
                  {idea.reason && (
                    <p className="text-sm">
                      <strong>Reason:</strong> {idea.reason}
                    </p>
                  )}
                  <p className="text-sm italic text-gray-500">
                    Submitted by: {idea.studentName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No ideas to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}
