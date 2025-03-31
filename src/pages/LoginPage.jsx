import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import GoogleLogo from "../assets/GoogleLogo.png";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function getUserData(email) {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_APP_WEB_URL}/api/users/${email}`
      );

      if (res.data.success) {
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        console.error("Error fetching data");
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  }

  async function login(e) {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_WEB_URL}/api/users/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        sessionStorage.setItem("userEmail", email);
        await getUserData(email);
        toast.success("Login successful");
        setTimeout(() => {
          navigate("/home", { state: { email: email } });
        }, 1000);
      } else {
        toast.error("Error", res.data.message);
      }
    } catch (error) {
      console.error("Login error: ", error);
      toast.error("Invalid Credentials");
    }
  }

  // 🔹 Google Login Handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // 🔹 Send only access_token to backend
        const res = await axios.post(
          `${import.meta.env.VITE_APP_WEB_URL}/api/auth/google`,
          {
            token: response.access_token,
          },
          { withCredentials: true }
        );

        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          sessionStorage.setItem("userEmail", res.data.email);
          await getUserData(res.data.email);
          toast.success("Logged in with Google!");
          setTimeout(() => {
            navigate("/home", { state: { email: res.data.email } });
          }, 1000);
        } else {
          toast.error("Google login failed!");
        }
      } catch (error) {
        toast.error("Google Authentication Error!");
      }
    },
    onError: () => toast.error("Google Sign-In Failed!"),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white relative overflow-hidden">
      {/* Floating Neon Glow Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-60 h-60 bg-green-500 opacity-20 rounded-full filter blur-3xl top-20 left-10 animate-pulse"></div>
        <div className="absolute w-48 h-48 bg-purple-500 opacity-20 rounded-full filter blur-3xl bottom-10 right-20 animate-bounce"></div>
      </div>

      {/* Login Form */}
      <motion.div
        className="w-full max-w-md bg-gray-900 bg-opacity-80 backdrop-blur-lg border border-gray-700 rounded-lg shadow-2xl p-8 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-purple-500 mb-6">
          Welcome Back 🚀
        </h2>
        <form onSubmit={login}>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Your Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          <motion.button
            type="submit"
            className="w-full px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-400 transition-all border border-green-400 mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login 🔥
          </motion.button>
        </form>

        {/* 🔹 Google Sign-In Button */}
        <motion.button
          className="w-full flex items-center justify-center gap-3 bg-white text-black p-3 rounded-md font-semibold shadow-md hover:bg-gray-200 transition-all border border-gray-300 mt-4"
          onClick={() => googleLogin()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={GoogleLogo} alt="Google Logo" className="w-5 h-5" />
          <span>Continue with Google</span>
        </motion.button>

        {/* Forgot Password & SignUp Links */}
        <div className="mt-4 flex flex-col items-center">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Forgot Password?
          </button>
          <p className="mt-4 text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-green-400 hover:text-green-300 font-semibold"
            >
              Sign Up
            </button>
          </p>
        </div>
      </motion.div>

      {/* Animated Wave Effect */}
      <div className="absolute bottom-0 left-0 w-full h-24 md:h-32 bg-gradient-to-t from-gray-950 via-black to-transparent"></div>

      {/* Footer */}
      <footer className="absolute bottom-5 text-gray-400 text-xs md:text-sm z-10">
        <p>&copy; 2025 VirtuTrade. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LoginPage;
