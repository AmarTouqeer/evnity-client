import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import {
  bookingAPI,
  eventAPI,
  serviceAPI,
  resourceAPI,
  providerStripeAPI,
} from "../services/api";

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeListings: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [listings, setListings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchStripeStatus();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getProviderDashboardStats();
      if (response.success) {
        setStats(response.data.stats);
        setListings(response.data.listings);
        const transformedBookings = response.data.recentBookings.map(
          (booking) => ({
            id: booking._id,
            customerName: booking.customer?.name || "Unknown",
            listing:
              booking.event?.name ||
              booking.resource?.name ||
              booking.service?.name ||
              "N/A",
            date: booking.eventDate,
            amount: booking.totalAmount,
            status:
              booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
          })
        );
        setRecentBookings(transformedBookings);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStripeStatus = async () => {
    try {
      setStripeLoading(true);
      setStripeError(null);
      const response = await providerStripeAPI.getStatus();
      if (response.success) {
        setStripeStatus(response.data);
      } else {
        setStripeError(response.message || "Failed to load Stripe status");
      }
    } catch (error) {
      console.error("Error fetching Stripe status:", error);
      setStripeError(error.message || "Failed to load Stripe status");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setStripeLoading(true);
      const response = await providerStripeAPI.getConnectUrl();
      if (!response || response.success === false) {
        throw new Error(
          response?.message ||
            "Failed to start Stripe Connect onboarding. Please try again."
        );
      }
      const url = response.data?.authUrl;
      if (!url) {
        throw new Error("Stripe Connect URL was not returned by the server.");
      }
      window.location.href = url;
    } catch (error) {
      console.error("Error starting Stripe Connect onboarding:", error);
      alert(error.message || "Failed to start Stripe Connect onboarding.");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await bookingAPI.accept(bookingId);
      fetchDashboardData();
    } catch (error) {
      console.error("Error accepting booking:", error);
      alert(error.message || "Failed to accept booking");
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;
    try {
      await bookingAPI.reject(bookingId, reason);
      fetchDashboardData();
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert(error.message || "Failed to reject booking");
    }
  };

  const handleViewListing = (listing) => {
    const type = listing.type.toLowerCase();
    if (type === "event") navigate(`/events/${listing.id}`);
    else if (type === "service") navigate(`/services/${listing.id}`);
    else if (type === "resource") navigate(`/resources/${listing.id}`);
  };

  const handleEditListing = (listing) => {
    const type = listing.type.toLowerCase();
    navigate(`/provider/edit/${type}/${listing.id}`);
  };

  const handleDeleteListing = async (listing) => {
    if (
      !confirm(
        `Are you sure you want to delete "${listing.name}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const type = listing.type.toLowerCase();
      let response;
      if (type === "event") response = await eventAPI.delete(listing.id);
      else if (type === "service") response = await serviceAPI.delete(listing.id);
      else if (type === "resource") response = await resourceAPI.delete(listing.id);

      if (response.success) {
        alert(`${listing.type} deleted successfully`);
        fetchDashboardData();
      } else {
        alert(response.message || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert(error.message || "Failed to delete listing");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7490C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-orange-100">
            Manage your listings, bookings, and earnings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stripe Connect Status Card */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-full bg-orange-100">
                <CreditCard className="w-6 h-6 text-[#D7490C]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Stripe Payouts (Connect)
                </h2>
                {stripeLoading ? (
                  <p className="text-sm text-gray-600">
                    Checking your Stripe connection status...
                  </p>
                ) : stripeError ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {stripeError}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-700">
                      {stripeStatus?.isConnected &&
                      stripeStatus?.stripeConnectStatus === "active" ? (
                        <>
                          Your Stripe account is{" "}
                          <span className="font-semibold text-green-700">
                            connected
                          </span>{" "}
                          and ready to receive payouts.
                        </>
                      ) : (
                        <>
                          Connect your Stripe account to receive payouts for
                          card payments. You&apos;ll be redirected to
                          Stripe&apos;s secure onboarding flow.
                        </>
                      )}
                    </p>
                    {stripeStatus && (
                      <p className="mt-1 text-xs text-gray-500">
                        Status:{" "}
                        <span className="font-medium">
                          {stripeStatus.stripeConnectStatus || "not_connected"}
                        </span>{" "}
                        • Charges:{" "}
                        <span className="font-medium">
                          {stripeStatus.stripeChargesEnabled ? "enabled" : "off"}
                        </span>{" "}
                        • Payouts:{" "}
                        <span className="font-medium">
                          {stripeStatus.stripePayoutsEnabled ? "enabled" : "off"}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={handleConnectStripe}
                disabled={
                  stripeLoading ||
                  (stripeStatus?.isConnected &&
                    stripeStatus?.stripeConnectStatus === "active" &&
                    stripeStatus?.stripeChargesEnabled &&
                    stripeStatus?.stripePayoutsEnabled)
                }
                className="px-6 py-2 rounded-lg text-sm font-semibold border border-[#D7490C] text-[#D7490C] hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stripeLoading
                  ? "Redirecting..."
                  : stripeStatus?.isConnected &&
                    stripeStatus?.stripeConnectStatus === "active"
                  ? "Manage in Stripe"
                  : "Connect Stripe"}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.totalBookings}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-[#D7490C]" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.activeListings}
            </div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              PKR {stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 text-sm font-medium">
                  {stats.averageRating}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stats.averageRating}/5.0
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-6">
              {["overview", "listings", "bookings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? "border-[#D7490C] text-[#D7490C]"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab === "overview"
                    ? "Overview"
                    : tab === "listings"
                    ? "My Listings"
                    : "Bookings"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Recent Activity
                </h2>
                {recentBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No recent bookings yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-gray-600" />
                              <span className="font-semibold text-gray-900">
                                {booking.customerName}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  booking.status === "Confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              {booking.listing}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-bold text-[#D7490C]">
                              PKR {booking.amount.toLocaleString()}
                            </div>
                            <button
                              onClick={() => navigate(`/bookings/${booking.id}`)}
                              className="px-4 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Listings Tab */}
            {activeTab === "listings" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    My Listings
                  </h2>
                  <Link
                    to="/provider/add-listing"
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Listing
                  </Link>
                </div>
                {listings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No listings yet. Add your first listing!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 bg-orange-100 text-[#D7490C] rounded-full font-medium">
                                {listing.type}
                              </span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                {listing.category}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  listing.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {listing.status}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {listing.name}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                PKR {listing.price.toLocaleString()}{" "}
                                {listing.priceUnit || "per event"}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {listing.bookings} bookings
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                                {listing.rating}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewListing(listing)}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleEditListing(listing)}
                              className="p-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteListing(listing)}
                              className="p-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  All Bookings
                </h2>
                {recentBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No bookings yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Users className="w-5 h-5 text-gray-600" />
                              <span className="font-semibold text-lg text-gray-900">
                                {booking.customerName}
                              </span>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  booking.status === "Confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-gray-700 font-medium mb-2">
                              {booking.listing}
                            </p>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              Event Date:{" "}
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">
                                Booking Amount
                              </div>
                              <div className="text-2xl font-bold text-[#D7490C]">
                                PKR {booking.amount.toLocaleString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/bookings/${booking.id}`)
                                }
                                className="px-4 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors"
                              >
                                View Details
                              </button>
                              {booking.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleAcceptBooking(booking.id)
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectBooking(booking.id)
                                    }
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;