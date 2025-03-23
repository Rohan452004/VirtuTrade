import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const email = sessionStorage.getItem("userEmail");
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));

  const [time, setTime] = useState(new Date());

  const handleSearch = () => {
    if (search.trim() !== "") {
      onSearch(search); // Send search term to the parent
      setSearch("");
    }
  };

  const logout = () => {
    navigate("/");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    sessionStorage.clear();
    localStorage.clear();
  };

  useEffect(() => {
    if (email === null) {
      navigate("/"); // Redirect to login if no user
    }
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="bg-gray-900 text-white p-3 sticky top-0 shadow-lg z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        {/* Logo and Name */}
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Logo" className="w-50 h-12 rounded" />
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-white text-gray-700 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>

        {/* Market Time */}
        <div className="hidden md:block">
          <span>{time.toLocaleString()}</span>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-6">
          <li>
            <a href="/history" className="hover:text-gray-300">
              History
            </a>
          </li>
          <li>
            <button onClick={logout} className="hover:text-gray-300">
              Logout
            </button>
          </li>
        </ul>

        {/* User Profile */}
        <div className="flex items-center space-x-4">
          <span>Name: {user.username}</span>
          <span>Bal: {user.balance.toFixed(2)}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
