// src/pages/Student/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { secondaryAPI, primaryAPI } from "../../api/axiosConfig";

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
        // 1) Get this student's assignment
        const assignRes = await secondaryAPI.get(
          `/assignments?studentId=${user.id}`
        );
        const assignment = assignRes.data[0];
        if (!assignment) return;

        // 2) Fetch teacher record
        try {
          const teacherRes = await primaryAPI.get(
            `/auth/${assignment.teacherId}`
          );
          setAssignedTeacher({
            name: assignment.teacherName,
            email: teacherRes.data.email,
          });
        } catch (err) {
          if (err.response?.status !== 404)
            console.error("Error fetching teacher record:", err);
        }

        // 3) Get all students assigned to same teacher
        const teamRes = await secondaryAPI.get(
          `/assignments?teacherId=${assignment.teacherId}`
        );
        studentIds = teamRes.data.map((a) => a.studentId);

        // 4) Fetch user info for these students
        try {
          const usersRes = await primaryAPI.get("/auth");
          const members = usersRes.data
            .filter((u) => studentIds.includes(u.id))
            .map((u) => ({ id: u.id, fullName: u.fullName, email: u.email }));
          setTeamMembers(members);
        } catch (err) {
          if (err.response?.status !== 404)
            console.error("Error fetching team members:", err);
        }

        // 5) Fetch accepted ideas, then filter for team members only
        try {
          const ideasRes = await secondaryAPI.get("/ideas?status=accepted");
          const filtered = ideasRes.data.filter((idea) =>
            studentIds.includes(idea.studentId)
          );
          setApprovedIdeas(filtered);
        } catch (err) {
          if (err.response?.status !== 404)
            console.error("Error fetching approved ideas:", err);
        }
      } catch (err) {
        if (err.response?.status !== 404)
          console.error("Error fetching assignment:", err);
      }
    };

    fetchData();
  }, [user.id]);

  return (
    <div className="min-h-screen bg-neutral-100 text-indigo-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>

        {/* Assigned Teacher */}
        <div>
          <h2 className="text-xl font-medium mb-2">Assigned Teacher:</h2>
          {assignedTeacher.name ? (
            <p className="text-indigo-900">
              <strong>{assignedTeacher.name}</strong> –{" "}
              <a
                href={`mailto:${assignedTeacher.email}`}
                className="text-indigo-600 hover:underline"
              >
                {assignedTeacher.email}
              </a>
            </p>
          ) : (
            <p className="text-indigo-900">Not assigned yet.</p>
          )}
        </div>

        {/* Team Members */}
        <div>
          <h2 className="text-xl font-medium mb-2">Team Members:</h2>
          {teamMembers.length === 0 ? (
            <p className="text-indigo-900">No teammates found.</p>
          ) : (
            <ul className="list-disc list-inside space-y-2">
              {teamMembers.map((m) => (
                <li key={m.id} className="text-indigo-800">
                  {m.fullName} –{" "}
                  <a
                    href={`mailto:${m.email}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {m.email}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Approved Ideas (Team Only) */}
        <div>
          <h2 className="text-xl font-medium mb-2">
            Approved Project Ideas (Your Team)
          </h2>
          {approvedIdeas.length === 0 ? (
            <p className="text-indigo-900">No approved ideas yet.</p>
          ) : (
            <ul className="list-disc list-inside space-y-2">
              {approvedIdeas.map((idea) => (
                <li key={idea.id} className="text-indigo-800">
                  {idea.title} (by {idea.studentName})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
