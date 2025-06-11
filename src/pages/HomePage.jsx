// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { tertiaryAPI } from "../api/axiosConfig";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFullName, setNewFullName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [adding, setAdding] = useState(false);

  // Fetch student cards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const resp = await tertiaryAPI.get("/cards");
      setCards(resp.data);
    } catch (err) {
      console.error("Error fetching cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Add new student (admin only)
  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newFullName.trim() || !newClass.trim()) return;
    try {
      setAdding(true);
      const payload = { fullName: newFullName.trim(), class: newClass.trim() };
      const resp = await tertiaryAPI.post("/cards", payload);
      setCards((prev) => [resp.data, ...prev]);
      setNewFullName("");
      setNewClass("");
    } catch (err) {
      console.error("Error adding card:", err);
    } finally {
      setAdding(false);
    }
  };

  // Delete a student card (admin only)
  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await tertiaryAPI.delete(`/cards/${cardId}`);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (err) {
      console.error("Error deleting card:", err);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-800 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.fullName}</h1>
            <p className="text-neutral-300">
              You are logged in as{" "}
              <span className="font-semibold uppercase">{user?.userType}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-600 rounded-lg transition"
          >
            Logout
          </button>
        </header>

        {/* Admin-only: Add New Student Form */}
        {user?.userType === "admin" && (
          <form
            onSubmit={handleAddCard}
            className="mb-8 bg-neutral-100 text-indigo-800 p-6 rounded-2xl shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">Add New Student</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-indigo-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Class</label>
                <input
                  type="text"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full px-4 py-2 border border-indigo-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-800"
                  placeholder="e.g. Grade 10"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="mt-4 px-6 py-2 bg-indigo-800 text-neutral-100 font-semibold rounded-lg hover:bg-indigo-900 transition disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add Student"}
            </button>
          </form>
        )}

        {/* Student List */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Student List</h2>
          {loading ? (
            <p className="text-neutral-300">Loading students…</p>
          ) : cards.length === 0 ? (
            <p className="text-neutral-300">No students found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-neutral-100 text-indigo-800 p-4 rounded-2xl shadow flex flex-col"
                >
                  <h3 className="text-xl font-bold mb-2">{card.fullName}</h3>
                  <p className="mb-4">
                    <span className="font-medium">Class:</span> {card.class}
                  </p>
                  {user?.userType === "admin" && (
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="mt-auto bg-indigo-800 hover:bg-indigo-900 text-neutral-100 py-1 px-3 rounded-lg font-medium transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
