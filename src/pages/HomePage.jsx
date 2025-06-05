// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

export default function HomePage() {
  const navigate = useNavigate();

  // Read from localStorage
  const storedFullName = localStorage.getItem("fullName") || "";
  const userType = localStorage.getItem("userType") || "";
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // State for the list of cards (student records)
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for new card form (only for admin)
  const [newFullName, setNewFullName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [adding, setAdding] = useState(false);

  // Fetch all cards on mount
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const resp = await axios.get(
          "https://683fef025b39a8039a5628c9.mockapi.io/cards"
        );
        setCards(resp.data);
      } catch (err) {
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  // Handler to add a new card (only admin)
  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newFullName.trim() || !newClass.trim()) return;

    try {
      setAdding(true);
      // POST to /cards with { fullName, class }
      const payload = {
        fullName: newFullName.trim(),
        class: newClass.trim(),
      };
      const resp = await axios.post(
        "https://683fef025b39a8039a5628c9.mockapi.io/cards",
        payload
      );
      // Optimistically update local state
      setCards((prev) => [resp.data, ...prev]);
      setNewFullName("");
      setNewClass("");
    } catch (err) {
      console.error("Error adding card:", err);
    } finally {
      setAdding(false);
    }
  };

  // Handler to delete a card by id (only admin)
  const handleDeleteCard = async (cardId) => {
    try {
      await axios.delete(
        `https://683fef025b39a8039a5628c9.mockapi.io/cards/${cardId}`
      );
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    } catch (err) {
      console.error("Error deleting card:", err);
    }
  };

  // Simple logout (clears localStorage and redirects)
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {storedFullName}</h1>
            <p className="text-gray-400">
              You are logged in as{" "}
              <span className="font-semibold uppercase">{userType}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Admin-only: Add New Card Form */}
        {userType === "admin" && (
          <form
            onSubmit={handleAddCard}
            className="mb-8 bg-gray-800 p-6 rounded-2xl shadow"
          >
            <h2 className="text-2xl font-semibold mb-4">Add New Student</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-gray-300 font-medium mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="class"
                  className="block text-gray-300 font-medium mb-1"
                >
                  Class
                </label>
                <input
                  id="class"
                  type="text"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g. Grade 10"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add Student"}
            </button>
          </form>
        )}

        {/* Cards List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Student List</h2>

          {loading ? (
            <p className="text-gray-400">Loading cards…</p>
          ) : cards.length === 0 ? (
            <p className="text-gray-400">No students found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="bg-gray-800 p-4 rounded-2xl shadow flex flex-col"
                >
                  <h3 className="text-xl font-bold mb-2">{card.fullName}</h3>
                  <p className="text-gray-300 mb-4">
                    <span className="font-medium">Class:</span> {card.class}
                  </p>

                  {userType === "admin" && (
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="mt-auto bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg font-medium transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
