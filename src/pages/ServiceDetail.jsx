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
  const { user } = useAuth();
  // Time slot options for services
  const timeSlots = [
    { value: "09:00 AM-01:00 PM", label: "Morning (9:00 AM - 1:00 PM)" },
    { value: "02:00 PM-06:00 PM", label: "Afternoon (2:00 PM - 6:00 PM)" },
    { value: "06:00 PM-11:00 PM", label: "Evening (6:00 PM - 11:00 PM)" },
  ];

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
      // Split the selected time slot
      const [startTime, endTime] = selectedTime.split("-");

      const bookingData = {
        bookingType: "service",
        serviceId: service._id,
        eventDate: selectedDate,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        customerNotes: customerNotes,
      };

      console.log("Booking data being sent:", bookingData);

      const response = await bookingAPI.create(bookingData);

      if (response.success) {
        alert(
          "Booking request submitted successfully! Provider will review and respond."
        );
        setShowBookingModal(false);
        setSelectedDate("");
        setSelectedTime("");
        setCustomerNotes("");
        // Optionally redirect to bookings page
        // window.location.href = "/bookings";
      } else {
        // Show appropriate error message
        const errorMessage = response.message || "Failed to create booking";
        alert(errorMessage);

        // If it's a double booking error, close modal and let user select different time
        if (response.message && response.message.includes("already booked")) {
          setShowBookingModal(false);
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error.message || "Failed to create booking. Please try again.";
      alert(errorMessage);

      // If it's a double booking error, close modal
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
            The service you're looking for doesn't exist.
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

  // Sample service data - In real app, fetch based on id
  const sampleService = {
    id: 1,
    name: "Professional Wedding Photography Package",
    provider: "Capture Moments Studio",
    location: "Lahore",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
    rating: 4.9,
    reviews: 87,
    price: 25000,
    priceUnit: "per event",
    experience: "8 years",
    completedProjects: 250,
    description:
      "We specialize in capturing the most precious moments of your special day. Our team of professional photographers uses state-of-the-art equipment and creative techniques to deliver stunning, timeless photographs that you'll cherish forever. We offer comprehensive packages including pre-wedding shoots, ceremony coverage, and reception documentation.",
    services: [
      "Full day coverage (12 hours)",
      "Professional photographer + assistant",
      "Pre-wedding photoshoot",
      "Candid and traditional photography",
      "4K videography",
      "Same-day video highlights",
      "300+ edited photos",
      "Premium photo album",
      "All raw files included",
      "Online gallery access",
    ],
    equipment: [
      "Canon EOS R5 cameras",
      "Professional lighting setup",
      "4K cinema cameras",
      "Drone photography",
      "Backup equipment",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400",
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400",
    ],
    providerInfo: {
      name: "Capture Moments Studio",
      rating: 4.9,
      responseTime: "Within 1 hour",
      verified: true,
      memberSince: "2017",
      completedBookings: 250,
    },
    reviews: [
      {
        id: 1,
        author: "Ayesha Khan",
        rating: 5,
        date: "2024-01-15",
        comment:
          "Absolutely phenomenal work! The team was professional, creative, and captured every moment beautifully. Highly recommended!",
      },
      {
        id: 2,
        author: "Ali Hassan",
        rating: 5,
        date: "2024-02-20",
        comment:
          "Best photography service in Lahore! The photos exceeded our expectations. Thank you for making our day memorable.",
      },
      {
        id: 3,
        author: "Fatima Ahmed",
        rating: 4,
        date: "2024-03-10",
        comment:
          "Great service and beautiful photos. Very professional team. The only minor issue was a slight delay in delivery.",
      },
    ],
  };

  // Transform service data for display
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
    services: service.pricing?.packages?.map((pkg) => pkg.name) || [
      "Service details not available",
    ],
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
    reviews: [], // Reviews would come from a separate API call
  };

  // Payment options (read-only)
  const paymentOptions = service.paymentOptions || {};
  const stripeEnabled = !!paymentOptions.stripe?.enabled;
  const stripeCurrency = paymentOptions.stripe?.currency?.toUpperCase() || "PKR";
  const manualEnabled = !!paymentOptions.manual?.enabled;
  const manualMethods = manualEnabled
    ? (paymentOptions.manual?.methods || []).filter((m) => m.isActive !== false)
    : [];

  const handleBooking = (e) => {
    e.preventDefault();
    alert("Booking request submitted! The provider will contact you soon.");
    setShowBookingModal(false);
  };

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
                {/* <div className="flex gap-2">
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-red-50">
                    <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                  </button>
                </div> */}
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
                                <>
                                  {" "}
                                  – {method.accountNumber}
                                </>
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
                  What's Included
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayService.services.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700"
                    >
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
                    <div
                      key={index}
                      className="flex items-center text-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewsSection
              entityId={id}
              type="service"
              currentUser={user}
            />

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
                <button className="flex items-center gap-2 px-6 py-2 border border-[#D7490C] text-[#D7490C] rounded-lg hover:bg-orange-50 transition-colors">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slot *
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>

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

      {/* Booking Modal */}
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
                  {timeSlots.find((slot) => slot.value === selectedTime)
                    ?.label || selectedTime}
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
    </div>
  );
};

export default ServiceDetail;
