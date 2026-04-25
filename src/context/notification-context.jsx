import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

/* ─────────────────────────────────────────────
   Context + hook
───────────────────────────────────────────── */
const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
};

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const POLL_INTERVAL_MS = 60_000;

export const formatTime = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "Just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const TYPE_CATEGORY = {
  booking_created:          "booking",
  booking_accepted:         "booking",
  booking_rejected:         "booking",
  booking_confirmed:        "booking",
  booking_cancelled:        "booking",
  booking_completed:        "booking",
  resource_return_reminder: "booking",
  payment_received:         "payment",
  payment_confirmed:        "payment",
  payment_failed:           "payment",
  stripe_connected:         "payment",
  stripe_disconnected:      "payment",
  review_received:          "review",
  admin_approval:           "admin",
  admin_rejection:          "admin",
  event_approved:           "admin",
  event_rejected:           "admin",
  resource_approved:        "admin",
  resource_rejected:        "admin",
  service_approved:         "admin",
  service_rejected:         "admin",
};

const FILTERS_BY_ROLE = {
  customer: [
    { key: "all",     label: "All" },
    { key: "unread",  label: "Unread" },
    { key: "booking", label: "Bookings" },
    { key: "payment", label: "Payments" },
    { key: "review",  label: "Reviews" },
  ],
  provider: [
    { key: "all",     label: "All" },
    { key: "unread",  label: "Unread" },
    { key: "booking", label: "Bookings" },
    { key: "payment", label: "Payments" },
    { key: "review",  label: "Reviews" },
    { key: "admin",   label: "Admin" },
  ],
  admin: [
    { key: "all",     label: "All" },
    { key: "unread",  label: "Unread" },
    { key: "admin",   label: "Admin" },
    { key: "booking", label: "Bookings" },
    { key: "payment", label: "Payments" },
  ],
};

/* ─────────────────────────────────────────────
   Core provider
───────────────────────────────────────────── */
export const NotificationProvider = ({ isLoggedIn, userRole, children }) => {
  const [notifications,  setNotifications]  = useState([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [totalCount,     setTotalCount]     = useState(0);
  const [filter,         setFilter]         = useState("all");
  const [preview,        setPreview]        = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const abortRef = useRef(null);

 

  /* ── Full paginated fetch ── */
  const fetchNotifications = useCallback(
    async (page = 1, silent = false) => {
     

      if (!isLoggedIn) {
       
        return;
      }

      console.log(" [fetchNotifications] Axios auth header at call time:",
        axios.defaults.headers.common["Authorization"]?.slice(0, 30) + "..." || " NOT SET");

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        if (!silent) setLoading(true);
        setError(null);

        const params = { page, limit: 20 };
        if (filter === "unread") params.isRead = false;

     

        const { data } = await axios.get("/api/notifications", {
          params,
          signal: abortRef.current.signal,
        });

       

        const payload = data?.data ?? data;

        const notifs = payload?.notifications ?? [];
     

        setNotifications(notifs);
        setUnreadCount(payload?.unreadCount ?? 0);
        setTotalPages(payload?.totalPages ?? 1);
        setCurrentPage(payload?.currentPage ?? 1);
        setTotalCount(payload?.total ?? 0);
      } catch (err) {
        if (axios.isCancel(err) || err?.name === "CanceledError") {
          
          return;
        }

        const status  = err?.response?.status;
        const message = err?.response?.data?.message ?? err.message;
        

        if (!silent) {
          setError(
            status === 401
              ? "Session expired. Please log in again."
              : "Failed to load notifications. Please try again."
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoggedIn, filter]
  );

  /* ── Lightweight unread-count poll ── */
  const refreshUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const { data } = await axios.get("/api/notifications/unread-count");
      const payload = data?.data ?? data;
      setUnreadCount(payload?.unreadCount ?? 0);
    } catch (err) {
   
    }
  }, [isLoggedIn]);

  /* ── Navbar preview ── */
  const fetchPreview = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setPreviewLoading(true);
      const { data } = await axios.get("/api/notifications", {
        params: { page: 1, limit: 5 },
      });
      const payload = data?.data ?? data;
      setPreview(payload?.notifications ?? []);
      setUnreadCount(payload?.unreadCount ?? 0);
    } catch (err) {
      
    } finally {
      setPreviewLoading(false);
    }
  }, [isLoggedIn]);

  /* ── Initial fetch ── */
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications(1);
    }
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchNotifications, isLoggedIn]);

  /* ── Poll unread count ── */
  useEffect(() => {
    if (!isLoggedIn) return;
    const id = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isLoggedIn, refreshUnreadCount]);

  /* ── Reset on logout ── */
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setPreview([]);
      setUnreadCount(0);
      setCurrentPage(1);
      setTotalPages(1);
      setFilter("all");
      setError(null);
    }
  }, [isLoggedIn]);

  /* ── Mutations ── */
  const markAsRead = useCallback(
    async (id) => {
      const patch = (list) =>
        list.map((n) => (n._id === id ? { ...n, isRead: true } : n));
      setNotifications(patch);
      setPreview(patch);
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await axios.put(`/api/notifications/${id}/read`);
      } catch (err) {
        fetchNotifications(currentPage, true);
      }
    },
    [currentPage, fetchNotifications]
  );

  const markAllAsRead = useCallback(async () => {
    const readAll = (list) => list.map((n) => ({ ...n, isRead: true }));
    setNotifications(readAll);
    setPreview(readAll);
    setUnreadCount(0);
    try {
      await axios.put("/api/notifications/read-all");
    } catch (err) {
      fetchNotifications(currentPage, true);
    }
  }, [currentPage, fetchNotifications]);

  const deleteNotification = useCallback(
    async (id) => {
      const deleted = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setPreview((prev)        => prev.filter((n) => n._id !== id));
      if (deleted && !deleted.isRead) setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await axios.delete(`/api/notifications/${id}`);
      } catch (err) {
        fetchNotifications(currentPage, true);
      }
    },
    [notifications, currentPage, fetchNotifications]
  );

  /* ── Derived ── */
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all" || filter === "unread") return true;
    return (TYPE_CATEGORY[n.type] ?? "general") === filter;
  });

  const filters = FILTERS_BY_ROLE[userRole] ?? FILTERS_BY_ROLE.customer;

  console.log(" [NotificationProvider] Current state:", {
    notificationsCount: notifications.length,
    filteredCount: filteredNotifications.length,
    unreadCount,
    filter,
    loading,
    error,
  });

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        filteredNotifications,
        unreadCount,
        loading,
        error,
        currentPage,
        totalPages,
        totalCount,
        preview,
        previewLoading,
        fetchPreview,
        filter,
        setFilter,
        filters,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/* ─────────────────────────────────────────────
   AuthAwareNotificationProvider
───────────────────────────────────────────── */
export const AuthAwareNotificationProvider = ({ children }) => {
  const { isAuthenticated, getUserRole, loading } = useAuth();

  const isLoggedIn = !loading && isAuthenticated();
  const userRole   = !loading ? getUserRole() : null;

  console.log("🔷 [AuthAwareNotificationProvider] Render:", {
    authLoading: loading,
    isAuthenticated: isAuthenticated(),
    role: getUserRole(),
    willPassIsLoggedIn: isLoggedIn,
  });

  return (
    <NotificationProvider isLoggedIn={isLoggedIn} userRole={userRole}>
      {children}
    </NotificationProvider>
  );
};

export default NotificationContext;