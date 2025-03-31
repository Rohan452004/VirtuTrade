import { useState } from 'react'
import { Route, Routes } from "react-router-dom";
import Landing from "./pages/LandingPage";
import Login from "./pages/LoginPage";
import Signup from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import ErrorPage from './pages/ErrorPage';
import HistoryPage from './pages/HistoryPage';
import { GoogleOAuthProvider } from "@react-oauth/google";
// import './App.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Use environment variable

function App() {
  return (
    <>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password/:id" element={<UpdatePassword />} />

          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </GoogleOAuthProvider>
    </>
  );
}

export default App
