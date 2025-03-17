import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white relative overflow-hidden px-6">
      {/* Floating Neon Glow Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-60 h-60 bg-green-500 opacity-20 rounded-full filter blur-3xl top-20 left-10 animate-pulse"></div>
        <div className="absolute w-48 h-48 bg-purple-500 opacity-20 rounded-full filter blur-3xl bottom-10 right-20 animate-bounce"></div>
      </div>

      {/* Error Content */}
      <div className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-lg border border-gray-700 rounded-lg shadow-2xl p-10 z-10 text-center">
        <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500 animate-pulse">
          404
        </h1>
        <h2 className="mt-4 text-3xl font-semibold">Oops! Page Not Found</h2>
        <p className="mt-2 text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Fix: Added margin to separate button from text */}
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:bg-green-400 transition-all border border-green-400"
        >
          Go Back Home
        </Link>
      </div>

      {/* Animated Wave Effect */}
      <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-gray-900 via-black to-transparent"></div>

      {/* Footer */}
      <footer className="absolute bottom-5 text-gray-400 text-xs md:text-sm z-10 text-center">
        <p>&copy; 2025 VirtuTrade. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ErrorPage;
