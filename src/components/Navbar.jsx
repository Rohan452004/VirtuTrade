import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
import axios from "axios";
import { FiMenu, FiX } from "react-icons/fi";
import { useTheme } from "../contexts/ThemeContext";
import { Sun, Moon, User, LogOut, RotateCcw, History, Clock } from "lucide-react";

const Navbar = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const email = sessionStorage.getItem("userEmail");
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const [time, setTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const profileRef = useRef(null);

  useEffect(() => {
    if (!email) navigate("/");
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

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
    <nav className={`${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900 border-b border-gray-200"
      } sticky top-0 shadow-lg z-50`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto rounded-lg" />
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Search RELIANCE, TATAMOTORS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${theme === "dark"
                    ? "bg-gray-800 text-white placeholder-gray-400"
                    : "bg-gray-100 text-gray-900 placeholder-gray-500"
                    }`}
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium"
              >
                Search
              </button>
            </div>
          </div>

          {/* Right Side - Time and Profile */}
          <div className="flex items-center gap-3">
            {/* Time Display - Desktop */}
            <div className={`hidden md:flex items-center gap-2.5 px-4 py-2 rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"
              }`}>
              <Clock size={20} className={theme === "dark" ? "text-gray-400" : "text-gray-500"} />
              <span className={`text-base font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                {time.toLocaleTimeString()}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>

            {/* Profile Icon Button */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`p-2 rounded-full transition-all ${theme === "dark"
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
                  } ${isProfileOpen ? "ring-2 ring-blue-500" : ""}`}
                title={`${user.username} - ₹${user.balance.toFixed(2)}`}
              >
                <User size={22} className={theme === "dark" ? "text-gray-300" : "text-gray-700"} />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border z-50 ${theme === "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
                  }`}>
                  {/* User Info Section */}
                  <div className={`p-5 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                        }`}>
                        <User size={24} className={theme === "dark" ? "text-white" : "text-gray-900"} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-base ${theme === "dark" ? "text-white" : "text-gray-900"
                          }`}>
                          {user.username}
                        </p>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}>
                          {email}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                      }`}>
                      <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}>
                        Balance
                      </span>
                      <span className="text-green-400 font-bold text-lg">
                        ₹{user.balance.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      {theme === "dark" ? (
                        <Sun size={20} className="text-yellow-400" />
                      ) : (
                        <Moon size={20} className="text-blue-600" />
                      )}
                      <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                        {theme === "dark" ? "Light Mode" : "Dark Mode"}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        navigate("/history");
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      <History size={20} className={theme === "dark" ? "text-blue-400" : "text-blue-600"} />
                      <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                        Transaction History
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        resetAccount();
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                        }`}
                    >
                      <RotateCcw size={20} className="text-orange-500" />
                      <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                        Reset Account
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${theme === "dark"
                        ? "hover:bg-red-900/30 text-red-400"
                        : "hover:bg-red-50 text-red-600"
                        }`}
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search and Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-3">
            {/* Mobile Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="🔍 Search RELIANCE, TATAMOTORS..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                className={`flex-1 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme === "dark"
                  ? "bg-gray-800 text-white placeholder-gray-400"
                  : "bg-gray-100 text-gray-900 placeholder-gray-500"
                  }`}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium"
              >
                Go
              </button>
            </div>

            {/* Mobile Profile Dropdown */}
            {isProfileOpen && (
              <div className={`rounded-xl shadow-xl border ${theme === "dark"
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
                }`}>
                {/* User Info Section */}
                <div className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"
                  }`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}>
                      <User size={24} className={theme === "dark" ? "text-white" : "text-gray-900"} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-base ${theme === "dark" ? "text-white" : "text-gray-900"
                        }`}>
                        {user.username}
                      </p>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}>
                        {email}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                    }`}>
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}>
                      Balance
                    </span>
                    <span className="text-green-400 font-bold text-lg">
                      ₹{user.balance.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsProfileOpen(false);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    {theme === "dark" ? (
                      <Sun size={20} className="text-yellow-400" />
                    ) : (
                      <Moon size={20} className="text-blue-600" />
                    )}
                    <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      navigate("/history");
                      setIsProfileOpen(false);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    <History size={20} className={theme === "dark" ? "text-blue-400" : "text-blue-600"} />
                    <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                      Transaction History
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      resetAccount();
                      setIsProfileOpen(false);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    <RotateCcw size={20} className="text-orange-500" />
                    <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                      Reset Account
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${theme === "dark"
                      ? "hover:bg-red-900/30 text-red-400"
                      : "hover:bg-red-50 text-red-600"
                      }`}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;