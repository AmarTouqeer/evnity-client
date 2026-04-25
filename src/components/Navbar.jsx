import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications, formatTime } from "../context/notification-context"
import {
  Menu,
  X,
  Calendar,
  User,
  LogIn,
  Bell,
  LogOut,
  Settings,
  LayoutDashboard,
  BookMarked,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

const Navbar = () => {
  const [isOpen,             setIsOpen]             = useState(false);
  const [showUserMenu,       setShowUserMenu]       = useState(false);
  const [showNotifications,  setShowNotifications]  = useState(false);

  const location      = useLocation();
  const userMenuRef   = useRef(null);
  const notifRef      = useRef(null);

  const { user, isAuthenticated, logout, getUserRole, getUserName } = useAuth();
  const isLoggedIn = isAuthenticated();
  const userType   = getUserRole();
  const userName   = getUserName();

  /* ── Pull everything from context ── */
  const {
    unreadCount,
    preview,
    previewLoading,
    fetchPreview,
    markAsRead,
  } = useNotifications();

  useEffect(() => {
    console.log("Navbar - Auth State:", { user, isLoggedIn, userType, userName });
  }, [user, isLoggedIn, userType, userName]);

  const isActive = (path) => location.pathname === path;

  /* ── Open/close bell dropdown ── */
  const handleToggleNotifications = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    setShowUserMenu(false);
    if (opening) fetchPreview(); // always fresh when the user opens the panel
  };

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigation = [
    { name: "Home",      href: "/" },
    { name: "Events",    href: "/events" },
    { name: "Services",  href: "/services" },
    { name: "Resources", href: "/resources" },
  ];

  /* ── Reusable nav link class ── */
  const navLinkClass = (href) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive(href)
        ? "bg-orange-100 text-[#D7490C]"
        : "text-gray-700 hover:text-[#D7490C] hover:bg-orange-50"
    }`;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-lg flex items-center justify-center mr-2">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#B7410E] to-[#D7490C] bg-clip-text text-transparent">
                Evnity
              </span>
            </Link>
          </div>

          {/* ── Desktop nav links ── */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map(({ name, href }) => (
                <Link key={name} to={href} className={navLinkClass(href)}>
                  {name}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Desktop right-side actions ── */}
          <div className="hidden md:flex items-center space-x-3 ml-4">
            {isLoggedIn ? (
              <>
                {/* Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleToggleNotifications}
                    className="p-2 text-gray-700 hover:text-[#D7490C] hover:bg-orange-50 rounded-lg transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      {/* Header */}
                      <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>

                      {/* List */}
                      <div className="max-h-96 overflow-y-auto">
                        {previewLoading ? (
                          <p className="px-4 py-6 text-center text-sm text-gray-500">
                            Loading…
                          </p>
                        ) : preview.length === 0 ? (
                          <p className="px-4 py-6 text-center text-sm text-gray-500">
                            No notifications yet
                          </p>
                        ) : (
                          preview.map((n) => (
                            <div
                              key={n._id}
                              className={`flex items-start gap-2 px-4 py-3 hover:bg-gray-50 transition-colors ${
                                !n.isRead ? "bg-orange-50" : ""
                              }`}
                            >
                              <Link
                                to="/notifications"
                                className="flex-1 min-w-0"
                                onClick={() => setShowNotifications(false)}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-semibold text-sm text-gray-900 truncate pr-2">
                                    {n.title}
                                  </span>
                                  {!n.isRead && (
                                    <span className="h-2 w-2 bg-[#D7490C] rounded-full flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {n.message}
                                </p>
                                <span className="text-xs text-gray-400 mt-1 block">
                                  {formatTime(n.createdAt)}
                                </span>
                              </Link>

                              {/* Inline mark-as-read */}
                              {!n.isRead && (
                                <button
                                  onClick={() => markAsRead(n._id)}
                                  title="Mark as read"
                                  className="flex-shrink-0 mt-0.5 p-1 text-gray-400 hover:text-[#D7490C] hover:bg-orange-50 rounded transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 text-center text-sm text-[#D7490C] font-semibold hover:bg-gray-50 border-t border-gray-200"
                        onClick={() => setShowNotifications(false)}
                      >
                        View All Notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-[#D7490C] hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <div className="h-8 w-8 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white font-bold">
                      {userName.charAt(0)}
                    </div>
                    <span className="font-medium">{userName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="font-semibold text-gray-900">{userName}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {userType} Account
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>

                      {userType === "customer" && (
                        <Link
                          to="/bookings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <BookMarked className="h-4 w-4 mr-3" />
                          My Bookings
                        </Link>
                      )}

                      {userType === "provider" && (
                        <Link
                          to="/provider/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3" />
                          Provider Dashboard
                        </Link>
                      )}

                      {userType === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard className="h-4 w-4 mr-3" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#B7410E] to-[#D7490C] hover:from-[#D7490C] hover:to-[#B7410E] transition-all duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#D7490C] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#D7490C] transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map(({ name, href }) => (
              <Link
                key={name}
                to={href}
                className={`block ${navLinkClass(href)} text-base`}
                onClick={() => setIsOpen(false)}
              >
                {name}
              </Link>
            ))}

            <div className="border-t border-gray-200 pt-4 pb-3">
              {isLoggedIn ? (
                <div className="flex flex-col space-y-3">
                  {/* Avatar row */}
                  <div className="px-3 py-2 flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white font-bold">
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{userName}</p>
                      <p className="text-sm text-gray-600 capitalize">{userType}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" /> My Profile
                  </Link>

                  {userType === "customer" && (
                    <Link
                      to="/bookings"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <BookMarked className="h-5 w-5 mr-3" /> My Bookings
                    </Link>
                  )}

                  {/* Notifications with live badge */}
                  <Link
                    to="/notifications"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Bell className="h-5 w-5 mr-3" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>

                  {userType === "provider" && (
                    <Link
                      to="/provider/dashboard"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5 mr-3" /> Provider Dashboard
                    </Link>
                  )}

                  {userType === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5 mr-3" /> Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/complaints"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <AlertCircle className="h-5 w-5 mr-3" /> Complaints
                  </Link>

                  <button
                    onClick={() => { setIsOpen(false); logout(); }}
                    className="flex items-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-2" /> Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-[#B7410E] to-[#D7490C] hover:from-[#D7490C] hover:to-[#B7410E] transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" /> Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;