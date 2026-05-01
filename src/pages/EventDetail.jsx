import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { eventAPI, bookingAPI } from "../services/api";
import ReviewsSection from "../components/ReviewsSection";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // ── get current user from localStorage ──
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  // ── Only customers see the booking sidebar ──
  const isCustomer = currentUser?.role === "customer";

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  useEffect(() => {
    if (selectedDate && event) {
      if (
        event.availableDates &&
        Array.isArray(event.availableDates) &&
        event.availableDates.length > 0
      ) {
        const dateSlot = event.availableDates.find((slot) => {
          const slotDate = new Date(slot.date).toISOString().split("T")[0];
          return slotDate === selectedDate;
        });

        if (dateSlot && dateSlot.timeSlots && dateSlot.timeSlots.length > 0) {
          setAvailableTimeSlots(dateSlot.timeSlots);
        } else {
          setAvailableTimeSlots([
            { startTime: "09:00 AM", endTime: "01:00 PM" },
            { startTime: "02:00 PM", endTime: "06:00 PM" },
            { startTime: "06:00 PM", endTime: "11:00 PM" },
          ]);
        }
      } else {
        setAvailableTimeSlots([
          { startTime: "09:00 AM", endTime: "01:00 PM" },
          { startTime: "02:00 PM", endTime: "06:00 PM" },
          { startTime: "06:00 PM", endTime: "11:00 PM" },
        ]);
      }
      setSelectedTimeSlot("");
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, event]);

  useEffect(() => {
    if (event && guestCount) {
      const basePrice = event.charges || 0;
      const guests = parseInt(guestCount) || 0;
      const capacity = event.capacity || 0;

      if (capacity > 0 && guests > 0) {
        const pricePerGuest = basePrice / capacity;
        setTotalPrice(Math.round(pricePerGuest * guests));
      } else {
        setTotalPrice(basePrice);
      }
    } else {
      setTotalPrice(0);
    }
  }, [guestCount, event]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventAPI.getById(id);
      if (response.success) {
        setEvent(response.data.event);
      } else {
        setError(response.message || "Failed to fetch event details");
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (parseInt(guestCount) > event.capacity) {
      alert(`This venue can accommodate a maximum of ${event.capacity} guests.`);
      return;
    }
    if (!selectedTimeSlot) {
      alert("Please select a time slot for your event.");
      return;
    }
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    try {
      const [startTime, endTime] = selectedTimeSlot.split("-");

      const bookingData = {
        bookingType: "event",
        eventId: event._id,
        eventDate: selectedDate,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        quantity: parseInt(guestCount),
        customerNotes: "",
      };

      const response = await bookingAPI.create(bookingData);

      if (response.success) {
        if (response.data.paymentIntentId) {
          localStorage.setItem("pendingBookingId", response.data.booking._id);
          alert("Booking created! Redirecting to payment...");
        } else {
          alert("Booking request submitted successfully! Provider will review and respond.");
          setShowBookingModal(false);
          window.location.href = "/bookings";
        }
      } else {
        const errorMessage = response.message || "Failed to create booking";
        alert(errorMessage);
        if (response.message && response.message.includes("already booked")) {
          setShowBookingModal(false);
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage = error.message || "Failed to create booking. Please try again.";
      alert(errorMessage);
      if (errorMessage.includes("already booked")) {
        setShowBookingModal(false);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D7490C] mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <Link
            to="/events"
            className="inline-flex items-center px-6 py-3 bg-[#D7490C] text-white rounded-lg hover:bg-[#B7410E] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // ── Derived values ──
  const eventName = event.title || "Untitled Event";
  const eventLocation = `${event.location?.address || ""}, ${event.location?.city || ""}`
    .trim()
    .replace(/^,\s*/, "");
  const eventImage =
    event.images && event.images.length > 0
      ? event.images[0].url
      : "https://via.placeholder.com/800x400?text=Event+Image";
  const eventRating = event.averageRating || 0;
  const eventReviews = event.totalReviews || 0;
  const eventPrice = event.charges || 0;
  const eventCapacity = event.capacity || 0;
  const eventCategory = event.category || "Event";
  const eventDescription = event.description || "No description available";
  const providerName = event.provider?.name || "Unknown Provider";
  const providerPhone = event.provider?.phone || "N/A";
  const paymentOptions = event.paymentOptions || {};
  const stripeEnabled = !!paymentOptions.stripe?.enabled;
  const stripeCurrency = paymentOptions.stripe?.currency?.toUpperCase() || "PKR";
  const manualEnabled = !!paymentOptions.manual?.enabled;
  const manualMethods = manualEnabled
    ? (paymentOptions.manual?.methods || []).filter((m) => m.isActive !== false)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            to="/events"
            className="flex items-center text-[#D7490C] hover:text-[#B7410E] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="lg:col-span-1">
            <img
              src={eventImage}
              alt={eventName}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x400?text=Event+Image";
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {event.images &&
              event.images.slice(1, 5).map((img, index) => (
                <img
                  key={index}
                  src={img.url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-44 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x300?text=Gallery";
                  }}
                />
              ))}
          </div>
        </div>

        {/* Main layout: 3-col when customer, full-width otherwise */}
        <div className={`grid grid-cols-1 gap-8 ${isCustomer ? "lg:grid-cols-3" : ""}`}>

          {/* ══════════ Main Content Column ══════════ */}
          <div className={`space-y-6 ${isCustomer ? "lg:col-span-2" : ""}`}>

            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{eventName}</h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-1" />
                      {eventLocation}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-1 text-yellow-500 fill-current" />
                      {eventRating.toFixed(1)} ({eventReviews} reviews)
                    </div>
                  </div>
                </div>
              </div>
              <span className="inline-block px-3 py-1 bg-orange-100 text-[#D7490C] rounded-full text-sm font-medium capitalize">
                {eventCategory}
              </span>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-white rounded-xl shadow-lg">
              <div className="flex items-center">
                <Users className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Capacity</div>
                  <div className="font-semibold text-gray-900">{eventCapacity} guests</div>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Price</div>
                  <div className="font-semibold text-gray-900">
                    PKR {eventPrice.toLocaleString()}
                  </div>
                </div>
              </div>
              {/* ── FIX: Contact button is its own cell, not nested inside Clock ── */}
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Contact</div>
                  <div className="font-semibold text-gray-900">{providerPhone}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
              <p className="text-gray-700 leading-relaxed">{eventDescription}</p>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Venue: {event.venue || "N/A"}
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Category: {eventCategory}
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Capacity: {eventCapacity} guests
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  Status: {event.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {(stripeEnabled || manualMethods.length > 0) && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Payment Options{" "}
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full ml-2">
                      TEST PAYMENT ONLY
                    </span>
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    This event uses demo/test payment flows. You will not be charged real money.
                  </p>
                  <div className="space-y-2 text-sm">
                    {stripeEnabled && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Stripe Card Payment (TEST)</p>
                          <p className="text-xs text-gray-600">
                            Pay securely with a test card in{" "}
                            <span className="font-semibold">{stripeCurrency}</span>. You will be
                            redirected to Stripe Checkout after your booking is accepted.
                          </p>
                        </div>
                      </div>
                    )}
                    {manualMethods.length > 0 && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Manual Pakistani Payment Methods
                          </p>
                          <ul className="mt-1 space-y-1 text-xs text-gray-700">
                            {manualMethods.map((method, index) => (
                              <li key={index}>
                                <span className="font-semibold">
                                  {method.label || method.type}
                                </span>
                                {method.accountNumber && <> – {method.accountNumber}</>}
                                {method.instructions && (
                                  <div className="text-[11px] text-gray-500">
                                    {method.instructions}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Hosted By</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {providerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">{providerName}</h3>
                      <CheckCircle className="w-5 h-5 text-blue-500 fill-current" />
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                      {eventRating.toFixed(1)} Rating
                    </div>
                  </div>
                </div>
                {/* ── FIX: wired up onClick ── */}
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center gap-2 px-6 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact
                </button>
              </div>
            </div>

            {/* Reviews Section */}
            <ReviewsSection eventId={id} currentUser={currentUser} />

          </div>

          {/* ══════════ Booking Sidebar — customers only ══════════ */}
          {isCustomer && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-1">Price</div>
                  <div className="text-3xl font-bold text-[#D7490C]">
                    PKR {eventPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">per event</div>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                    />
                  </div>

                  {selectedDate && availableTimeSlots.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Slot *
                      </label>
                      <select
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                      >
                        <option value="">Select time slot</option>
                        {availableTimeSlots.map((slot, index) => (
                          <option key={index} value={`${slot.startTime}-${slot.endTime}`}>
                            {slot.startTime} - {slot.endTime}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.availableDates && event.availableDates.length > 0
                          ? "Provider-specific time slots"
                          : "Standard time slots available"}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests *
                    </label>
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      placeholder={`Max ${eventCapacity} guests`}
                      required
                      min="1"
                      max={eventCapacity}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                    />
                    {guestCount && parseInt(guestCount) > eventCapacity && (
                      <p className="text-red-600 text-xs mt-1">
                        Capacity exceeded! Max {eventCapacity} guests allowed.
                      </p>
                    )}
                  </div>

                  {guestCount && parseInt(guestCount) > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                        Price Breakdown
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Venue Base Price (for {eventCapacity} guests)</span>
                          <span>PKR {eventPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Price per Guest</span>
                          <span>
                            PKR {Math.round(eventPrice / eventCapacity).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Your Guests</span>
                          <span className="font-medium">{guestCount} guests</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                          <span className="font-bold text-gray-900">Total Amount</span>
                          <span className="font-bold text-[#D7490C] text-xl">
                            PKR {totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      !selectedDate ||
                      !selectedTimeSlot ||
                      !guestCount ||
                      parseInt(guestCount) > eventCapacity
                    }
                    className="w-full py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to Book
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Booking Information</h3>
                  <div className="space-y-2">
                    {event.availableDates && event.availableDates.length > 0 ? (
                      <>
                        <p className="text-xs text-gray-600 mb-2">
                          Provider's Available Dates:
                        </p>
                        {event.availableDates.map((dateSlot, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {new Date(dateSlot.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {dateSlot.timeSlots?.length || 0} slots
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Flexible Booking Available</strong>
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Select any future date and choose from standard time slots. The
                          provider will confirm availability after your request.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* ══════════ End Booking Sidebar ══════════ */}

        </div>
      </div>

      {/* ══════════ Booking Confirmation Modal ══════════ */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Confirm Booking Details
            </h2>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event:</span>
                    <span className="font-medium text-gray-900">{eventName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-medium text-gray-900">{event.venue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{eventLocation}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Booking Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Slot:</span>
                    <span className="font-medium text-gray-900">{selectedTimeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Guests:</span>
                    <span className="font-medium text-gray-900">{guestCount} guests</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue Base Price:</span>
                    <span className="font-medium">PKR {eventPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Guest:</span>
                    <span className="font-medium">
                      PKR {Math.round(eventPrice / eventCapacity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Guests:</span>
                    <span className="font-medium">{guestCount} guests</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-orange-300">
                    <span className="font-bold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-[#D7490C] text-lg">
                      PKR {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Provider will review and confirm your booking request</li>
                  <li>Payment will be processed after provider confirms</li>
                  <li>You'll receive a notification once confirmed</li>
                  <li>Cancellation policy applies as per terms</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmBooking}
                disabled={bookingLoading}
                className="flex-1 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bookingLoading ? "Processing..." : "Confirm & Submit"}
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingStep(1);
                }}
                disabled={bookingLoading}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Contact Provider Modal ══════════ */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Provider</h2>

            {/* Provider avatar + name */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {providerName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{providerName}</p>
                <p className="text-sm text-gray-500">Event Provider</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">

              {/* ── FIX: restored missing <a opening tags ── */}

              {/* Phone */}
              {event.provider?.phone && (
                <a
                  href={`tel:${event.provider.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#D7490C] hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#D7490C]">
                      {event.provider.phone}
                    </p>
                  </div>
                </a>
              )}

              {/* WhatsApp */}
              {event.provider?.phone && (
                <a
                  href={`https://wa.me/${event.provider.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600">
                      Chat on WhatsApp
                    </p>
                  </div>
                </a>
              )}

              {/* Email */}
              {event.provider?.email && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${event.provider.email}&su=Inquiry about ${eventName}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#D7490C] hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#D7490C]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#D7490C] break-all">
                      {event.provider.email}
                    </p>
                  </div>
                </a>
              )}
            </div>

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventDetail;