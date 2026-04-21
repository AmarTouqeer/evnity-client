import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Get auth state from context
  const { user, isAuthenticated, logout, getUserRole, getUserName } = useAuth();
  const isLoggedIn = isAuthenticated();
  const userType = getUserRole();
  const userName = getUserName();

  // Debug: Log auth state changes
  useEffect(() => {
    console.log("Navbar - Auth State:", {
      user,
      isLoggedIn,
      userType,
      userName,
    });
  }, [user, isLoggedIn, userType, userName]);

  const isActive = (path) => location.pathname === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sample notifications
  const notifications = [
    {
      id: 1,
      type: "booking",
      title: "Booking Confirmed",
      message: "Your booking for Grand Wedding Hall has been confirmed",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Verified",
      message: "Your payment receipt has been verified",
      time: "5 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "message",
      title: "New Message",
      message: "Elite Events sent you a message",
      time: "1 day ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const navigation = [
    { name: "Home", href: "/", icon: Calendar },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Services", href: "/services", icon: User },
    { name: "Resources", href: "/resources", icon: Calendar },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive(item.href)
                      ? "bg-orange-100 text-[#D7490C]"
                      : "text-gray-700 hover:text-[#D7490C] hover:bg-orange-50"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth / User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-3">
              {isLoggedIn ? (
                <>
                  {/* Notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        setShowUserMenu(false);
                      }}
                      className="p-2 text-gray-700 hover:text-[#D7490C] hover:bg-orange-50 rounded-lg transition-colors relative"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900">
                            Notifications
                          </h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              to="/notifications"
                              className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${notification.unread ? "bg-blue-50" : ""
                                }`}
                              onClick={() => setShowNotifications(false)}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm text-gray-900">
                                  {notification.title}
                                </span>
                                {notification.unread && (
                                  <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                {notification.message}
                              </p>
                              <span className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </span>
                            </Link>
                          ))}
                        </div>
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

                  {/* User Menu */}
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

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="font-semibold text-gray-900">
                            {userName}
                          </p>
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

                        {/* <Link
                          to="/complaints"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <AlertCircle className="h-4 w-4 mr-3" />
                          Complaints
                        </Link> */}

                        {/* <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Settings
                        </Link> */}

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
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#D7490C] hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#D7490C] transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive(item.href)
                    ? "bg-orange-100 text-[#D7490C]"
                    : "text-gray-700 hover:text-[#D7490C] hover:bg-orange-50"
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4 pb-3">
              {isLoggedIn ? (
                <div className="flex flex-col space-y-3">
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white font-bold">
                        {userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {userName}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {userType}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-5 w-5 mr-3" />
                    My Profile
                  </Link>

                  <Link
                    to="/bookings"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookMarked className="h-5 w-5 mr-3" />
                    My Bookings
                  </Link>

                  <Link
                    to="/notifications"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Bell className="h-5 w-5 mr-3" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  {userType === "provider" && (
                    <Link
                      to="/provider/dashboard"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5 mr-3" />
                      Provider Dashboard
                    </Link>
                  )}

                  {userType === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5 mr-3" />
                      Admin Dashboard
                    </Link>
                  )}

                  <Link
                    to="/complaints"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-orange-50 hover:text-[#D7490C] rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <AlertCircle className="h-5 w-5 mr-3" />
                    Complaints
                  </Link>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="flex items-center px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-base font-medium text-white bg-gradient-to-r from-[#B7410E] to-[#D7490C] hover:from-[#D7490C] hover:to-[#B7410E] transition-all duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign Up
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
