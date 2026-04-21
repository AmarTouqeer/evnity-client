import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Upload,
  MessageCircle,
  Star,
  Filter,
} from "lucide-react";
import { bookingAPI } from "../services/api";

const Bookings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings from API
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAll();
      if (response.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sample bookings data (keeping as fallback/reference)
  const sampleBookings = [
    {
      id: 1,
      type: "Event",
      itemName: "Grand Luxury Wedding Hall",
      provider: "Elite Events",
      bookingDate: "2025-11-01",
      eventDate: "2025-12-15",
      location: "DHA Phase 5, Lahore",
      amount: 150000,
      status: "Confirmed",
      paymentMethod: "Bank Transfer",
      paymentStatus: "Paid",
      receiptUploaded: true,
      guestCount: 500,
    },
    {
      id: 2,
      type: "Service",
      itemName: "Professional Photography Package",
      provider: "Capture Moments Studio",
      bookingDate: "2025-11-02",
      eventDate: "2025-12-15",
      location: "Lahore",
      amount: 25000,
      status: "Pending",
      paymentMethod: "COD",
      paymentStatus: "Pending",
      receiptUploaded: false,
    },
    {
      id: 3,
      type: "Resource",
      itemName: "Premium Chiavari Chairs (200 units)",
      provider: "Event Rentals Pro",
      bookingDate: "2025-10-28",
      eventDate: "2025-12-14",
      rentalPeriod: "3 days",
      location: "Lahore",
      amount: 90000,
      status: "Confirmed",
      paymentMethod: "Easypaisa",
      paymentStatus: "Paid",
      receiptUploaded: true,
    },
    {
      id: 4,
      type: "Event",
      itemName: "Birthday Party Hall",
      provider: "Celebration Events",
      bookingDate: "2025-10-15",
      eventDate: "2025-10-20",
      location: "Gulberg, Lahore",
      amount: 35000,
      status: "Completed",
      paymentMethod: "Cash",
      paymentStatus: "Paid",
      receiptUploaded: true,
      reviewSubmitted: false,
    },
    {
      id: 5,
      type: "Service",
      itemName: "Catering Service - 100 Guests",
      provider: "Royal Caterers",
      bookingDate: "2025-10-10",
      eventDate: "2025-10-20",
      location: "Lahore",
      amount: 75000,
      status: "Completed",
      paymentMethod: "Bank Transfer",
      paymentStatus: "Paid",
      receiptUploaded: true,
      reviewSubmitted: true,
    },
    {
      id: 6,
      type: "Event",
      itemName: "Conference Hall",
      provider: "Business Events Pro",
      bookingDate: "2025-11-03",
      eventDate: "2025-11-10",
      location: "Karachi",
      amount: 80000,
      status: "Cancelled",
      paymentMethod: "JazzCash",
      paymentStatus: "Refunded",
      receiptUploaded: false,
      cancellationReason: "Event postponed",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Refunded":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Transform API bookings to match UI format
  const transformedBookings = bookings.map((booking) => {
    // Determine the type and get the item details
    let type, itemName, location;

    if (booking.bookingType === "event" && booking.event) {
      type = "Event";
      itemName = booking.event.title || booking.event.name || "Event";
      location =
        booking.event.location?.address ||
        booking.event.location?.city ||
        "Location TBA";
    } else if (booking.bookingType === "service" && booking.service) {
      type = "Service";
      itemName = booking.service.title || booking.service.name || "Service";
      location = booking.service.location?.city || "Location TBA";
    } else if (booking.bookingType === "resource" && booking.resource) {
      type = "Resource";
      itemName = `${booking.resource.name} (${booking.quantity || 1} units)`;
      location = booking.resource.location?.city || "Location TBA";
    } else {
      type = booking.bookingType || "Unknown";
      itemName = "Booking";
      location = "N/A";
    }

    // Derive friendly payment method label
    let paymentMethodLabel = "N/A";
    if (booking.paymentMethod === "stripe" || booking.paymentProvider === "stripe") {
      paymentMethodLabel = "Stripe (Test)";
    } else if (
      booking.paymentMethod === "manual" ||
      booking.paymentProvider === "manual"
    ) {
      const methodType = booking.manualPayment?.methodType;
      if (methodType === "easypaisa") paymentMethodLabel = "Manual – Easypaisa";
      else if (methodType === "jazzcash")
        paymentMethodLabel = "Manual – JazzCash";
      else if (methodType === "bank_transfer")
        paymentMethodLabel = "Manual – Bank Transfer";
      else if (methodType === "cash") paymentMethodLabel = "Manual – Cash";
      else paymentMethodLabel = "Manual Payment";
    }

    return {
      id: booking._id,
      type,
      itemName,
      provider: booking.provider?.name || "Provider",
      bookingDate: booking.createdAt,
      eventDate: booking.eventDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      location,
      amount: booking.totalAmount || 0,
      status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1), // Capitalize
      paymentMethod: paymentMethodLabel,
      paymentStatus:
        booking.paymentStatus === "paid"
          ? "Paid"
          : booking.paymentStatus === "partial"
          ? "Partial"
          : "Pending",
      receiptUploaded: booking.receipt?.url ? true : false,
      guestCount: booking.quantity,
      rentalPeriod:
        booking.bookingType === "resource"
          ? `${booking.quantity || 1} units`
          : null,
      cancellationReason: booking.cancellationReason,
      rejectionReason: booking.rejectionReason,
    };
  });

  const filteredBookings = transformedBookings
    .filter((booking) => {
      if (activeTab === "all") return true;
      if (activeTab === "events") return booking.type === "Event";
      if (activeTab === "services") return booking.type === "Service";
      if (activeTab === "resources") return booking.type === "Resource";
      return true;
    })
    .filter((booking) => {
      if (filterStatus === "all") return true;
      return booking.status.toLowerCase() === filterStatus;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7490C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-orange-100">
            Manage all your event, service, and resource bookings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {transformedBookings.length}
            </div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {
                transformedBookings.filter(
                  (b) => b.status === "Confirmed" || b.status === "Accepted"
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {transformedBookings.filter((b) => b.status === "Pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {
                transformedBookings.filter((b) => b.status === "Completed")
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900">Filters:</span>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Type Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "all"
                      ? "bg-[#D7490C] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "events"
                      ? "bg-[#D7490C] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveTab("services")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "services"
                      ? "bg-[#D7490C] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "resources"
                      ? "bg-[#D7490C] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Resources
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6">
                Start booking events, services, or resources!
              </p>
              <Link
                to="/events"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-orange-100 text-[#D7490C] rounded-full font-medium">
                          {booking.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getPaymentStatusColor(
                            booking.paymentStatus
                          )}`}
                        >
                          Payment: {booking.paymentStatus}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {booking.itemName}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Event Date:{" "}
                          {new Date(booking.eventDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {booking.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Booked:{" "}
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {booking.paymentMethod}
                        </div>
                        {booking.startTime && booking.endTime && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Time: {booking.startTime} - {booking.endTime}
                          </div>
                        )}
                      </div>

                      {booking.guestCount && (
                        <div className="text-sm text-gray-600 mt-2">
                          Guests: {booking.guestCount}
                        </div>
                      )}

                      {booking.rentalPeriod && (
                        <div className="text-sm text-gray-600 mt-2">
                          Rental Period: {booking.rentalPeriod}
                        </div>
                      )}

                      {booking.cancellationReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          Cancellation Reason: {booking.cancellationReason}
                        </div>
                      )}

                      {booking.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          Rejection Reason: {booking.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#D7490C] mb-1">
                        PKR {booking.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Amount</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>

                    {/* <button className="flex items-center gap-2 px-4 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Contact Provider
                    </button> */}

                    {booking.status === "Pending" &&
                      !booking.receiptUploaded &&
                      booking.paymentMethod !== "Easypaisa" &&
                      booking.paymentMethod !== "JazzCash" && (
                        <Link
                          to={`/bookings/${booking.id}/upload-receipt`}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Receipt
                        </Link>
                      )}

                    {/* {booking.status === "Completed" &&
                      !booking.reviewSubmitted && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                          <Star className="w-4 h-4" />
                          Write Review
                        </button>
                      )} */}

                    {booking.status === "Pending" && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <XCircle className="w-4 h-4" />
                        Cancel Booking
                      </button>
                    )}

                    {/* {(booking.status === "Confirmed" ||
                      booking.status === "Completed") && (
                      <Link
                        to={`/complaints/new?booking=${booking.id}`}
                        className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Report Issue
                      </Link>
                    )} */}
                  </div>

                  {/* Payment Status Warning */}
                  {booking.paymentStatus === "Pending" && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold">Payment Pending</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please upload your payment receipt or complete the
                        payment to confirm your booking.
                      </p>
                    </div>
                  )}

                  {/* Receipt Uploaded Confirmation */}
                  {booking.receiptUploaded &&
                    booking.paymentStatus === "Paid" && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">
                            Payment Verified
                          </span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Your payment has been verified. Booking confirmed!
                        </p>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
