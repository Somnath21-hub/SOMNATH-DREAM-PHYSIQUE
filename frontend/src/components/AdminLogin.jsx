import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../config";
import { toast } from "react-toastify";
import { Lock, Mail, Dumbbell, ArrowRight } from "lucide-react";
import "../AdminPanel.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in as admin, redirect to dashboard
  useEffect(() => {
    if (token && user && user.role === "admin") {
      navigate("/admin/dashboard");
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/auth/login`, {
        email,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        toast.success("Welcome back, Admin!");
        // Force a page reload to re-initialize the AuthContext with the new token
        window.location.href = "/admin/dashboard";
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials or unauthorized");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-layout">
      <div className="admin-login-card">
        <div className="admin-login-icon-box">
          <Dumbbell size={32} />
        </div>
        <h2>Admin Portal</h2>
        <p>Dream Physique Gym Management</p>

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div className="admin-form-group">
            <label>Email Address</label>
            <div style={{ position: "relative" }}>
              <input
                type="email"
                className="admin-form-control"
                placeholder="admin@gym.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "40px" }}
                required
              />
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="admin-form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "40px" }}
                required
              />
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255, 255, 255, 0.4)",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn-accent admin-login-btn"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login to Panel"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <Link to="/" className="admin-login-footer-link">
          Back to Gym Website
        </Link>
      </div>
    </div>
  );
};

export default AdminLogin;
