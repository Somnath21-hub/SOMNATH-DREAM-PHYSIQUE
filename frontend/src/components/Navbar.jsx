import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogIn, Settings, BarChart3, Dumbbell } from "lucide-react";
import AuthModal from "./AuthModal";
import UserProfile from "./UserProfile";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  React.useEffect(() => {
    const handleOpenAuth = () => setShowAuthModal(true);
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-brand">
          <Dumbbell className="brand-logo-icon" size={24} />
          <h1>Dream Physique</h1>
        </div>
        
        <nav className="navbar-nav">
          <a href="#home">Home</a>
          <a href="#workouts">Workouts</a>
          <a href="#gallery">Gallery</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
          <a href="#bmi">BMI Calculator</a>
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-button" onClick={handleProfileClick}>
                <User size={20} />
                <span>{user?.name}</span>
              </button>
              {user?.role === "admin" && (
                <Link to="/dashboard" className="dashboard-link">
                  <BarChart3 size={20} />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          ) : (
            <button className="login-button" onClick={handleAuthClick}>
              <LogIn size={20} />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default Navbar;
