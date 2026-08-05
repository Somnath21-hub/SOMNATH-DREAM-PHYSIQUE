import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogIn, Settings, BarChart3, Dumbbell, Menu, X } from "lucide-react";
import AuthModal from "./AuthModal";
import UserProfile from "./UserProfile";

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenAuth = () => setShowAuthModal(true);
    window.addEventListener("open-auth-modal", handleOpenAuth);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuth);
  }, []);

  const handleAuthClick = () => {
    setShowAuthModal(true);
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-header-mobile">
          <div className="navbar-brand">
            <Dumbbell className="brand-logo-icon" size={24} />
            <h1>Dream Physique</h1>
          </div>
          
          <button className="navbar-toggle-btn" onClick={toggleMenu} aria-label="Toggle Menu">
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
        
        <nav className={`navbar-nav ${isMenuOpen ? "active" : ""}`}>
          <a href="#home" onClick={handleLinkClick}>Home</a>
          <a href="#workouts" onClick={handleLinkClick}>Workouts</a>
          <a href="#gallery" onClick={handleLinkClick}>Gallery</a>
          <a href="#pricing" onClick={handleLinkClick}>Pricing</a>
          <a href="#contact" onClick={handleLinkClick}>Contact</a>
          <a href="#bmi" onClick={handleLinkClick}>BMI Calculator</a>
        </nav>

        <div className={`navbar-actions ${isMenuOpen ? "active" : ""}`}>
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-button" onClick={handleProfileClick}>
                <User size={20} />
                <span>{user?.name}</span>
              </button>
              {user?.role === "admin" && (
                <Link to="/dashboard" className="dashboard-link" onClick={handleLinkClick}>
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
