import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ─────────────────────────────────────────
  // Hydrate from localStorage
  // ─────────────────────────────────────────
  useEffect(() => {
    console.log("🔵 [AuthContext] Hydrating from localStorage...");
    const storedToken = localStorage.getItem("token");
    const storedUser  = localStorage.getItem("user");

    console.log("🔵 [AuthContext] Found in localStorage:", {
      hasToken: !!storedToken,
      hasUser: !!storedUser,
      tokenPreview: storedToken ? storedToken.slice(0, 30) + "..." : null,
    });

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log("🟢 [AuthContext] Hydrated successfully. User role:", parsedUser?.role);
      } catch (error) {
        console.error("🔴 [AuthContext] Error parsing stored user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else {
      console.log("🟡 [AuthContext] No stored auth — user is logged out");
    }
    setLoading(false);
    console.log("🔵 [AuthContext] Loading set to FALSE");
  }, []);

  // ─────────────────────────────────────────
  // Sync axios auth header with the token
  // ─────────────────────────────────────────
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("🟢 [AuthContext] Axios Authorization header SET:", `Bearer ${token.slice(0, 20)}...`);
      console.log("🔵 [AuthContext] Axios baseURL:", axios.defaults.baseURL || "(none — using relative URLs)");
    } else {
      delete axios.defaults.headers.common["Authorization"];
      console.log("🟡 [AuthContext] Axios Authorization header CLEARED");
    }
  }, [token]);

  // ─────────────────────────────────────────
  // 401 interceptor — force logout on expired/invalid tokens
  // ─────────────────────────────────────────
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        const url    = error?.config?.url;
        console.error(`🔴 [Axios Interceptor] ${status ?? "network"} on ${url}:`, error?.response?.data);

        if (status === 401 && token) {
          console.warn("🟡 [Axios Interceptor] 401 received — clearing auth and redirecting to login");
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [token, navigate]);

  const login = (userData, userToken) => {
    console.log("🟢 [AuthContext] Login called for user:", userData?.email, "role:", userData?.role);
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    console.log("🟡 [AuthContext] Logout called");
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const isAuthenticated = () => !!token && !!user;
  const getUserRole     = () => user?.role || null;
  const getUserName     = () => user?.name || "";

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated,
    getUserRole,
    getUserName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;