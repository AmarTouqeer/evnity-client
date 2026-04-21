import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Check,
  X,
  LogOut,
} from "lucide-react";
import { paymentAPI } from "../services/api"
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Real data from backend
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingUsers: 0,
    totalEvents: 0,
    pendingEvents: 0,
    totalServices: 0,
    pendingServices: 0,
    totalResources: 0,
    pendingResources: 0,
    totalBookings: 0,
    totalRevenue: 0,
    grossRevenue: 0,       // ← NEW
    providerPayouts: 0,
    activeComplaints: 0,
  });

  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);

  // Events, Services, Resources
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingServices, setPendingServices] = useState([]);
  const [pendingResources, setPendingResources] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRejectItemModal, setShowRejectItemModal] = useState(false);
  const [itemRejectionReason, setItemRejectionReason] = useState("");
  const [itemType, setItemType] = useState(""); // 'event', 'service', or 'resource'

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || user.role !== "admin") {
      navigate("/admin/login");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      // Fetch user stats
      const statsResponse = await fetch(`${apiUrl}/admin/user-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats({
          totalUsers: statsData.data.overall.total,
          pendingUsers: statsData.data.overall.pending,
          approvedUsers: statsData.data.overall.approved,
          rejectedUsers: statsData.data.overall.rejected,
          totalEvents: 0, // TODO: Add events API
          pendingEvents: 0,
          totalServices: 0, // TODO: Add services API
          pendingServices: 0,
          totalResources: 0, // TODO: Add resources API
          pendingResources: 0,
          totalBookings: 0, // TODO: Add bookings API
          totalRevenue: 0, // TODO: Add revenue API
          activeComplaints: 0, // TODO: Add complaints API
        });
      }

      // Fetch pending users
      const pendingResponse = await fetch(
        `${apiUrl}/admin/pending-users?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingUsers(pendingData.data.users);
      }

      // Fetch approved users
      const approvedResponse = await fetch(
        `${apiUrl}/admin/approved-users?limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (approvedResponse.ok) {
        const approvedData = await approvedResponse.json();
        setApprovedUsers(approvedData.data.users);
      }

      // Fetch rejected users
      const rejectedResponse = await fetch(
        `${apiUrl}/admin/rejected-users?limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (rejectedResponse.ok) {
        const rejectedData = await rejectedResponse.json();
        setRejectedUsers(rejectedData.data.users);
      }

      // Fetch ALL events count (no limit)
      const allEventsResponse = await fetch(`${apiUrl}/events?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (allEventsResponse.ok) {
        const allEventsData = await allEventsResponse.json();
        const totalEventsCount =
          allEventsData.data.events?.length || allEventsData.data?.length || 0;

        setStats((prev) => ({
          ...prev,
          totalEvents: totalEventsCount,
        }));
      }

      // Fetch pending events
      const eventsResponse = await fetch(
        `${apiUrl}/events?adminApprovalStatus=pending&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setPendingEvents(eventsData.data.events || eventsData.data || []);

        // Update stats with event count
        setStats((prev) => ({
          ...prev,
          pendingEvents:
            eventsData.data.events?.length || eventsData.data?.length || 0,
        }));
      }

      // Fetch ALL services count
      const allServicesResponse = await fetch(`${apiUrl}/services?limit=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (allServicesResponse.ok) {
        const allServicesData = await allServicesResponse.json();
        const totalServicesCount =
          allServicesData.data.services?.length ||
          allServicesData.data?.length ||
          0;

        setStats((prev) => ({
          ...prev,
          totalServices: totalServicesCount,
        }));
      }

      // Fetch pending services
      const servicesResponse = await fetch(
        `${apiUrl}/services?adminApprovalStatus=pending&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setPendingServices(
          servicesData.data.services || servicesData.data || []
        );

        // Update stats with service count
        setStats((prev) => ({
          ...prev,
          pendingServices:
            servicesData.data.services?.length ||
            servicesData.data?.length ||
            0,
        }));
      }

      // Fetch ALL resources count
      const allResourcesResponse = await fetch(
        `${apiUrl}/resources?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (allResourcesResponse.ok) {
        const allResourcesData = await allResourcesResponse.json();
        const totalResourcesCount =
          allResourcesData.data.resources?.length ||
          allResourcesData.data?.length ||
          0;

        setStats((prev) => ({
          ...prev,
          totalResources: totalResourcesCount,
        }));
      }

      // Fetch pending resources
      const resourcesResponse = await fetch(
        `${apiUrl}/resources?adminApprovalStatus=pending&limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resourcesResponse.ok) {
        const resourcesData = await resourcesResponse.json();
        setPendingResources(
          resourcesData.data.resources || resourcesData.data || []
        );

        // Update stats with resource count
        setStats((prev) => ({
          ...prev,
          pendingResources:
            resourcesData.data.resources?.length ||
            resourcesData.data?.length ||
            0,
        }));
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to load data");
      setIsLoading(false);
    }

    // Fetch platform fee revenue (deducted from providers)
    // Fetch platform fee revenue (deducted from providers)
    try {
      const feesData = await paymentAPI.getAdminDeductedFees();
      const t = feesData.data?.totals || {};

      setStats((prev) => ({
        ...prev,
        totalRevenue: t.totalDeductedFees || 0,
        totalBookings: t.totalBookings || 0,
        grossRevenue: t.totalGrossRevenue || 0,
        providerPayouts: t.totalPaidToProviders || 0,
      }));
    } catch (feesErr) {
      console.error("Failed to load platform fees:", feesErr);
      // Don't block the rest of the dashboard — just leave those stats at 0
    }
  };

  const handleApproveUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to approve ${userName}?`)) return;

    setActionLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${apiUrl}/admin/approve-user/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        alert(`${userName} has been approved successfully!`);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to approve user");
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert("An error occurred while approving the user");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setShowRejectModal(true);
  };

  const handleRejectUser = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      alert("Please provide a rejection reason (minimum 10 characters)");
      return;
    }

    setActionLoading(selectedUser._id);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await fetch(
        `${apiUrl}/admin/reject-user/${selectedUser._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        await fetchData(); // Refresh data
        alert(`${selectedUser.name} has been rejected`);
        setShowRejectModal(false);
        setSelectedUser(null);
        setRejectionReason("");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to reject user");
      }
    } catch (error) {
      console.error("Reject error:", error);
      alert("An error occurred while rejecting the user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Approve/Reject Events, Services, Resources
  const handleApproveItem = async (type, itemId, itemName) => {
    const typeLabel = type.toLowerCase();
    if (!confirm(`Are you sure you want to approve this ${typeLabel}?`)) return;

    setActionLoading(itemId);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const endpoint =
        type === "event"
          ? `${apiUrl}/admin/approve-event/${itemId}`
          : type === "service"
            ? `${apiUrl}/admin/approve-service/${itemId}`
            : `${apiUrl}/admin/approve-resource/${itemId}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        alert(`${type} has been approved and published successfully!`);
      } else {
        const data = await response.json();
        alert(data.message || `Failed to approve ${typeLabel}`);
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert(`An error occurred while approving the ${typeLabel}`);
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectItemModal = (type, item) => {
    setItemType(type);
    setSelectedItem(item);
    setShowRejectItemModal(true);
  };

  const handleRejectItem = async () => {
    if (!itemRejectionReason || itemRejectionReason.trim().length < 10) {
      alert("Please provide a rejection reason (minimum 10 characters)");
      return;
    }

    setActionLoading(selectedItem._id);
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const endpoint =
        itemType === "event"
          ? `${apiUrl}/admin/reject-event/${selectedItem._id}`
          : itemType === "service"
            ? `${apiUrl}/admin/reject-service/${selectedItem._id}`
            : `${apiUrl}/admin/reject-resource/${selectedItem._id}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: itemRejectionReason }),
      });

      if (response.ok) {
        await fetchData(); // Refresh data
        alert(
          `${itemType.charAt(0).toUpperCase() + itemType.slice(1)
          } has been rejected`
        );
        setShowRejectItemModal(false);
        setSelectedItem(null);
        setItemRejectionReason("");
        setItemType("");
      } else {
        const data = await response.json();
        alert(data.message || `Failed to reject ${itemType}`);
      }
    } catch (error) {
      console.error("Reject error:", error);
      alert(`An error occurred while rejecting the ${itemType}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D7490C] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-orange-100">
                Manage users, events, services, resources, and complaints
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {stats.pendingUsers} pending
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-[#D7490C]" />
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {stats.pendingEvents} pending
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalEvents}
            </div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {stats.pendingServices + stats.pendingResources} pending
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalServices + stats.totalResources}
            </div>
            <div className="text-sm text-gray-600">Services & Resources</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.activeComplaints}
            </div>
            <div className="text-sm text-gray-600">Active Complaints</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Platform Revenue (Fees)</div>
              <div className="text-3xl font-bold text-green-600">
                ${stats.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-gray-500">Gross processed</div>
              <div className="font-semibold text-gray-900">
                ${(stats.grossRevenue || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Paid to providers</div>
              <div className="font-semibold text-gray-900">
                ${(stats.providerPayouts || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6 overflow-x-auto">
              {[
                "overview",
                "users",
                "events",
                "services",
                "resources",
                "complaints",
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab
                    ? "border-[#D7490C] text-[#D7490C]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Pending Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-700">
                        {stats.pendingUsers}
                      </div>
                      <div className="text-sm text-gray-700">
                        Users awaiting verification
                      </div>
                    </div>
                    <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
                      <div className="text-2xl font-bold text-orange-700">
                        {stats.pendingEvents}
                      </div>
                      <div className="text-sm text-gray-700">
                        Events pending approval
                      </div>
                    </div>
                    <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                      <div className="text-2xl font-bold text-red-700">
                        {stats.activeComplaints}
                      </div>
                      <div className="text-sm text-gray-700">
                        Active complaints
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pending User Approvals
                </h2>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No pending approvals
                    </h3>
                    <p className="text-gray-600">
                      All users have been reviewed.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div
                        key={user._id}
                        className="border border-gray-200 rounded-lg p-6 bg-white"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#B7410E] to-[#D7490C] flex items-center justify-center text-white font-bold text-xl">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                  {user.name}
                                </h3>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${user.role === "provider"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                    }`}
                                >
                                  {user.role}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 mb-4">
                              <div>
                                <strong>Email:</strong> {user.email}
                              </div>
                              <div>
                                <strong>Phone:</strong> {user.phone}
                              </div>
                              <div>
                                <strong>City:</strong> {user.city}
                              </div>
                              {user.address && (
                                <div>
                                  <strong>Address:</strong> {user.address}
                                </div>
                              )}
                              {user.providerInfo && user.role === "provider" && (
    <>
        <div className="mt-2 pt-2 border-t border-gray-200">
            <strong>Business Info:</strong>
        </div>
        <div>
            Business Name: {user.providerInfo.businessName}
        </div>
        {user.providerInfo.cnic && (
            <div className="flex items-center gap-2">
                <strong>CNIC:</strong>{" "}
                <span className="font-mono tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                    {user.providerInfo.cnic}
                </span>
            </div>
        )}
        {user.providerInfo.description && (
            <div>
                Description: {user.providerInfo.description}
            </div>
        )}
        {user.providerInfo.experience && (
            <div>
                Experience: {user.providerInfo.experience} years
            </div>
        )}
    </>
)}
                              <div className="text-xs text-gray-500 mt-2">
                                Registered:{" "}
                                {new Date(user.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleApproveUser(user._id, user.name)
                              }
                              disabled={actionLoading === user._id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(user)}
                              disabled={actionLoading === user._id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pending Event Approvals ({pendingEvents.length})
                </h2>

                {pendingEvents.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No pending events for approval
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingEvents.map((event) => (
                      <div
                        key={event._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          {event.images && event.images.length > 0 && (
                            <img
                              src={event.images[0].url}
                              alt={event.title}
                              className="w-full lg:w-48 h-32 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                  {event.title}
                                </h3>
                                <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                                  {event.category}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {event.description}
                            </p>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                              <div>
                                <span className="font-medium">Provider:</span>{" "}
                                {event.provider?.name || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Venue:</span>{" "}
                                {event.venue}
                              </div>
                              <div>
                                <span className="font-medium">Location:</span>{" "}
                                {event.location?.city || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Capacity:</span>{" "}
                                {event.capacity} guests
                              </div>
                              <div>
                                <span className="font-medium">Price:</span> PKR{" "}
                                {event.charges?.toLocaleString() || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Submitted:</span>{" "}
                                {new Date(event.createdAt).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() =>
                                  handleApproveItem(
                                    "event",
                                    event._id,
                                    event.title
                                  )
                                }
                                disabled={actionLoading === event._id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                                {actionLoading === event._id
                                  ? "Approving..."
                                  : "Approve & Publish"}
                              </button>
                              <button
                                onClick={() =>
                                  openRejectItemModal("event", event)
                                }
                                disabled={actionLoading === event._id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                              {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Eye className="w-4 h-4" />
                                View Details
                              </button> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === "services" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pending Service Approvals ({pendingServices.length})
                </h2>

                {pendingServices.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No pending services for approval
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingServices.map((service) => (
                      <div
                        key={service._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          {service.images && service.images.length > 0 && (
                            <img
                              src={service.images[0].url}
                              alt={service.title}
                              className="w-full lg:w-48 h-32 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {service.title}
                              </h3>
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {service.category}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {service.description}
                            </p>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                              <div>
                                <span className="font-medium">Provider:</span>{" "}
                                {service.provider?.name || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Location:</span>{" "}
                                {service.location?.city || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Price:</span> PKR{" "}
                                {service.pricing?.basePrice?.toLocaleString() ||
                                  "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Submitted:</span>{" "}
                                {new Date(
                                  service.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleApproveItem(
                                    "service",
                                    service._id,
                                    service.title
                                  )
                                }
                                disabled={actionLoading === service._id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                                {actionLoading === service._id
                                  ? "Approving..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() =>
                                  openRejectItemModal("service", service)
                                }
                                disabled={actionLoading === service._id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === "resources" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Pending Resource Approvals ({pendingResources.length})
                </h2>

                {pendingResources.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No pending resources for approval
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingResources.map((resource) => (
                      <div
                        key={resource._id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row gap-4">
                          {resource.images && resource.images.length > 0 && (
                            <img
                              src={resource.images[0].url}
                              alt={resource.name}
                              className="w-full lg:w-48 h-32 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                {resource.name}
                              </h3>
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                {resource.category}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {resource.description}
                            </p>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mb-4">
                              <div>
                                <span className="font-medium">Provider:</span>{" "}
                                {resource.provider?.name || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">Location:</span>{" "}
                                {resource.location?.city || "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Rental Price:
                                </span>{" "}
                                PKR{" "}
                                {resource.rentalPrice?.toLocaleString() ||
                                  "N/A"}
                              </div>
                              <div>
                                <span className="font-medium">
                                  Available Quantity:
                                </span>{" "}
                                {resource.availableQuantity || 0}
                              </div>
                              <div>
                                <span className="font-medium">Submitted:</span>{" "}
                                {new Date(
                                  resource.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleApproveItem(
                                    "resource",
                                    resource._id,
                                    resource.name
                                  )
                                }
                                disabled={actionLoading === resource._id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                                {actionLoading === resource._id
                                  ? "Approving..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() =>
                                  openRejectItemModal("resource", resource)
                                }
                                disabled={actionLoading === resource._id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === "complaints" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Active Complaints & Disputes
                </h2>
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <div
                      key={complaint.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              Complaint #{complaint.id}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${complaint.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                              {complaint.priority} Priority
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${complaint.status === "Open"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                                }`}
                            >
                              {complaint.status}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm mb-3">
                            <div className="flex gap-4">
                              <span className="text-gray-600">Filed by:</span>
                              <span className="font-semibold text-gray-900">
                                {complaint.complaintBy}
                              </span>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-gray-600">Against:</span>
                              <span className="font-semibold text-gray-900">
                                {complaint.complaintAgainst}
                              </span>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-gray-600">Type:</span>
                              <span className="text-gray-900">
                                {complaint.type}
                              </span>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-gray-600">Reason:</span>
                              <span className="text-gray-900">
                                {complaint.reason}
                              </span>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-gray-600">Submitted:</span>
                              <span className="text-gray-900">
                                {new Date(
                                  complaint.submittedDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Investigate
                          </button>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Resolve
                          </button>
                          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Block User
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed z-[9999] inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Reject User: {selectedUser?.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-3">
                        Please provide a clear reason for rejecting this user.
                        This will be visible to the user.
                      </p>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D7490C] focus:border-transparent resize-none bg-white text-gray-900"
                        rows="4"
                        placeholder="Enter rejection reason (minimum 10 characters)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        maxLength={500}
                        autoFocus
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        {rejectionReason.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleRejectUser}
                  disabled={actionLoading || rejectionReason.length < 10}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedUser(null);
                    setRejectionReason("");
                  }}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Item Modal (Events/Services/Resources) */}
      {showRejectItemModal && (
        <div className="fixed z-[9999] inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => {
                setShowRejectItemModal(false);
                setItemRejectionReason("");
                setSelectedItem(null);
                setItemType("");
              }}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-[10000]">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Reject{" "}
                      {itemType.charAt(0).toUpperCase() + itemType.slice(1)}:{" "}
                      {selectedItem?.title || selectedItem?.name}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-3">
                        Please provide a clear reason for rejecting this{" "}
                        {itemType}. This will be sent to the provider.
                      </p>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#D7490C] focus:border-transparent resize-none bg-white text-gray-900"
                        rows="4"
                        placeholder="Enter rejection reason (minimum 10 characters)..."
                        value={itemRejectionReason}
                        onChange={(e) => setItemRejectionReason(e.target.value)}
                        maxLength={500}
                        autoFocus
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        {itemRejectionReason.length}/500 characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleRejectItem}
                  disabled={actionLoading || itemRejectionReason.length < 10}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectItemModal(false);
                    setSelectedItem(null);
                    setItemRejectionReason("");
                    setItemType("");
                  }}
                  disabled={actionLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
