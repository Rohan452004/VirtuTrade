import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import axios from "axios";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const email = sessionStorage.getItem("userEmail");
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!email) navigate("/");
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (search.trim() !== "") {
      onSearch(search);
      setSearch("");
    }
  };

  const logout = () => {
    navigate("/");
    sessionStorage.clear();
    localStorage.clear();
  };

  const resetAccount = async () => {
    if (window.confirm("This will reset ALL account data! Are you sure?")) {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_APP_WEB_URL}/api/account/reset`,
          {},
          { withCredentials: true }
        );

        // Update local user data
        const updatedUser = { ...user, balance: res.data.newBalance };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        // Refresh the page to reset all data
        window.location.reload();
      } catch (error) {
        console.error("Account reset failed:", error);
        alert("Failed to reset account. Please try again.");
      }
    }
  };

  return (
    <nav className="bg-gray-900 text-white p-3 sticky top-0 shadow-lg z-50">
      <div className="container mx-auto flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Logo and Balance - Top Row Mobile */}
        <div className="flex justify-between w-full md:w-auto items-center">
          <img src={logo} alt="Logo" className="h-8 w-auto rounded-lg" />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          <div className="md:hidden bg-gray-800 px-3 py-1 rounded-lg">
            <span className="font-medium mr-3">{user.username}</span>
            <span className="text-green-400 font-medium">
              ₹{user.balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="w-full md:w-auto flex justify-between items-center gap-4">
            {/* Mobile Buttons */}
            <div className="flex gap-2 md:hidden w-full">
              <button
                onClick={() => navigate("/history")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                       bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                📜 History
              </button>
              {/* Reset Button */}
              <button
                onClick={resetAccount}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                       bg-orange-600 rounded-lg hover:bg-orange-500"
              >
                💣 Reset
              </button>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                       bg-red-600 rounded-lg hover:bg-red-500"
              >
                🔒 Logout
              </button>
            </div>
          </div>
        )}

        {/* Search Bar - Bottom Stage Mobile */}
        <div className="w-full md:flex-1 md:max-w-xl relative group">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="🔍 Search TATAMOTORS, RELIANCE..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl bg-gray-800 text-white 
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-400 transition-all"
              />
              <button
                onClick={handleSearch}
                className="md:hidden absolute right-2 top-2 bg-gradient-to-r from-blue-500 to-blue-600 
                          px-4 py-1 rounded-lg text-white font-medium shadow-lg"
              >
                Go
              </button>
            </div>
            <button
              onClick={handleSearch}
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                       text-white rounded-xl hover:shadow-blue-glow transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>
          </div>
        </div>

        {/* Desktop Elements */}
        <div className="hidden md:flex items-center gap-4">
          <div className="bg-gray-800 px-3 py-1 rounded-lg">
            <span className="text-sm">{time.toLocaleTimeString()}</span>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className="font-medium">{user.username}</span>
            <span className="ml-2 text-green-400">
              ₹{user.balance.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            History
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
          >
            Logout
          </button>
          <div className="hidden md:flex items-center gap-4">
            {/* ... other buttons ... */}
            <button
              onClick={resetAccount}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg"
            >
              💣 Reset Account
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;