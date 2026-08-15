import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WorkoutSessions from "./components/WorkoutSessions";
import Gallery from "./components/Gallery";
import Pricing from "./components/Pricing";
import Contact from "./components/Contact";
import BMICalculator from "./components/BMICalculator";
import Footer from "./components/Footer";
import AdminDashboard from "./components/AdminDashboard";
import Preloader from "./components/Preloader";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";

const HomePage = () => (
  <>
    <Preloader />
    <Navbar />
    <Hero />
    <WorkoutSessions />
    <Gallery />
    <Pricing />
    <Contact />
    <BMICalculator />
    <Footer />
  </>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminPanel />} />
        </Routes>
        <ToastContainer theme="dark" position="top-center" />
      </Router>
    </AuthProvider>
  );
};

export default App;
