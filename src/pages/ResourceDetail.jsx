import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Package,
  Truck,
  Loader2,
} from "lucide-react";
import { resourceAPI, bookingAPI } from "../services/api";

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingError, setBookingError] = useState("");

  // Fetch resource details from API
  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching resource with ID:", id);
        const response = await resourceAPI.getById(id);
        console.log("Resource API response:", response);

        // Backend returns: { success: true, data: { resource } }
        setResource(response.data.resource || response.data);

        // Set minimum quantity
        const resourceData = response.data.resource || response.data;
        if (resourceData?.minOrder) {
          setQuantity(resourceData.minOrder);
        }
      } catch (err) {
        console.error("Error fetching resource:", err);
        setError(err.message || "Failed to load resource details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id]);

  // Transform resource data for display
  const displayResource = resource
    ? {
        id: resource._id,
        name: resource.name || resource.title || "Unnamed Resource",
        provider:
          resource.provider?.providerInfo?.businessName ||
          resource.provider?.name ||
          "Unknown Provider",
        location:
          typeof resource.location === "object"
            ? resource.location?.city || resource.city || "Not specified"
            : resource.city || resource.location || "Not specified",
        category: resource.category || "General",
        image: resolveImage(resource.images?.[0] ?? resource.image),
        gallery: (resource.images || [])
          .slice(0, 4)
          .map((img) => resolveImage(img)),
        rating: resource.averageRating || resource.rating || 0,
        reviews: resource.reviews || [],
        pricePerUnit: resource.rentalPrice || resource.price || 0,
        priceUnit: resource.priceUnit || "per day",
        availableQuantity: resource.availableQuantity || resource.quantity || 0,
        minOrder: resource.minOrder || 1,
        description: resource.description || "No description available",
        specifications: resource.specifications || [],
        features: resource.features || [],
        providerInfo: {
          name:
            resource.provider?.providerInfo?.businessName ||
            resource.provider?.name ||
            "Unknown Provider",
          rating:
            resource.provider?.rating ||
            resource.provider?.providerInfo?.rating ||
            0,
          responseTime: "Within 2 hours",
          verified: resource.provider?.isVerified || false,
          memberSince: resource.provider?.createdAt
            ? new Date(resource.provider.createdAt).getFullYear()
            : "2024",
          totalRentals:
            resource.provider?.totalRentals ||
            resource.provider?.providerInfo?.totalBookings ||
            0,
        },
      }
    : null;

  // Payment options (read-only)
  const paymentOptions = resource?.paymentOptions || {};
  const stripeEnabled = !!paymentOptions.stripe?.enabled;
  const stripeCurrency = paymentOptions.stripe?.currency?.toUpperCase() || "PKR";
  const manualEnabled = !!paymentOptions.manual?.enabled;
  const manualMethods = manualEnabled
    ? (paymentOptions.manual?.methods || []).filter((m) => m.isActive !== false)
    : [];

  // Resolve image URL
  function resolveImage(img) {
    const placeholder =
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800";
    if (!img) return placeholder;
    if (typeof img === "object") {
      return img.url || img.secure_url || img.path || placeholder;
    }
    if (typeof img === "string") {
      if (img.startsWith("http") || img.startsWith("//")) return img;
      if (img.startsWith("/")) {
        const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
        return `${base.replace(/\/$/, "")}${img}`;
      }
      return img;
    }
    return placeholder;
  }

  const calculateTotal = () => {
    if (!selectedStartDate || !selectedEndDate || !displayResource) return 0;
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return displayResource.pricePerUnit * quantity * days;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!displayResource) return;

    if (quantity < displayResource.minOrder) {
      setBookingError(
        `Minimum order quantity is ${displayResource.minOrder} units.`
      );
      return;
    }

    try {
      setBookingError("");
      const bookingData = {
        bookingType: "resource",
        resourceId: id,
        eventDate: selectedStartDate,
        endDate: selectedEndDate,
        startTime: "09:00 AM", // Default start time for resources
        endTime: "11:59 PM", // Default end time for resources
        quantity: quantity,
        totalPrice: calculateTotal(),
      };

      console.log("Creating resource booking:", bookingData);
      const response = await bookingAPI.create(bookingData);
      console.log("Booking response:", response);

      alert("Rental request submitted! The provider will contact you soon.");
      setShowBookingModal(false);

      // Navigate to bookings page after successful booking
      setTimeout(() => navigate("/bookings"), 1500);
    } catch (err) {
      console.error("Booking error:", err);
      const errorMessage = err.message || "Failed to create booking";
      setBookingError(errorMessage);

      // Auto-close modal on conflict/error after showing message
      if (errorMessage.includes("already booked")) {
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingError("");
        }, 3000);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D7490C] mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading resource details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !displayResource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-600 font-medium mb-4">
              {error || "Resource not found"}
            </p>
            <Link
              to="/resources"
              className="inline-flex items-center px-4 py-2 bg-[#D7490C] text-white rounded-lg hover:bg-[#B7410E]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            to="/resources"
            className="flex items-center text-[#D7490C] hover:text-[#B7410E] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Resources
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="lg:col-span-1">
            <img
              src={displayResource.image}
              alt={displayResource.name}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {displayResource.gallery.length > 0 ? (
              displayResource.gallery.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-44 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                />
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center h-44 bg-gray-200 rounded-lg">
                <p className="text-gray-500">No additional images</p>
              </div>
            )}
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
                    {displayResource.name}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-1" />
                      {displayResource.location}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-1 text-yellow-500 fill-current" />
                      {displayResource.rating} ({displayResource.reviews.length}{" "}
                      reviews)
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-[#D7490C] rounded-full text-sm font-medium">
                      {displayResource.category}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        displayResource.availableQuantity > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {displayResource.availableQuantity > 0
                        ? `${displayResource.availableQuantity} Available`
                        : "Out of Stock"}
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
                <DollarSign className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Price</div>
                  <div className="font-semibold text-gray-900">
                    PKR {displayResource.pricePerUnit}
                  </div>
                  <div className="text-xs text-gray-500">
                    {displayResource.priceUnit}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Package className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Available</div>
                  <div className="font-semibold text-gray-900">
                    {displayResource.availableQuantity} units
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Min Order</div>
                  <div className="font-semibold text-gray-900">
                    {displayResource.minOrder} units
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Truck className="w-6 h-6 text-[#D7490C] mr-3" />
                <div>
                  <div className="text-sm text-gray-600">Delivery</div>
                  <div className="font-semibold text-gray-900">
                    Free in city
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Product Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {displayResource.description}
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
                  This resource uses demo/test payment flows. You will not be
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

            {/* Specifications */}
            {displayResource.specifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayResource.specifications.map((spec, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                      {spec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {displayResource.features.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Rental Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayResource.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center text-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {displayResource.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Customer Reviews
                </h2>
                <div className="space-y-6">
                  {displayResource.reviews.map((review) => (
                    <div
                      key={review.id || review._id}
                      className="border-b border-gray-200 pb-6 last:border-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white font-bold mr-3">
                            {(
                              review.author ||
                              review.customer?.name ||
                              "A"
                            ).charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {review.author ||
                                review.customer?.name ||
                                "Anonymous"}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(
                                review.date || review.createdAt
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About the Provider
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#B7410E] to-[#D7490C] rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {displayResource.providerInfo.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {displayResource.providerInfo.name}
                      </h3>
                      {displayResource.providerInfo.verified && (
                        <CheckCircle className="w-5 h-5 text-blue-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                        {displayResource.providerInfo.rating} Rating
                      </div>
                      <span>•</span>
                      <span>
                        Member since {displayResource.providerInfo.memberSince}
                      </span>
                      <span>•</span>
                      <span>
                        {displayResource.providerInfo.totalRentals} rentals
                      </span>
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
                <div className="text-sm text-gray-600 mb-1">Rental Price</div>
                <div className="text-3xl font-bold text-[#D7490C]">
                  PKR {displayResource.pricePerUnit}
                </div>
                <div className="text-sm text-gray-600">
                  {displayResource.priceUnit}
                </div>
              </div>

              {bookingError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{bookingError}</p>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowBookingModal(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={selectedStartDate}
                    onChange={(e) => setSelectedStartDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={selectedEndDate}
                    onChange={(e) => setSelectedEndDate(e.target.value)}
                    min={
                      selectedStartDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (Min: {displayResource.minOrder})
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={displayResource.minOrder}
                    max={displayResource.availableQuantity}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                  />
                </div>

                {selectedStartDate && selectedEndDate && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Estimated Total
                      </span>
                      <span className="text-2xl font-bold text-[#D7490C]">
                        PKR {calculateTotal().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {quantity} units ×{" "}
                      {Math.ceil(
                        (new Date(selectedEndDate) -
                          new Date(selectedStartDate)) /
                          (1000 * 60 * 60 * 24)
                      ) + 1}{" "}
                      days
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50"
                  disabled={displayResource.availableQuantity === 0}
                >
                  {displayResource.availableQuantity > 0
                    ? "Request Rental"
                    : "Out of Stock"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Rental Request
            </h2>
            {bookingError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{bookingError}</p>
              </div>
            )}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Resource:</span>
                <span className="font-semibold text-right">
                  {displayResource.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold">{quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Period:</span>
                <span className="font-semibold">
                  {new Date(selectedStartDate).toLocaleDateString()} -{" "}
                  {new Date(selectedEndDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-[#D7490C]">
                  PKR {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBooking}
                disabled={!!bookingError}
                className="flex-1 py-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all disabled:opacity-50"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingError("");
                }}
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

export default ResourceDetail;
