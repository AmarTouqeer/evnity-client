import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Award,
  Briefcase,
} from "lucide-react";
import { serviceAPI, bookingAPI } from "../services/api";
import ReviewsSection from "../components/ReviewsSection";

const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const { user } = useAuth();

  const availableDates = service?.availableDates || [];

  const slotsForSelectedDate = selectedDate
    ? (
        availableDates.find(
          (d) => new Date(d.date).toISOString().split("T")[0] === selectedDate
        )?.timeSlots || []
      ).filter((s) => s.isAvailable !== false)
    : [];

  const allowedDates = availableDates.map(
    (d) => new Date(d.date).toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const response = await serviceAPI.getById(id);
      if (response.success) {
        setService(response.data.service);
      }
    } catch (error) {
      console.error("Error fetching service:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    setBookingLoading(true);
    try {
      const [startTime, endTime] = selectedTime.split("-");

      const bookingData = {
        bookingType: "service",
        serviceId: service._id,
        eventDate: selectedDate,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        customerNotes: customerNotes,
      };

      const response = await bookingAPI.create(bookingData);

      if (response.success) {
        alert(
          "Booking request submitted successfully! Provider will review and respond."
        );
        setShowBookingModal(false);
        setSelectedDate("");
        setSelectedTime("");
        setCustomerNotes("");
      } else {
        const errorMessage = response.message || "Failed to create booking";
        alert(errorMessage);
        if (response.message && response.message.includes("already booked")) {
          setShowBookingModal(false);
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error.message || "Failed to create booking. Please try again.";
      alert(errorMessage);
      if (errorMessage.includes("already booked")) {
        setShowBookingModal(false);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7490C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Service not found
          </h2>
          <p className="text-gray-600 mb-4">
            The service you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            to="/services"
            className="text-[#D7490C] hover:text-[#B7410E] font-medium"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const displayService = {
    name: service.title || "Service",
    provider: service.provider?.name || "Provider",
    location:
      service.location?.city || service.location?.address || "Location TBA",
    category: service.category || "Service",
    image:
      service.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
    rating: service.averageRating || 0,
    reviews: service.totalReviews || 0,
    price: service.pricing?.basePrice || 0,
    priceUnit: service.pricing?.pricingType || "per event",
    experience: service.provider?.experience || "N/A",
    completedProjects: service.totalBookings || 0,
    description: service.description || "No description available",
    services: service.pricing?.packages?.map((pkg) => pkg.name) || [],
    equipment: service.equipment || [],
    gallery: service.images?.map((img) => img.url) || [],
    providerInfo: {
      name: service.provider?.name || "Provider",
      rating: service.provider?.averageRating || 0,
      responseTime: "Within 24 hours",
      verified: service.adminApprovalStatus === "approved",
      memberSince: service.provider?.createdAt
        ? new Date(service.provider.createdAt).getFullYear()
        : "N/A",
      completedBookings: service.provider?.totalBookings || 0,
    },
  };

  const paymentOptions = service.paymentOptions || {};
  const stripeEnabled = !!paymentOptions.stripe?.enabled;
  const stripeCurrency =
    paymentOptions.stripe?.currency?.toUpperCase() || "PKR";
  const manualEnabled = !!paymentOptions.manual?.enabled;
  const manualMethods = manualEnabled
    ? (paymentOptions.manual?.methods || []).filter(
        (m) => m.isActive !== false
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            to="/services"
            className="flex items-center text-[#D7490C] hover:text-[#B7410E] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Services
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="lg:col-span-1">
            <img
              src={displayService.image}
              alt={displayService.name}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {displayService.gallery.slice(0, 4).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Gallery ${index + 1}`}
                className="w-full h-44 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {displayService.name}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-1" />
                      {displayService.location}
                    </div>
                    {displayService.rating > 0 && (
                      <div className="flex items-center">
                        <Star className="w-5 h-5 mr-1 text-yellow-500 fill-current" />
                        {displayService.rating} ({displayService.reviews}{" "}
                        reviews)
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-[#D7490C] rounded-full text-sm font-medium">
                      {displayService.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-xl shadow-lg">
              <div className="flex items-center">
                <Briefcase className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Experience</div>
                  <div className="font-semibold text-gray-900">
                    {displayService.experience}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="font-semibold text-gray-900">
                    {displayService.completedProjects}+ events
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Price</div>
                  <div className="font-semibold text-gray-900">
                    PKR {displayService.price.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Response</div>
                  <div className="font-semibold text-gray-900">
                    {displayService.providerInfo.responseTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Service
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {displayService.description}
              </p>
            </div>

            {/* Payment Options (read-only) */}
            {(stripeEnabled || manualMethods.length > 0) && (
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Payment Options{" "}
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full ml-2">
                    TEST PAYMENT ONLY
                  </span>
                </h2>
                <p className="text-xs text-gray-600">
                  This service uses demo/test payment flows. You will not be
                  charged real money.
                </p>
                <div className="space-y-2 text-sm pt-2">
                  {stripeEnabled && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Stripe Card Payment (TEST)
                        </p>
                        <p className="text-xs text-gray-600">
                          Pay securely with a test card in{" "}
                          <span className="font-semibold">{stripeCurrency}</span>.
                          You will be redirected to Stripe Checkout after your
                          booking is accepted.
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
                              {method.accountNumber && (
                                <> &ndash; {method.accountNumber}</>
                              )}
                              {method.instructions && (
                                <div className="text-[11px] text-gray-500">
                                  {method.instructions}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                        <p className="text-[11px] text-gray-500 mt-2">
                          You&apos;ll see full instructions and upload your
                          receipt on the booking details screen once your
                          booking is accepted.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Services Included */}
            {displayService.services.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  What&apos;s Included
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayService.services.map((item, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {displayService.equipment.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Professional Equipment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayService.equipment.map((item, index) => (
                    <div key={index} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewsSection entityId={id} type="service" currentUser={user} />

            {/* Provider Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About the Provider
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {displayService.providerInfo.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {displayService.providerInfo.name}
                      </h3>
                      {displayService.providerInfo.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      {displayService.providerInfo.rating > 0 && (
                        <>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                            {displayService.providerInfo.rating} Rating
                          </div>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        Member since {displayService.providerInfo.memberSince}
                      </span>
                      {displayService.providerInfo.completedBookings > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {displayService.providerInfo.completedBookings}{" "}
                            completed bookings
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="flex items-center gap-2 px-6 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact
                </button>
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">Service Price</div>
                <div className="text-3xl font-bold text-[#D7490C]">
                  PKR {displayService.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {displayService.priceUnit}
                </div>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Date *
                  </label>
                  {availableDates.length > 0 ? (
                    <select
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime("");
                      }}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                    >
                      <option value="">Select an available date</option>
                      {availableDates.map((d, idx) => {
                        const dateStr = new Date(d.date)
                          .toISOString()
                          .split("T")[0];
                        const label = new Date(d.date).toLocaleDateString(
                          "en-PK",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        );
                        return (
                          <option key={idx} value={dateStr}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No available dates set by provider.
                    </p>
                  )}
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot *
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                    disabled={!selectedDate}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {!selectedDate
                        ? "Select a date first"
                        : slotsForSelectedDate.length === 0
                        ? "No slots available for this date"
                        : "Select time slot"}
                    </option>
                    {slotsForSelectedDate.map((slot, idx) => (
                      <option
                        key={idx}
                        value={`${slot.startTime}-${slot.endTime}`}
                      >
                        {slot.startTime} – {slot.endTime}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows="3"
                    placeholder="Tell us about your event..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all"
                >
                  Request Booking
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold text-gray-900">
                    {displayService.providerInfo.responseTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-600">Completed Projects</span>
                  <span className="font-semibold text-gray-900">
                    {displayService.completedProjects}+
                  </span>
                </div>
                {displayService.rating > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold text-gray-900 flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                      {displayService.rating}/5.0
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirm Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Booking Request
            </h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold text-right">
                  {displayService.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-semibold">{displayService.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {new Date(selectedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">
                  {selectedTime.replace("-", " – ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-[#D7490C]">
                  PKR {displayService.price.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmBooking}
                disabled={bookingLoading}
                className="flex-1 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50"
              >
                {bookingLoading ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Contact Provider
            </h2>

            {/* Provider avatar + name */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {displayService.providerInfo.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {displayService.providerInfo.name}
                </p>
                <p className="text-sm text-gray-500">Service Provider</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {/* Phone */}
              {service.provider?.phone && (
                <a
                  href={`tel:${service.provider.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#D7490C] hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#D7490C]">
                      {service.provider.phone}
                    </p>
                  </div>
                </a>
              )}

              {/* WhatsApp */}
              {service.provider?.phone && (
                <a
                  href={`https://wa.me/${service.provider.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
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
              {service.provider?.email && (
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${service.provider.email}&su=Inquiry about ${encodeURIComponent(displayService.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#D7490C] hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-[#D7490C]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#D7490C] break-all">
                      {service.provider.email}
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

export default ServiceDetail;