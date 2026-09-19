import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";

const AuthContext = createContext();

const getInitialToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    return token;
  } catch (error) {
    console.log("Error reading token from localStorage:", error);
    return null;
  }
};

const initialToken = getInitialToken();

const initialState = {
  user: null,
  token: initialToken,
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      try {
        localStorage.setItem("token", action.payload.token);
      } catch (err) {
        console.error("LocalStorage write error:", err);
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${action.payload.token}`;
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      try {
        localStorage.removeItem("token");
      } catch (err) {
        console.error("LocalStorage remove error:", err);
      }
      delete axios.defaults.headers.common["Authorization"];
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case "USER_LOADED":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case "AUTH_ERROR":
      try {
        localStorage.removeItem("token");
      } catch (err) {
        console.error("LocalStorage remove error:", err);
      }
      delete axios.defaults.headers.common["Authorization"];
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults whenever token in state changes
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [state.token]);

  // Load user on app start if token exists
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const currentToken = state.token || localStorage.getItem("token");
      if (currentToken) {
        try {
          const res = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${currentToken}` },
          });
          if (isMounted && res.data?.success && res.data?.user) {
            dispatch({
              type: "USER_LOADED",
              payload: res.data.user,
            });
          } else if (isMounted) {
            dispatch({ type: "AUTH_ERROR" });
          }
        } catch (error) {
          console.log("Auth verification error:", error.response?.data?.message || error.message);
          if (isMounted) {
            dispatch({ type: "AUTH_ERROR" });
          }
        }
      } else {
        if (isMounted) {
          dispatch({ type: "AUTH_ERROR" });
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const cleanEmail = String(email || "").trim().toLowerCase();
      const cleanPassword = String(password || "").trim();

      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (res.data?.token) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: res.data,
        });
        return { success: true, user: res.data.user };
      } else {
        return {
          success: false,
          message: res.data?.message || "Invalid server response",
        };
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 404
          ? "Auth endpoint not found (404). Please ensure the backend server is running on port 4000."
          : error.message?.includes("Network Error") || !error.response
          ? "Cannot connect to server. Please make sure the backend is running on port 4000."
          : error.message || "Login failed. Please check your credentials.");
      return {
        success: false,
        message: msg,
      };
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        ...userData,
        name: String(userData.name || "").trim(),
        email: String(userData.email || "").trim().toLowerCase(),
        password: String(userData.password || "").trim(),
        phone: userData.phone ? String(userData.phone).trim() : "",
        address: userData.address ? String(userData.address).trim() : "",
      };

      const res = await axios.post(`${API_URL}/api/auth/register`, payload);

      if (res.data?.token) {
        dispatch({
          type: "REGISTER_SUCCESS",
          payload: res.data,
        });
        return { success: true, user: res.data.user };
      } else {
        return {
          success: false,
          message: res.data?.message || "Registration failed",
        };
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (error.response?.status === 404
          ? "Auth endpoint not found (404). Please ensure the backend server is running on port 4000."
          : error.message?.includes("Network Error") || !error.response
          ? "Cannot connect to server. Please make sure the backend is running on port 4000."
          : error.message || "Registration failed. Please try again.");
      return {
        success: false,
        message: msg,
      };
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = async (profileData) => {
    try {
      const currentToken = state.token || localStorage.getItem("token");
      const res = await axios.put(`${API_URL}/api/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.data?.success && res.data?.user) {
        dispatch({
          type: "USER_LOADED",
          payload: res.data.user,
        });
        return { success: true };
      }
      return { success: false, message: res.data?.message || "Failed to update profile" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Profile update failed",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

