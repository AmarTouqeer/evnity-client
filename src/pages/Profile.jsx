import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI, bookingAPI, userAPI } from "../services/api"
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Loader,
} from "lucide-react";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    role: "",
    avatar: "",
  });

  const [editData, setEditData] = useState({ ...userData });
  const avatarInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        address: user.address || "",
        role: user.role || "",
        avatar: user.avatar || "",
      };
      setUserData(initialData);
      setEditData(initialData);
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getAll();
        if (response.success) {
          const data = response.data;
          const bookingsList = Array.isArray(data)
            ? data
            : Array.isArray(data?.bookings)
              ? data.bookings
              : [];
          setBookings(bookingsList);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setBookings([]);
      }
    };
    if (user) fetchBookings();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await userAPI.updateProfile({
        name: editData.name,
        phone: editData.phone,
        city: editData.city,
        address: editData.address,
      });
      if (response.success) {
        const updatedUser = { ...user, ...editData };
        updateUser(updatedUser);
        setUserData(editData);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert(response.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setIsLoading(true);
    try {
      const response = await userAPI.uploadAvatar(formData);
      if (response.success) {
        const newAvatar = response.data.avatar;
        const updatedUser = { ...user, avatar: newAvatar };
        updateUser(updatedUser);
        setUserData((prev) => ({ ...prev, avatar: newAvatar }));
        setEditData((prev) => ({ ...prev, avatar: newAvatar }));
      } else {
        alert(response.message || "Failed to upload avatar.");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar.");
    } finally {
      setIsLoading(false);
    }
  };

  const cities = [
    "Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala",
    "Peshawar", "Multan", "Hyderabad", "Islamabad", "Quetta",
  ];

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = "Password must contain uppercase, lowercase, and number";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        alert("Password updated successfully!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordErrors({});
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert(error.message || "Failed to update password. Please check your current password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* ── Redesigned Profile Header – flat card, no cover overlap ── */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 p-6 border-l-8 border-[#D7490C]">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-4 ring-[#D7490C]/20">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#B7410E] to-[#D7490C] flex items-center justify-center text-white text-3xl font-bold">
                    {userData.name ? userData.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current.click()}
                    disabled={isLoading}
                    className="absolute bottom-0 right-0 bg-[#D7490C] text-white p-1.5 rounded-full hover:bg-[#B7410E] transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Name + role + contact row */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {userData.name || "User Name"}
              </h1>
              <p className="text-sm text-[#D7490C] font-semibold capitalize mb-2">
                {userData.role || "customer"} Account
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-1">
                <span className="flex items-center text-sm text-gray-500">
                  <Mail className="w-4 h-4 mr-1 text-[#D7490C]" />
                  {userData.email || "No email"}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <Phone className="w-4 h-4 mr-1 text-[#D7490C]" />
                  {userData.phone || "No phone"}
                </span>
                <span className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1 text-[#D7490C]" />
                  {userData.city || "No city"}
                </span>
              </div>
            </div>

            {/* Edit / Save / Cancel */}
            <div className="flex-shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all text-sm font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === "profile"
                  ? "border-[#D7490C] text-[#D7490C]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                Profile Information
              </button>
              {userData.role === "customer" && (
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`py-4 border-b-2 font-medium transition-colors ${activeTab === "bookings"
                    ? "border-[#D7490C] text-[#D7490C]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                  My Bookings
                </button>
              )}
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === "security"
                  ? "border-[#D7490C] text-[#D7490C]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
              >
                Security
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={isEditing ? editData.name : userData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-[#D7490C] focus:border-transparent" : "bg-gray-50"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={isEditing ? editData.email : userData.email}
                      onChange={handleInputChange}
                      disabled={true}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      title="Email cannot be changed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={isEditing ? editData.phone : userData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-[#D7490C] focus:border-transparent" : "bg-gray-50"}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <select
                      name="city"
                      value={isEditing ? editData.city : userData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-[#D7490C] focus:border-transparent" : "bg-gray-50"}`}
                    >
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      name="address"
                      value={isEditing ? editData.address : userData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows="4"
                      placeholder="Enter your full address"
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg ${isEditing ? "focus:ring-2 focus:ring-[#D7490C] focus:border-transparent" : "bg-gray-50"}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No bookings yet</p>
                    <p className="text-gray-400 mt-2">Your bookings will appear here once you make a reservation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking._id || booking.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 bg-orange-100 text-[#D7490C] rounded-full font-medium">
                                {booking.type || booking.bookingType}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${booking.status === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                  }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {booking.name || booking.itemName || "Booking"}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(booking.date || booking.bookingDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Total Amount</div>
                              <div className="text-xl font-bold text-[#D7490C]">
                                PKR {(booking.amount || booking.totalAmount || 0).toLocaleString()}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const type = (booking.type || booking.bookingType || "").toLowerCase();
                                const eventId = booking.event?._id || booking.event;
                                const serviceId = booking.service?._id || booking.service;
                                const resourceId = booking.resource?._id || booking.resource;
                                if (type.includes("event") && eventId) navigate(`/events/${eventId}`);
                                else if (type.includes("service") && serviceId) navigate(`/services/${serviceId}`);
                                else if (type.includes("resource") && resourceId) navigate(`/resources/${resourceId}`);
                                else navigate(`/bookings/${booking._id}`);
                              }}
                              className="px-4 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent ${passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Enter current password"
                        />
                        {passwordErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent ${passwordErrors.newPassword ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Enter new password"
                        />
                        {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>}
                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters with uppercase, lowercase, and number</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent ${passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                          placeholder="Confirm new password"
                        />
                        {passwordErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>}
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <><Loader className="w-4 h-4 animate-spin" />Updating...</>
                        ) : (
                          "Update Password"
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;