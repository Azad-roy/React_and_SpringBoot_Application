import React, { useState, useEffect } from "react";
import { FaPlus, FaUsers } from "react-icons/fa";

const pageSize = 6;

const TeamDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [popupTeam, setPopupTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newScore, setNewScore] = useState("");

  // Load teams
  const loadTeams = async (page = 0) => {
    try {
      setLoading(true);
      const res = await fetch(`https://reactandspringbootbackend-production.up.railway.app/team?pageNum=${page}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      const pageData = await res.json();
      setTeams(pageData.content || []);
      setCurrentPage(pageData.number);
      setTotalPages(pageData.totalPages);
    } catch (err) {
      console.error(err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams(0);
  }, []);

  const fetchTeam = async (name) => {
    try {
      const res = await fetch(`https://reactandspringbootbackend-production.up.railway.app/team/${name}`);
      if (!res.ok) throw new Error("Failed to fetch team");
      const team = await res.json();
      setPopupTeam(team);
    } catch (err) {
      console.error(err);
      alert("Could not fetch team details.");
    }
  };

  const closePopup = () => setPopupTeam(null);

  const addTeam = async (e) => {
    e.preventDefault();
    const scoreValue = parseInt(newScore);
    if (!newTeamName || isNaN(scoreValue)) {
      alert("Please enter valid team name and score.");
      return;
    }
    try {
      const res = await fetch("https://reactandspringbootbackend-production.up.railway.app/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName, score: scoreValue }),
      });
      if (!res.ok) throw new Error("Failed to add team");
      setNewTeamName("");
      setNewScore("");
      loadTeams(0);
    } catch (err) {
      console.error(err);
      alert("Could not add team.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      const res = await fetch(`https://reactandspringbootbackend-production.up.railway.app/team/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete team");
      // Reload teams after deletion
      loadTeams(currentPage);
    } catch (err) {
      console.error(err);
      alert("Could not delete team.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700 mb-2">
            Team Dashboard
          </h1>
          <p className="text-gray-600">Explore team details and add new teams.</p>
        </header>

        {/* Add Team Form */}
        <form className="flex flex-col md:flex-row gap-4 mb-10 bg-white p-6 rounded-xl shadow-md" onSubmit={addTeam}>
          <input
            type="text"
            placeholder="Enter new team name (e.g., T5)"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Enter your team score"
            value={newScore}
            onChange={(e) => setNewScore(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition transform hover:-translate-y-1 shadow-md"
          >
            <FaPlus /> Add Team
          </button>
        </form>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <p>Loading teams...</p>
          ) : teams.length === 0 ? (
            <p>No teams found. Add one!</p>
          ) : (
            teams.map((team) => (
              <div key={team.name} className="bg-white ...">
                ...
                <div className="card flex flex-col items-center p-6 shadow-lg rounded-xl relative">
                  <div className="card-icon ..."><FaUsers size={32} /></div>
                  <div className="card-title text-lg font-semibold">{team.name}</div>
                  <div className="card-description text-gray-500 mb-3">Score: {team.score}</div>

                  {/* Delete button goes here */}
                  <button
                    className="btn btn-red mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening popup
                      handleDelete(team.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))

          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            className="bg-blue-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={currentPage === 0}
            onClick={() => loadTeams(currentPage - 1)}
          >
            &laquo; Previous
          </button>
          <span className="font-semibold text-blue-700">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            className="bg-blue-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={currentPage >= totalPages - 1}
            onClick={() => loadTeams(currentPage + 1)}
          >
            Next &raquo;
          </button>
        </div>

        {/* Popup */}
        {popupTeam && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={closePopup}
          >
            <div className="bg-white rounded-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-4">{popupTeam.name}</h2>
              <p className="mb-6">
                Team ID: {popupTeam.id || "N/A"} <br />
                Score: {popupTeam.score}
              </p>
              <button
                className="bg-blue-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-semibold"
                onClick={closePopup}
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>


    </div>
  );
};

export default TeamDashboard;
