import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/Logo.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Floating Blur Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-48 h-48 md:w-96 md:h-96 bg-green-500 opacity-20 rounded-full filter blur-3xl top-20 left-10 animate-float"></div>
        <div className="absolute w-40 h-40 md:w-80 md:h-80 bg-yellow-500 opacity-20 rounded-full filter blur-3xl bottom-10 right-20 animate-float-delay"></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-center max-w-6xl mx-auto z-10">
        <motion.img
          src={Logo}
          alt="VirtuTrade Logo"
          className="h-10 md:h-14 cursor-pointer"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
        <nav className="flex space-x-2 md:space-x-4">
          <motion.button
            className="px-4 py-2 md:px-6 md:py-2 text-sm md:text-lg font-semibold bg-white bg-opacity-10 backdrop-blur-md text-black rounded-lg shadow-lg hover:bg-opacity-20 transition-all border border-white border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
          >
            Login
          </motion.button>
          <motion.button
            className="px-4 py-2 md:px-6 md:py-2 text-sm md:text-lg font-semibold bg-green-600 bg-opacity-90 backdrop-blur-md text-white rounded-lg shadow-lg hover:bg-green-500 transition-all border border-green-500 border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </motion.button>
        </nav>
      </header>

      {/* Hero Section */}
      <motion.div
        className="text-center px-4 md:px-6 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-yellow-400">
          Master Trading with <span className="text-green-400">VirtuTrade</span>
        </h2>
        <p className="mt-4 text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
          Practice risk-free trading with real market data. Simulate trades,
          track performance, and sharpen your strategies.
        </p>

        <div className="mt-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center">
          <motion.button
            className="px-6 py-3 md:px-8 md:py-3 text-sm md:text-lg font-semibold bg-green-500 bg-opacity-90 backdrop-blur-md text-white rounded-lg shadow-lg hover:bg-green-400 transition-all border border-green-400 border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/signup")}
          >
            Get Started 🚀
          </motion.button>
          <motion.button
            className="px-6 py-3 md:px-8 md:py-3 text-sm md:text-lg font-semibold bg-white bg-opacity-10 backdrop-blur-md text-black rounded-lg shadow-lg hover:bg-opacity-20 transition-all border border-white border-opacity-20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
          >
            Login 🔥
          </motion.button>
        </div>
      </motion.div>

      {/* Animated Wave Effect */}
      <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-gray-900 via-black to-transparent"></div>

      {/* Footer */}
      <footer className="absolute bottom-5 text-gray-400 text-xs md:text-sm z-10">
        <p>&copy; 2025 VirtuTrade. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
