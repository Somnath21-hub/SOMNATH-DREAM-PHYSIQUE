import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { API_URL } from "../config";
import { toast } from "react-toastify";
import {
  Users,
  Dumbbell,
  Clipboard,
  Activity,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Edit,
  Search,
  Lock,
  Settings,
  LogOut,
  BookOpen,
  Heart,
  Eye,
  CheckCircle,
  XCircle,
  Menu,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../AdminPanel.css";

const AdminPanel = () => {
  const { token, user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth checking
  useEffect(() => {
    if (!authLoading && !token) {
      navigate("/admin/login");
    } else if (!authLoading && user && user.role !== "admin") {
      toast.error("Unauthorized access.");
      logout();
      navigate("/admin/login");
    }
  }, [token, user, authLoading, navigate]);

  // Global Data states
  const [stats, setStats] = useState(null);
  const [userGrowth, setUserGrowth] = useState([]);
  const [membershipDist, setMembershipDist] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [coursePlans, setCoursePlans] = useState([]);
  const [bmiRecords, setBmiRecords] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // Search states
  const [userSearch, setUserSearch] = useState("");
  const [bmiSearch, setBmiSearch] = useState("");
  const [enrollmentSearch, setEnrollmentSearch] = useState("");

  // Loading states
  const [loading, setLoading] = useState({
    stats: true,
    users: false,
    courses: false,
    plans: false,
    bmi: false,
    enrollments: false,
  });

  // Modal open states
  const [modals, setModals] = useState({
    course: false,
    plan: false,
    enrollment: false,
    user: false,
  });

  // Editing items state
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    duration: "6 Weeks",
    intensity: "Medium",
    coach: "Coach Marcus",
    slots: 10,
    price: 0,
  });

  const [planForm, setPlanForm] = useState({
    name: "",
    displayName: "",
    price: 0,
    duration: 3,
    features: [],
    featureInput: "",
  });

  const [enrollmentForm, setEnrollmentForm] = useState({
    userId: "",
    courseId: "",
    status: "active",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    membershipType: "basic",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    password: "",
  });

  // Fetch functions
  const fetchDashboardStats = async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const res = await axios.get(`${API_URL}/api/admin/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
      setUserGrowth(res.data.userGrowth);
      setMembershipDist(res.data.membershipDistribution);
    } catch (error) {
      toast.error("Error fetching dashboard statistics");
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const fetchUsers = async (search = "") => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await axios.get(`${API_URL}/api/admin/users?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (error) {
      toast.error("Error fetching users list");
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  };

  const fetchCourses = async () => {
    setLoading(prev => ({ ...prev, courses: true }));
    try {
      const res = await axios.get(`${API_URL}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(res.data.courses);
    } catch (error) {
      toast.error("Error fetching courses");
    } finally {
      setLoading(prev => ({ ...prev, courses: false }));
    }
  };

  const fetchPlans = async () => {
    setLoading(prev => ({ ...prev, plans: true }));
    try {
      const res = await axios.get(`${API_URL}/api/admin/course-plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoursePlans(res.data.plans);
    } catch (error) {
      toast.error("Error fetching course plans");
    } finally {
      setLoading(prev => ({ ...prev, plans: false }));
    }
  };

  const fetchBmiRecords = async (search = "") => {
    setLoading(prev => ({ ...prev, bmi: true }));
    try {
      const res = await axios.get(`${API_URL}/api/admin/bmi-records?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBmiRecords(res.data.records);
    } catch (error) {
      toast.error("Error fetching BMI records");
    } finally {
      setLoading(prev => ({ ...prev, bmi: false }));
    }
  };

  const fetchEnrollments = async (search = "") => {
    setLoading(prev => ({ ...prev, enrollments: true }));
    try {
      const res = await axios.get(`${API_URL}/api/admin/enrollments?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(res.data.enrollments);
    } catch (error) {
      toast.error("Error fetching course enrollments");
    } finally {
      setLoading(prev => ({ ...prev, enrollments: false }));
    }
  };

  // Trigger fetches on tab active
  useEffect(() => {
    if (!token) return;

    if (activeTab === "dashboard") {
      fetchDashboardStats();
    } else if (activeTab === "users") {
      fetchUsers(userSearch);
    } else if (activeTab === "courses") {
      fetchCourses();
    } else if (activeTab === "plans") {
      fetchPlans();
    } else if (activeTab === "bmi") {
      fetchBmiRecords(bmiSearch);
    } else if (activeTab === "enrollments") {
      fetchEnrollments(enrollmentSearch);
      fetchUsers(); // for dropdown selector in add enrollment
      fetchCourses(); // for dropdown selector in add enrollment
    } else if (activeTab === "profile" && user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        password: "",
      });
    }
  }, [activeTab, token]);

  // Handle Search Input changes
  useEffect(() => {
    if (activeTab === "users") {
      const delayDebounce = setTimeout(() => fetchUsers(userSearch), 400);
      return () => clearTimeout(delayDebounce);
    }
  }, [userSearch]);

  useEffect(() => {
    if (activeTab === "bmi") {
      const delayDebounce = setTimeout(() => fetchBmiRecords(bmiSearch), 400);
      return () => clearTimeout(delayDebounce);
    }
  }, [bmiSearch]);

  useEffect(() => {
    if (activeTab === "enrollments") {
      const delayDebounce = setTimeout(() => fetchEnrollments(enrollmentSearch), 400);
      return () => clearTimeout(delayDebounce);
    }
  }, [enrollmentSearch]);

  // Operations - User Block/Unblock
  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/users/${id}/status`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers(userSearch);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    }
  };

  // Operations - User Delete
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user? This will also delete their enrollments and BMI records.")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers(userSearch);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const saveUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/api/admin/users`, userForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setModals(prev => ({ ...prev, user: false }));
        fetchUsers(userSearch);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to register client");
    }
  };

  // Operations - Course CRUD
  const saveCourse = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingItem) {
        res = await axios.put(`${API_URL}/api/admin/courses/${editingItem._id}`, courseForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_URL}/api/admin/courses`, courseForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        toast.success(res.data.message);
        setModals({ ...modals, course: false });
        setEditingItem(null);
        fetchCourses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save course");
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course? This will also remove related user enrollments.")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/admin/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchCourses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete course");
    }
  };

  const toggleCourseStatus = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/courses/${id}/status`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchCourses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update course status");
    }
  };

  // Operations - Course Plans CRUD
  const savePlan = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingItem) {
        res = await axios.put(`${API_URL}/api/admin/course-plans/${editingItem._id}`, planForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${API_URL}/api/admin/course-plans`, planForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (res.data.success) {
        toast.success(res.data.message);
        setModals({ ...modals, plan: false });
        setEditingItem(null);
        fetchPlans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save course plan");
    }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course plan?")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/admin/course-plans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchPlans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete plan");
    }
  };

  const togglePlanStatus = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/course-plans/${id}/status`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchPlans();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update plan status");
    }
  };

  const addPlanFeature = () => {
    if (!planForm.featureInput.trim()) return;
    setPlanForm(prev => ({
      ...prev,
      features: [...prev.features, prev.featureInput.trim()],
      featureInput: ""
    }));
  };

  const removePlanFeature = (indexToRemove) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Operations - BMI Delete
  const deleteBmiRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this BMI record?")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/admin/bmi-records/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchBmiRecords(bmiSearch);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete record");
    }
  };

  // Operations - Enrollments
  const saveEnrollment = async (e) => {
    e.preventDefault();
    if (!enrollmentForm.userId || !enrollmentForm.courseId) {
      toast.error("Please select a User and a Course");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/admin/enrollments`, enrollmentForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setModals({ ...modals, enrollment: false });
        fetchEnrollments(enrollmentSearch);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to enroll user");
    }
  };

  const updateEnrollmentStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/api/admin/enrollments/${id}`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchEnrollments(enrollmentSearch);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update enrollment");
    }
  };

  const deleteEnrollment = async (id) => {
    if (!window.confirm("Are you sure you want to delete/cancel this enrollment?")) return;
    try {
      const res = await axios.delete(`${API_URL}/api/admin/enrollments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchEnrollments(enrollmentSearch);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete enrollment");
    }
  };

  // Operations - Profile Save
  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/api/admin/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Admin profile updated successfully!");
        setProfileForm(prev => ({ ...prev, password: "" }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // Helper colors for pie chart
  const COLORS = ["#0095ff", "#f15a24", "#8854d0", "#2ecc71", "#34495e"];

  // Open modals helper
  const openCourseModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setCourseForm({
        title: item.title,
        description: item.description,
        duration: item.duration || "6 Weeks",
        intensity: item.intensity || "Medium",
        coach: item.coach || "Coach Marcus",
        slots: item.slots || 10,
        price: item.price || 0,
      });
    } else {
      setEditingItem(null);
      setCourseForm({
        title: "",
        description: "",
        duration: "6 Weeks",
        intensity: "Medium",
        coach: "Coach Marcus",
        slots: 10,
        price: 0,
      });
    }
    setModals(prev => ({ ...prev, course: true }));
  };

  const openPlanModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setPlanForm({
        name: item.name,
        displayName: item.displayName,
        price: item.price,
        duration: item.duration,
        features: item.features || [],
        featureInput: "",
      });
    } else {
      setEditingItem(null);
      setPlanForm({
        name: "",
        displayName: "",
        price: 0,
        duration: 3,
        features: [],
        featureInput: "",
      });
    }
    setModals(prev => ({ ...prev, plan: true }));
  };

  const openEnrollmentModal = () => {
    setEnrollmentForm({
      userId: "",
      courseId: "",
      status: "active",
    });
    setModals(prev => ({ ...prev, enrollment: true }));
  };

  const openUserModal = () => {
    setUserForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      membershipType: "basic",
    });
    setModals(prev => ({ ...prev, user: true }));
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/admin/login");
  };

  if (authLoading) {
    return (
      <div className="admin-loader-container">
        <div className="admin-spinner"></div>
        <p>Verifying admin permissions...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar Section */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <Dumbbell className="admin-logo-icon" size={26} />
          <h2>ADMIN CONSOLE</h2>
        </div>

        <nav>
          <ul className="admin-nav-list">
            <li>
              <button
                className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
              >
                <TrendingUp size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
                onClick={() => { setActiveTab("users"); setIsSidebarOpen(false); }}
              >
                <Users size={18} />
                <span>Users List</span>
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-item ${activeTab === "courses" ? "active" : ""}`}
                onClick={() => { setActiveTab("courses"); setIsSidebarOpen(false); }}
              >
                <BookOpen size={18} />
                <span>Courses</span>
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-item ${activeTab === "plans" ? "active" : ""}`}
                onClick={() => { setActiveTab("plans"); setIsSidebarOpen(false); }}
              >
                <Award size={18} />
                <span>Course Plans</span>
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-item ${activeTab === "bmi" ? "active" : ""}`}
                onClick={() => { setActiveTab("bmi"); setIsSidebarOpen(false); }}
              >
                <Heart size={18} />
                <span>BMI Records</span>
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-item ${activeTab === "enrollments" ? "active" : ""}`}
                onClick={() => { setActiveTab("enrollments"); setIsSidebarOpen(false); }}
              >
                <Clipboard size={18} />
                <span>Enrollments</span>
              </button>
            </li>
            <li>
              <button
                className={`admin-nav-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => { setActiveTab("profile"); setIsSidebarOpen(false); }}
              >
                <Settings size={18} />
                <span>Admin Profile</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={handleLogoutClick} style={{ color: "var(--admin-danger)" }}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="admin-sidebar-toggle-btn"
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                padding: "4px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Menu size={24} />
            </button>
            <div className="admin-welcome">
              <h1>Dream Physique Gym</h1>
              <p>Admin Workspace Portal</p>
            </div>
          </div>
          <div className="admin-user-profile">
            <Link to="/" className="admin-btn admin-btn-secondary" style={{ textDecoration: "none" }}>
              Back to Home
            </Link>
            <div className="admin-avatar">AD</div>
            <div className="admin-profile-info">
              <span>{user?.name || "Administrator"}</span>
              <small>System Admin</small>
            </div>
          </div>
        </header>

        {/* 1. Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="admin-tab-content">
            {loading.stats ? (
              <div className="admin-loader-container">
                <div className="admin-spinner"></div>
                <p>Analyzing dashboard statistics...</p>
              </div>
            ) : (
              <>
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrapper blue">
                      <Users size={24} />
                    </div>
                    <div className="admin-stat-details">
                      <h3>{stats?.totalUsers || 0}</h3>
                      <p>Total Registered Users</p>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrapper purple">
                      <BookOpen size={24} />
                    </div>
                    <div className="admin-stat-details">
                      <h3>{stats?.totalCourses || 0}</h3>
                      <p>Total Active Courses</p>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrapper orange">
                      <Heart size={24} />
                    </div>
                    <div className="admin-stat-details">
                      <h3>{stats?.totalBmiRecords || 0}</h3>
                      <p>BMI Records Checked</p>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrapper green">
                      <Clipboard size={24} />
                    </div>
                    <div className="admin-stat-details">
                      <h3>{stats?.totalEnrollments || 0}</h3>
                      <p>Total Enrollments</p>
                    </div>
                  </div>
                </div>

                <div className="admin-charts-row">
                  <div className="admin-chart-card">
                    <h3>Recent User Signups Growth</h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" />
                          <YAxis stroke="rgba(255,255,255,0.4)" />
                          <Tooltip contentStyle={{ backgroundColor: "#11141e", border: "1px solid var(--admin-card-border)", color: "#fff" }} />
                          <Bar dataKey="users" fill="#0095ff" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <h3>Membership Tiers</h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={membershipDist}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {membershipDist.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "#11141e", border: "1px solid var(--admin-card-border)", color: "#fff" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. Users Tab */}
        {activeTab === "users" && (
          <div className="admin-section-card">
            <div className="admin-card-header">
              <h2>User Directory</h2>
              <div className="admin-card-actions">
                <div className="admin-search-wrapper" style={{ marginRight: "10px" }}>
                  <Search className="admin-search-icon" size={16} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by name, email or phone"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <button className="admin-btn admin-btn-primary" onClick={openUserModal}>
                  <Plus size={16} />
                  Add Client
                </button>
              </div>
            </div>

            {loading.users ? (
              <div className="admin-loader-container">
                <div className="admin-spinner"></div>
                <p>Retrieving user profiles...</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Tier</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 600 }}>{u.name} {u.role === "admin" && <span style={{ color: "var(--admin-accent-orange)", fontSize: "0.75rem" }}>(Admin)</span>}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || "—"}</td>
                        <td>
                          <span className={`admin-badge info`}>
                            {u.membershipType}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${u.isActive ? "success" : "danger"}`}>
                            {u.isActive ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u.role !== "admin" && (
                            <>
                              <button
                                className={`admin-action-btn ${u.isActive ? "toggle-off" : "toggle-on"}`}
                                onClick={() => toggleUserStatus(u._id, u.isActive)}
                                title={u.isActive ? "Block User" : "Unblock User"}
                              >
                                {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                              </button>
                              <button
                                className="admin-action-btn delete"
                                onClick={() => deleteUser(u._id)}
                                title="Delete User"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No users found matching search criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. Courses Tab */}
        {activeTab === "courses" && (
          <div className="admin-section-card">
            <div className="admin-card-header">
              <h2>Gym Courses & Bootcamps</h2>
              <button className="admin-btn admin-btn-primary" onClick={() => openCourseModal()}>
                <Plus size={16} />
                Add Course
              </button>
            </div>

            {loading.courses ? (
              <div className="admin-loader-container">
                <div className="admin-spinner"></div>
                <p>Loading course modules...</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Coach</th>
                      <th>Duration</th>
                      <th>Intensity</th>
                      <th>Max Spots</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 600 }}>{c.title}</td>
                        <td>{c.coach}</td>
                        <td>{c.duration}</td>
                        <td>
                          <span className="admin-badge info">{c.intensity}</span>
                        </td>
                        <td>{c.slots} spots</td>
                        <td>
                          <span className={`admin-badge ${c.isActive ? "success" : "danger"}`}>
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`admin-action-btn ${c.isActive ? "toggle-off" : "toggle-on"}`}
                            onClick={() => toggleCourseStatus(c._id, c.isActive)}
                            title={c.isActive ? "Deactivate" : "Activate"}
                          >
                            {c.isActive ? <XCircle size={15} /> : <CheckCircle size={15} />}
                          </button>
                          <button
                            className="admin-action-btn edit"
                            onClick={() => openCourseModal(c)}
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => deleteCourse(c._id)}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No courses listed. Click Add Course to create one.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. Course Plans Tab */}
        {activeTab === "plans" && (
          <div className="admin-section-card">
            <div className="admin-card-header">
              <h2>Membership Plans & Pricing</h2>
              <button className="admin-btn admin-btn-primary" onClick={() => openPlanModal()}>
                <Plus size={16} />
                Add New Plan
              </button>
            </div>

            {loading.plans ? (
              <div className="admin-loader-container">
                <div className="admin-spinner"></div>
                <p>Loading membership plans...</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Plan Key</th>
                      <th>Display Name</th>
                      <th>Price</th>
                      <th>Duration</th>
                      <th>Features Included</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coursePlans.map((p) => (
                      <tr key={p._id}>
                        <td style={{ fontWeight: 600, color: "var(--admin-accent-orange)" }}>{p.name}</td>
                        <td>{p.displayName}</td>
                        <td style={{ fontWeight: 600 }}>₹{p.price.toLocaleString("en-IN")}</td>
                        <td>{p.duration} Months</td>
                        <td style={{ maxWidth: "300px" }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {p.features?.slice(0, 3).map((f, i) => (
                              <span key={i} style={{ fontSize: "0.75rem", padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.03)" }}>{f}</span>
                            ))}
                            {p.features?.length > 3 && <span style={{ fontSize: "0.75rem", color: "var(--admin-accent-blue)" }}>+{p.features.length - 3} more</span>}
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge ${p.isActive ? "success" : "danger"}`}>
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`admin-action-btn ${p.isActive ? "toggle-off" : "toggle-on"}`}
                            onClick={() => togglePlanStatus(p._id, p.isActive)}
                            title={p.isActive ? "Deactivate" : "Activate"}
                          >
                            {p.isActive ? <XCircle size={15} /> : <CheckCircle size={15} />}
                          </button>
                          <button
                            className="admin-action-btn edit"
                            onClick={() => openPlanModal(p)}
                            title="Edit"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => deletePlan(p._id)}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coursePlans.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No course plans found. Click Add New Plan to seed one.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. BMI Records Tab */}
        {activeTab === "bmi" && (
          <div className="admin-section-card">
            <div className="admin-card-header">
              <h2>Client BMI Logs</h2>
              <div className="admin-card-actions">
                <div className="admin-search-wrapper">
                  <Search className="admin-search-icon" size={16} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by client name, email..."
                    value={bmiSearch}
                    onChange={(e) => setBmiSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {loading.bmi ? (
              <div className="admin-loader-container">
                <div className="admin-spinner"></div>
                <p>Retrieving client BMI records...</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Gender</th>
                      <th>Height</th>
                      <th>Weight</th>
                      <th>BMI Score</th>
                      <th>Category</th>
                      <th>Recorded Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bmiRecords.map((b) => (
                      <tr key={b._id}>
                        <td style={{ fontWeight: 600 }}>{b.name}</td>
                        <td>{b.email}</td>
                        <td>{b.gender}</td>
                        <td>{b.height} cm</td>
                        <td>{b.weight} kg</td>
                        <td style={{ fontWeight: 600, color: "var(--admin-accent-blue)" }}>{b.bmi}</td>
                        <td>
                          <span className={`admin-badge ${
                            b.result.toLowerCase() === "normal" ? "success" : 
                            b.result.toLowerCase() === "underweight" ? "info" : 
                            b.result.toLowerCase() === "overweight" ? "warning" : "danger"
                          }`}>
                            {b.result}
                          </span>
                        </td>
                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => deleteBmiRecord(b._id)}
                            title="Delete Log"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bmiRecords.length === 0 && (
                      <tr>
                        <td colSpan="9" style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No BMI records matched your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. Enrollments Tab */}
        {activeTab === "enrollments" && (
          <div className="admin-section-card">
            <div className="admin-card-header">
              <h2>Course Enrollments</h2>
              <div className="admin-card-actions">
                <div className="admin-search-wrapper" style={{ marginRight: "10px" }}>
                  <Search className="admin-search-icon" size={16} />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by client or course..."
                    value={enrollmentSearch}
                    onChange={(e) => setEnrollmentSearch(e.target.value)}
                  />
                </div>
                <button className="admin-btn admin-btn-primary" onClick={openEnrollmentModal}>
                  <Plus size={16} />
                  Enroll Client
                </button>
              </div>
            </div>

            {loading.enrollments ? (
              <div className="admin-loader-container">
                <div className="admin-spinner"></div>
                <p>Loading course enrollments...</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Client Email</th>
                      <th>Course Enrolled</th>
                      <th>Duration</th>
                      <th>Fee</th>
                      <th>Status</th>
                      <th>Enroll Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e._id}>
                        <td style={{ fontWeight: 600 }}>{e.userId?.name || "Deleted User"}</td>
                        <td>{e.userId?.email || "—"}</td>
                        <td>{e.courseId?.title || "Deleted Course"}</td>
                        <td>{e.courseId?.duration || "—"}</td>
                        <td style={{ fontWeight: 600 }}>₹{(e.courseId?.price || 0).toLocaleString("en-IN")}</td>
                        <td>
                          <span className={`admin-badge ${
                            e.status === "active" ? "success" : 
                            e.status === "pending" ? "warning" : 
                            e.status === "completed" ? "info" : "danger"
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td>{new Date(e.enrollmentDate).toLocaleDateString()}</td>
                        <td>
                          {e.status === "pending" && (
                            <button
                              className="admin-action-btn toggle-on"
                              onClick={() => updateEnrollmentStatus(e._id, "active")}
                              title="Approve Enrollment"
                            >
                              <CheckCircle size={15} />
                            </button>
                          )}
                          {e.status === "active" && (
                            <button
                              className="admin-action-btn edit"
                              onClick={() => updateEnrollmentStatus(e._id, "completed")}
                              title="Mark Completed"
                            >
                              <Award size={15} />
                            </button>
                          )}
                          {e.status !== "cancelled" && (
                            <button
                              className="admin-action-btn toggle-off"
                              onClick={() => updateEnrollmentStatus(e._id, "cancelled")}
                              title="Cancel Enrollment"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                          <button
                            className="admin-action-btn delete"
                            onClick={() => deleteEnrollment(e._id)}
                            title="Delete Record"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {enrollments.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No enrollments logged. Click Enroll Client to add one.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 7. Admin Profile Tab */}
        {activeTab === "profile" && (
          <div className="admin-section-card">
            <h2>System Profile & Settings</h2>
            <p style={{ color: "var(--admin-text-muted)", marginBottom: "25px", fontSize: "0.9rem" }}>Update administrative contact details and system credentials.</p>

            <form onSubmit={saveProfile} className="admin-profile-grid">
              <div className="profile-details-column">
                <div className="admin-form-group">
                  <label>Administrator Name</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Contact Phone Number</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Office Address</label>
                  <textarea
                    rows="3"
                    className="admin-form-control"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="profile-security-column">
                <div className="admin-form-group">
                  <label>System Email Address</label>
                  <input
                    type="email"
                    className="admin-form-control"
                    value={user?.email || "admin@gym.com"}
                    disabled
                    style={{ opacity: 0.6, cursor: "not-allowed" }}
                  />
                  <small style={{ color: "var(--admin-text-muted)", display: "block", marginTop: "5px" }}>Email username cannot be changed for safety.</small>
                </div>

                <div className="admin-form-group">
                  <label>Change Security Password</label>
                  <input
                    type="password"
                    className="admin-form-control"
                    placeholder="Enter new admin password"
                    value={profileForm.password}
                    onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  />
                  <small style={{ color: "var(--admin-text-muted)", display: "block", marginTop: "5px" }}>Leave blank to retain current password.</small>
                </div>

                <div className="admin-form-actions" style={{ marginTop: "35px" }}>
                  <button type="submit" className="admin-btn admin-btn-accent">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL OVERLAYS */}

      {/* A. Course Save Modal */}
      {modals.course && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>{editingItem ? "Edit Course Module" : "Create Gym Course"}</h3>
              <button className="admin-modal-close" onClick={() => setModals({ ...modals, course: false })}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={saveCourse}>
              <div className="admin-form-group">
                <label>Course Title</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  className="admin-form-control"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. 6 Weeks"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Intensity</label>
                  <select
                    className="admin-form-control"
                    value={courseForm.intensity}
                    onChange={(e) => setCourseForm({ ...courseForm, intensity: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Extreme">Extreme</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Coach / Trainer</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={courseForm.coach}
                    onChange={(e) => setCourseForm({ ...courseForm, coach: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Course Price (INR)</label>
                  <input
                    type="number"
                    className="admin-form-control"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Slots Available</label>
                <input
                  type="number"
                  className="admin-form-control"
                  value={courseForm.slots}
                  onChange={(e) => setCourseForm({ ...courseForm, slots: Number(e.target.value) })}
                />
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModals({ ...modals, course: false })}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingItem ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Course Plan Save Modal */}
      {modals.plan && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>{editingItem ? "Edit Membership Plan" : "Create Membership Plan"}</h3>
              <button className="admin-modal-close" onClick={() => setModals({ ...modals, plan: false })}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={savePlan}>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Plan Identifier (Key)</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. YEARLY"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                    disabled={!!editingItem}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Display Title</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. Yearly VIP Pass"
                    value={planForm.displayName}
                    onChange={(e) => setPlanForm({ ...planForm, displayName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price (INR)</label>
                  <input
                    type="number"
                    className="admin-form-control"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Duration (Months)</label>
                  <input
                    type="number"
                    className="admin-form-control"
                    value={planForm.duration}
                    onChange={(e) => setPlanForm({ ...planForm, duration: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Add Features List</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    className="admin-form-control"
                    placeholder="e.g. Access to recovery steam room"
                    value={planForm.featureInput}
                    onChange={(e) => setPlanForm({ ...planForm, featureInput: e.target.value })}
                  />
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={addPlanFeature}>
                    Add
                  </button>
                </div>

                <div className="admin-tags-list">
                  {planForm.features.map((feature, index) => (
                    <span key={index} className="admin-tag">
                      {feature}
                      <button type="button" onClick={() => removePlanFeature(index)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModals({ ...modals, plan: false })}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingItem ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C. Add Enrollment Modal */}
      {modals.enrollment && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>Enroll Client in Course</h3>
              <button className="admin-modal-close" onClick={() => setModals({ ...modals, enrollment: false })}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={saveEnrollment}>
              <div className="admin-form-group">
                <label>Select Gym Client</label>
                <select
                  className="admin-form-control"
                  value={enrollmentForm.userId}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, userId: e.target.value })}
                  required
                >
                  <option value="">-- Choose User --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Select Training Course</label>
                <select
                  className="admin-form-control"
                  value={enrollmentForm.courseId}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, courseId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Course --</option>
                  {courses.filter(c => c.isActive).map(c => (
                    <option key={c._id} value={c._id}>{c.title} - Coach {c.coach} (₹{c.price})</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Enrollment Status</label>
                <select
                  className="admin-form-control"
                  value={enrollmentForm.status}
                  onChange={(e) => setEnrollmentForm({ ...enrollmentForm, status: e.target.value })}
                >
                  <option value="pending">Pending Approval</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModals({ ...modals, enrollment: false })}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Enroll Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* D. Add Client Modal */}
      {modals.user && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h3>Register New Client</h3>
              <button className="admin-modal-close" onClick={() => setModals({ ...modals, user: false })}>
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={saveUser}>
              <div className="admin-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="admin-form-control"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="admin-form-control"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Membership Tier</label>
                  <select
                    className="admin-form-control"
                    value={userForm.membershipType}
                    onChange={(e) => setUserForm({ ...userForm, membershipType: e.target.value })}
                  >
                    <option value="basic">Basic Plan</option>
                    <option value="QUARTERLY">Quarterly Pack</option>
                    <option value="HALF_YEARLY">Half-Yearly Pack</option>
                    <option value="YEARLY">Yearly VIP Pass</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label>Address</label>
                <input
                  type="text"
                  className="admin-form-control"
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                />
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModals({ ...modals, user: false })}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
