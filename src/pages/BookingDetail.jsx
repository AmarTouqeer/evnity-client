import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reviewAPI } from "../services/api";

import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Upload,
  Loader2,
  Hourglass,
  Ban,
  Star,
  BadgeCheck,
  Wallet,
} from "lucide-react";
import { bookingAPI, paymentAPI } from "../services/api";

const BookingDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const isProvider = user?.role === "provider";
  const isCustomer = user?.role === "customer";

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [manualMethodType, setManualMethodType] = useState("");
  const [manualTransactionId, setManualTransactionId] = useState("");
  const [manualUploading, setManualUploading] = useState(false);
  const [manualConfirming, setManualConfirming] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [pollingStripe, setPollingStripe] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState(null);
  const [completingBooking, setCompletingBooking] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────
  const extractBooking = (response) => {
    if (!response) return null;
    if (response.data?.booking) return response.data.booking;
    if (response.booking) return response.booking;
    if (response.data && !Array.isArray(response.data)) return response.data;
    return response;
  };

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getById(id);
      const bookingData = extractBooking(response);
      if (!bookingData) throw new Error("Booking not found");
      setBooking(bookingData);
    } catch (err) {
      console.error("Error fetching booking:", err);
      setError(err.message || "Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

 // In your api service file, add:
// paymentAPI.verifyStripeSession = (sessionId, bookingId) =>
//   api.post('/payments/stripe/verify-session', { sessionId, bookingId });

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");
  if (!sessionId) return;

  setStripeSessionId(sessionId);
  setPollingStripe(true);

  let attempts = 0;
  const maxAttempts = 10;
  let timeoutId = null;

  const tryVerify = async () => {
    attempts++;
    console.log(`🔄 verifyStripeSession attempt ${attempts}/${maxAttempts}`);
    try {
      const response = await paymentAPI.verifyStripeSession(sessionId, id);
      console.log("✅ verifyStripeSession response:", response);

      if (response?.success || response?.alreadyPaid) {
        const bookingData = extractBooking(response);
        if (bookingData) setBooking(bookingData);
        else await fetchBooking();
        setPollingStripe(false);
        return; // done
      }
    } catch (err) {
      console.error(`verifyStripeSession attempt ${attempts} failed:`, err);
    }

    // retry if not done yet
    if (attempts < maxAttempts) {
      timeoutId = setTimeout(tryVerify, 3000);
    } else {
      console.warn("Max verify attempts reached");
      setPollingStripe(false);
    }
  };

  tryVerify();

  // cleanup on unmount
  return () => { if (timeoutId) clearTimeout(timeoutId); };
}, [location.search, id]);

// Fallback polling — only runs if verifyNow didn't confirm yet
useEffect(() => {
  if (!stripeSessionId || !pollingStripe) return;
  let cancelled = false;

  const interval = setInterval(async () => {
    if (cancelled) return;
    try {
      // ✅ Call verify again, not just getById — only verify writes to DB
      const response = await paymentAPI.verifyStripeSession(stripeSessionId, id);
      console.log("🔁 Fallback verify:", response);
      if (response?.success || response?.alreadyPaid) {
        const bookingData = extractBooking(response);
        if (bookingData) {
          setBooking(bookingData);
          setPollingStripe(false);
          clearInterval(interval);
        }
      }
    } catch (err) {
      console.error("Polling verify error:", err);
    }
  }, 4000);

  return () => { cancelled = true; clearInterval(interval); };
}, [stripeSessionId, pollingStripe, id]);

 

  useEffect(() => {
    const paymentOptions =
      booking?.event?.paymentOptions ||
      booking?.service?.paymentOptions ||
      booking?.resource?.paymentOptions ||
      {};
    if (paymentOptions?.manual?.enabled) {
      const methods = (paymentOptions.manual.methods || []).filter(
        (m) => m.isActive !== false
      );
      if (!manualMethodType && methods.length > 0) {
        setManualMethodType(methods[0].type);
      }
    }
  }, [booking, manualMethodType]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload only JPG, PNG, or PDF files");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB");
      return;
    }
    setReceiptFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleManualUpload = async (e) => {
    e.preventDefault();
    if (!receiptFile) { alert("Please upload a receipt file first."); return; }
    if (!manualMethodType) { alert("Please select a payment method."); return; }
    try {
      setManualUploading(true);
      const formData = new FormData();
      formData.append("receipt", receiptFile);
      formData.append("methodType", manualMethodType);
      if (manualTransactionId) formData.append("transactionId", manualTransactionId);
      const response = await bookingAPI.uploadReceipt(id, formData);
      if (response && response.success === false) {
        throw new Error(response.message || "Failed to upload receipt");
      }
      await fetchBooking();
      alert("Receipt uploaded successfully! The provider/admin will review it soon.");
    } catch (err) {
      console.error("Error uploading receipt:", err);
      alert(err.message || "Failed to upload receipt. Please try again.");
    } finally {
      setManualUploading(false);
    }
  };

  const handleManualConfirm = async () => {
    try {
      setManualConfirming(true);
      const response = await bookingAPI.confirm(id);
      if (!response || response.success === false) {
        throw new Error(response?.message || "Failed to confirm booking");
      }
      const bookingData = extractBooking(response);
      if (bookingData) setBooking(bookingData);
      else await fetchBooking();
      alert("Booking confirmed with manual payment.");
    } catch (err) {
      console.error("Error confirming booking:", err);
      alert(err.message || "Failed to confirm booking. Please try again.");
    } finally {
      setManualConfirming(false);
    }
  };

  const handleStripeCheckout = async () => {
    try {
      setStripeLoading(true);
      localStorage.setItem("stripeBookingId", id);
      const response = await paymentAPI.createStripeCheckoutSession(id);
      if (!response || response.success === false) {
        throw new Error(response?.message || "Failed to start Stripe checkout session");
      }
      const sessionUrl = response.data?.url || response.url || response.sessionUrl;
      if (!sessionUrl) throw new Error("Stripe checkout URL not returned by server");
      window.location.href = sessionUrl;
    } catch (err) {
      console.error("Error starting Stripe checkout:", err);
      alert(err.message || "Failed to start Stripe payment. Please try again.");
    } finally {
      setStripeLoading(false);
    }
  };

  // Provider: accept payment → mark booking as completed
  const handleAcceptPayment = async () => {
    try {
      setCompletingBooking(true);
      const response = await bookingAPI.complete(booking._id);
      if (!response || response.success === false) {
        throw new Error(response?.message || "Failed to accept payment");
      }
      const bookingData = extractBooking(response);
      if (bookingData) setBooking(bookingData);
      else await fetchBooking();
    } catch (err) {
      console.error("Error accepting payment:", err);
      alert(err.message || "Failed to accept payment. Please try again.");
    } finally {
      setCompletingBooking(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { alert("Please select a star rating."); return; }
    setReviewSubmitting(true);
    try {
      const response = await reviewAPI.create({
        bookingId: booking._id,
        rating,
        comment: reviewText,
      });
      if (response.success) {
        setReviewSubmitted(true);
      } else {
        alert(response.message || "Failed to submit review.");
      }
    } catch (err) {
      alert(err.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // ── Loading / Error states ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#D7490C] mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "We could not find this booking."}</p>
          <button
            onClick={() => navigate(isProvider ? "/provider/dashboard" : "/bookings")}
            className="inline-flex items-center px-6 py-3 bg-[#D7490C] text-white rounded-lg hover:bg-[#B7410E] transition-colors"
          >
            {isProvider ? "Back to Dashboard" : "Back to My Bookings"}
          </button>
        </div>
      </div>
    );
  }

  // ── Derived data ───────────────────────────────────────────────────
  const isEvent    = booking.bookingType === "event"    && booking.event;
  const isService  = booking.bookingType === "service"  && booking.service;
  const isResource = booking.bookingType === "resource" && booking.resource;

  const itemName =
    (isEvent    && (booking.event.title    || booking.event.name))   ||
    (isService  && (booking.service.title  || booking.service.name)) ||
    (isResource && booking.resource.name)                            ||
    "Booking";

  const itemLocation =
    (isEvent    && (booking.event.location?.address   || booking.event.location?.city)) ||
    (isService  && booking.service.location?.city)                                       ||
    (isResource && booking.resource.location?.city)                                      ||
    "Location TBA";

  const totalAmount      = booking.totalAmount || 0;
  const statusRaw        = booking.status      || "";
  const paymentStatusRaw = booking.paymentStatus || "pending";

  const isStatusPending = statusRaw === "pending";
  const isAccepted      = statusRaw === "accepted";
  const isConfirmed     = statusRaw === "confirmed";
  const isCompleted     = statusRaw === "completed";
  const isRejected      = statusRaw === "rejected" || statusRaw === "cancelled";

  const isPaid           = paymentStatusRaw === "paid";
  const paymentMethodRaw = booking.paymentMethod  || "none";
  const paymentProvider  = booking.paymentProvider || "";
  const paidAt           = booking.paidAt ? new Date(booking.paidAt) : null;

  const paymentStatusLabel =
    paymentStatusRaw === "paid"    ? "Paid"    :
    paymentStatusRaw === "partial" ? "Partial" : "Pending";

  const isStripePayment = paymentMethodRaw === "stripe" || paymentProvider === "stripe";
  const isManualPayment = paymentMethodRaw === "manual" || paymentProvider === "manual";
  const manualPayment   = booking.manualPayment || {};

  const paymentOptions =
    booking.event?.paymentOptions    ||
    booking.service?.paymentOptions  ||
    booking.resource?.paymentOptions ||
    {};

  const stripeEnabled  = !!paymentOptions.stripe?.enabled;
  const stripeCurrency = paymentOptions.stripe?.currency?.toUpperCase() || "PKR";
  const manualEnabled  = !!paymentOptions.manual?.enabled;
  const manualMethods  = manualEnabled
    ? (paymentOptions.manual?.methods || []).filter((m) => m.isActive !== false)
    : [];

  const canPayWithStripe        = isAccepted && !isPaid && stripeEnabled && !stripeLoading;
  const canUseManualPayment     = isAccepted && !isPaid && manualMethods.length > 0;
  const showManualConfirmButton = canUseManualPayment && !!booking.receipt?.url && !isPaid;

  // Provider can accept payment when paid but not yet completed
  const canProviderAcceptPayment = isProvider && isPaid && !isCompleted;

  const paymentMethodLabel = (() => {
    if (isStripePayment) return "Stripe (Online)";
    if (isManualPayment) {
      const mt = manualPayment.methodType;
      if (mt === "easypaisa")     return "Manual – Easypaisa";
      if (mt === "jazzcash")      return "Manual – JazzCash";
      if (mt === "bank_transfer") return "Manual – Bank Transfer";
      if (mt === "cash")          return "Manual – Cash";
      return "Manual Payment";
    }
    return "Not Set";
  })();

  const getStatusBadgeClasses = () => {
    if (isCompleted || isConfirmed) return "bg-green-100 text-green-700";
    if (isAccepted)                 return "bg-blue-100 text-blue-700";
    if (isStatusPending)            return "bg-yellow-100 text-yellow-700";
    if (isRejected)                 return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const paidAtFormatted = paidAt
    ? paidAt.toLocaleString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  const stepLabels = [
    { label: "Placed",   active: true },
    { label: isRejected ? "Rejected" : "Accepted", active: isAccepted || isConfirmed || isCompleted, rejected: isRejected },
    { label: "Paid",     active: isConfirmed || isCompleted },
    { label: "Done",     active: isCompleted },
  ];

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Booking Details</h1>
            <p className="text-orange-100 text-sm">
              {isProvider
                ? "Review customer booking and take action"
                : "Review your booking and complete payment"}
            </p>
          </div>
          <button
            onClick={() => navigate(isProvider ? "/provider/dashboard" : "/bookings")}
            className="text-sm border border-white/50 px-4 py-2 rounded-lg hover:bg-white hover:text-[#D7490C] transition-colors"
          >
            {isProvider ? "Back to Dashboard" : "Back to Bookings"}
          </button>
        </div>
      </div>

      {/* PAID global banner — customer only */}
      {isCustomer && isPaid && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl px-5 py-4 shadow-sm">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-green-100 flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-green-800">Payment Successful</p>
              <p className="text-xs text-green-600">
                Paid via <span className="font-semibold">{paymentMethodLabel}</span>
                {paidAtFormatted ? ` on ${paidAtFormatted}` : ""}
              </p>
            </div>
            <span className="flex-shrink-0 inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full tracking-widest uppercase">
              <CheckCircle className="w-3.5 h-3.5" />
              PAID
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Booking Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Booking ID:{" "}
                  <span className="font-mono text-gray-700">{booking._id}</span>
                </p>
                <h2 className="text-xl font-bold text-gray-900">{itemName}</h2>
                <p className="text-sm text-gray-600">
                  {isEvent ? "Event Booking" : isService ? "Service Booking" : isResource ? "Resource Booking" : "Booking"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeClasses()}`}>
                  Status: {statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)}
                </span>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-bold bg-green-600 text-white shadow-sm tracking-wide">
                    <CheckCircle className="w-3.5 h-3.5" />
                    PAID
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700">
                    Payment: {paymentStatusLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Progress stepper — customer only */}
            {isCustomer && (
              <div className="mt-2 px-2">
                <div className="flex items-center">
                  {stepLabels.map((step, i) => (
                    <div key={i} className="contents">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                            ${step.rejected
                              ? "bg-red-500 text-white"
                              : step.active
                                ? "bg-[#D7490C] text-white"
                                : "bg-gray-200 text-gray-500"}`}
                        >
                          {step.rejected ? "✕" : i + 1}
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 text-center w-16">{step.label}</span>
                      </div>
                      {i < stepLabels.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mb-4 transition-colors ${
                            stepLabels[i + 1].active ? "bg-[#D7490C]" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detail grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span>Event Date: {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "TBA"}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span>Time: {booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : "TBA"}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>{itemLocation}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                <span>
                  Total Amount:{" "}
                  <span className="font-semibold text-[#D7490C]">PKR {totalAmount.toLocaleString()}</span>
                </span>
              </div>
              {booking.quantity && (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                  <span>Quantity / Guests: {booking.quantity}</span>
                </div>
              )}
            </div>

            {booking.createdAt && (
              <p className="text-xs text-gray-500">
                Booked on{" "}
                {new Date(booking.createdAt).toLocaleString(undefined, {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
              <span className="text-xs px-3 py-1 rounded-full bg-orange-50 text-orange-700 font-medium">
                TEST PAYMENT ONLY
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <p className="text-gray-500 text-xs">Payment Status</p>
                {isPaid ? (
                  <p className="font-bold text-green-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-4 h-4" /> Paid
                  </p>
                ) : (
                  <p className="font-semibold">{paymentStatusLabel}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-xs">Payment Method</p>
                <p className="font-semibold">{paymentMethodLabel}</p>
              </div>
              {isStripePayment && booking.stripeCheckoutSessionId && (
                <div className="md:col-span-2 text-xs text-gray-600">
                  Stripe Session ID:{" "}
                  <span className="font-mono break-all">{booking.stripeCheckoutSessionId}</span>
                </div>
              )}
              {isStripePayment && booking.stripePaymentIntentId && (
                <div className="md:col-span-2 text-xs text-gray-600">
                  Stripe Payment Intent:{" "}
                  <span className="font-mono break-all">{booking.stripePaymentIntentId}</span>
                </div>
              )}
              {isManualPayment && manualPayment.methodType && (
                <div>
                  <p className="text-gray-500 text-xs">Manual Method</p>
                  <p className="font-semibold capitalize">{manualPayment.methodType.replace("_", " ")}</p>
                </div>
              )}
              {isManualPayment && manualPayment.transactionId && (
                <div>
                  <p className="text-gray-500 text-xs">Transaction ID</p>
                  <p className="font-mono text-xs break-all">{manualPayment.transactionId}</p>
                </div>
              )}
              {paidAt && (
                <div>
                  <p className="text-gray-500 text-xs">Paid At</p>
                  <p className="text-sm">{paidAtFormatted}</p>
                </div>
              )}

              {/* Fee breakdown — shown to both roles when paid */}
              {isPaid && booking.platformFee != null && (
                <div className="md:col-span-2 border-t border-gray-100 pt-3 mt-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Fee Breakdown
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-gray-500">Total Charged</p>
                      <p className="font-bold text-gray-900 mt-0.5">PKR {totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2 text-center">
                      <p className="text-orange-600">Platform Fee ({booking.platformFeePercentage}%)</p>
                      <p className="font-bold text-orange-700 mt-0.5">PKR {(booking.platformFee || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <p className="text-green-600">Provider Payout</p>
                      <p className="font-bold text-green-700 mt-0.5">PKR {(booking.providerPayout || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {stripeSessionId && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Returned from Stripe (TEST checkout)</p>
                  <p>We&apos;re waiting for Stripe&apos;s webhook to mark this booking as paid. This may take a few seconds.</p>
                  {pollingStripe && (
                    <p className="mt-1 flex items-center gap-1">
                      <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Checking payment status...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Manual payment instructions — customer, accepted, unpaid */}
          {isCustomer && isAccepted && !isPaid && manualMethods.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Manual Pakistani Payment Instructions</h3>
              <p className="text-xs text-gray-600">
                Follow these instructions to make a{" "}
                <span className="font-semibold">TEST manual payment</span> and then upload your receipt.
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                <li>Select one of the methods below and send the payment.</li>
                <li>Note down the transaction ID or reference number from your bank/wallet app.</li>
                <li>Upload a clear photo or PDF of your receipt.</li>
                <li>Submit for review, then confirm the booking once your payment has been uploaded.</li>
              </ol>
              <div className="mt-3 space-y-2 text-sm">
                {manualMethods.map((method, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="font-semibold text-gray-900">{method.label || method.type}</p>
                    {method.accountTitle  && <p className="text-xs text-gray-700">Account Title: {method.accountTitle}</p>}
                    {method.accountNumber && <p className="text-xs text-gray-700">Account / Wallet: {method.accountNumber}</p>}
                    {method.bankName      && <p className="text-xs text-gray-700">Bank: {method.bankName}</p>}
                    {method.iban          && <p className="text-xs text-gray-700">IBAN: {method.iban}</p>}
                    {method.instructions  && <p className="mt-1 text-xs text-gray-600">{method.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer review card */}
          {isCustomer && (isCompleted || isConfirmed) && isPaid && (
            <div className={`rounded-xl shadow-lg p-6 space-y-4 ${!reviewSubmitted ? "bg-gradient-to-br from-orange-50 to-white border border-orange-200" : "bg-white"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Star className={`w-5 h-5 ${!reviewSubmitted ? "text-yellow-500 fill-current" : "text-gray-400"}`} />
                  Rate Your Provider
                </h3>
              </div>

              {reviewSubmitted ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Review submitted</p>
                    <p className="text-xs text-green-600 mt-0.5">Thank you for your feedback!</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Your rating</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button
                          key={starValue}
                          type="button"
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(starValue)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              starValue <= (hoveredRating || rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                      {rating > 0 && (
                        <span className="text-sm font-semibold text-gray-700 ml-2">{rating} / 5</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Comment <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      maxLength={500}
                      disabled={reviewSubmitting}
                      placeholder="Share your experience with this provider..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent disabled:bg-gray-100 resize-none"
                    />
                    <p className="text-right text-[11px] text-gray-400 mt-0.5">{reviewText.length}/500</p>
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting || !rating}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white text-sm font-semibold hover:from-[#D7490C] hover:to-[#B7410E] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {reviewSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        Submit Rating
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="lg:col-span-1 space-y-6">

          {/* ════ PROVIDER PANEL ════ */}
          {isProvider && (
            <div className="bg-white rounded-xl shadow-lg p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Booking Actions</h3>

              {/* Customer info */}
              <div className="space-y-1 text-sm text-gray-700 border-b border-gray-100 pb-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Customer</p>
                <p className="font-semibold">{booking.customer?.name  || "N/A"}</p>
                <p className="text-gray-600">{booking.customer?.email || "N/A"}</p>
                <p className="text-gray-600">{booking.customer?.phone || "N/A"}</p>
              </div>

              {/* Uploaded receipt */}
              {booking.receipt?.url && (
                <div className="space-y-2 border-b border-gray-100 pb-4">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Payment Receipt</p>
                  <a
                    href={booking.receipt.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[#D7490C] font-semibold hover:underline"
                  >
                    <Upload className="w-4 h-4" />
                    View Uploaded Receipt
                  </a>
                  {booking.manualPayment?.transactionId && (
                    <p className="text-xs text-gray-600">
                      Transaction ID:{" "}
                      <span className="font-mono">{booking.manualPayment.transactionId}</span>
                    </p>
                  )}
                </div>
              )}

              {/* PENDING: accept / reject */}
              {isStatusPending && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Actions</p>
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800">
                    A customer is waiting for your response. Please accept or reject this booking.
                  </div>
                  <button
                    onClick={async () => {
                      try { await bookingAPI.accept(booking._id); await fetchBooking(); }
                      catch (err) { alert(err.message || "Failed to accept booking"); }
                    }}
                    className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Booking
                  </button>
                  <button
                    onClick={async () => {
                      const reason = prompt("Enter rejection reason:");
                      if (!reason) return;
                      try { await bookingAPI.reject(booking._id, reason); await fetchBooking(); }
                      catch (err) { alert(err.message || "Failed to reject booking"); }
                    }}
                    className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Booking
                  </button>
                </div>
              )}

              {/* ACCEPTED, awaiting payment */}
              {isAccepted && !isPaid && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-3 text-xs text-blue-800">
                  <p className="font-semibold mb-1">Waiting for customer payment</p>
                  <p>You have accepted this booking. The customer will now complete payment.</p>
                </div>
              )}

              {/* ── ACCEPT PAYMENT button — core new feature ── */}
              {canProviderAcceptPayment && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Payment Received</p>

                  {/* Receipt summary */}
                  <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-xs font-semibold text-green-800">Customer has completed payment</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-green-700 pt-2 border-t border-green-200">
                      <span className="text-green-600">Method</span>
                      <span className="font-semibold text-right">{paymentMethodLabel}</span>

                      <span className="text-green-600">Total Charged</span>
                      <span className="font-semibold text-right">PKR {totalAmount.toLocaleString()}</span>

                      {booking.platformFee != null && (
                        <>
                          <span className="text-green-600">Platform Fee</span>
                          <span className="font-semibold text-right text-orange-600">
                            − PKR {(booking.platformFee || 0).toLocaleString()}
                          </span>

                          <span className="text-green-700 font-semibold border-t border-green-200 pt-1">Your Payout</span>
                          <span className="font-bold text-green-800 text-right border-t border-green-200 pt-1">
                            PKR {(booking.providerPayout || 0).toLocaleString()}
                          </span>
                        </>
                      )}

                      {paidAtFormatted && (
                        <>
                          <span className="text-green-600">Paid on</span>
                          <span className="font-semibold text-right">{paidAtFormatted}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* The button itself */}
                  <button
                    type="button"
                    onClick={handleAcceptPayment}
                    disabled={completingBooking}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white text-sm font-bold hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                  >
                    {completingBooking ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="w-5 h-5" />
                        Accept Payment &amp; Complete Booking
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center">
                    Confirms you received the payment and marks the booking as completed.
                  </p>
                </div>
              )}

              {/* COMPLETED */}
              {isCompleted && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-4 flex items-start gap-3">
                  <BadgeCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Booking Completed</p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Payment accepted. No further actions needed.
                    </p>
                    {booking.providerPayout != null && (
                      <p className="text-xs font-semibold text-green-800 mt-2">
                        Your payout: PKR {(booking.providerPayout).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* REJECTED / CANCELLED */}
              {isRejected && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-3 text-xs text-red-800 flex items-start gap-2">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold capitalize">Booking {statusRaw}</p>
                    <p>This booking has been {statusRaw}. No further action needed.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ CUSTOMER PAYMENT PANEL ════ */}
          {isCustomer && (
            <>
              {/* Already paid */}
              {isPaid && (
                <div className="bg-white rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Payment Status</h3>
                  </div>
                  <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 font-semibold text-sm">Payment Completed</span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method</span>
                      <span className="font-medium text-gray-800">{paymentMethodLabel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-semibold text-[#D7490C]">PKR {totalAmount.toLocaleString()}</span>
                    </div>
                    {paidAtFormatted && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Paid on</span>
                        <span className="font-medium text-gray-800 text-right">{paidAtFormatted}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pending — waiting for provider */}
              {!isPaid && isStatusPending && (
                <div className="bg-white rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Hourglass className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-gray-900">Awaiting Provider Approval</h3>
                  </div>
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-4 space-y-2">
                    <p className="text-sm font-semibold text-yellow-800">Your booking request has been sent</p>
                    <p className="text-xs text-yellow-700">
                      The provider needs to <span className="font-semibold">accept</span> your booking
                      before you can complete payment.
                    </p>
                    <div className="pt-3 mt-1 border-t border-yellow-200 flex items-center justify-between text-xs text-yellow-700">
                      <span>Current status</span>
                      <span className="font-semibold bg-yellow-100 px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                  </div>
                  <Link
                    to="/notifications"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-[#D7490C] font-semibold hover:underline"
                  >
                    View notifications →
                  </Link>
                </div>
              )}

              {/* Rejected */}
              {!isPaid && isRejected && (
                <div className="bg-white rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Ban className="w-5 h-5 text-red-500" />
                    <h3 className="font-semibold text-gray-900">
                      Booking {statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1)}
                    </h3>
                  </div>
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-4 space-y-1">
                    <p className="text-sm text-red-700">
                      This booking was <span className="font-semibold">{statusRaw}</span> by the provider.
                      No payment is required.
                    </p>
                    {booking.rejectionReason && (
                      <p className="text-xs text-red-600">
                        Reason: <span className="italic">{booking.rejectionReason}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Stripe pay */}
              {canPayWithStripe && (
                <div className="bg-white rounded-xl shadow-lg p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-5 h-5 text-[#D7490C]" />
                    <h3 className="font-semibold text-gray-900">Pay with Card (Stripe – Test)</h3>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800 font-medium">
                    ✓ Provider accepted your booking — complete payment to confirm
                  </div>
                  <p className="text-xs text-gray-600">
                    Use Stripe&apos;s test checkout to simulate a card payment in{" "}
                    <span className="font-semibold">{stripeCurrency}</span>. This is{" "}
                    <span className="font-semibold">TEST ONLY</span> — no real cards will be charged.
                  </p>
                  <button
                    type="button"
                    onClick={handleStripeCheckout}
                    disabled={stripeLoading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white text-sm font-semibold hover:from-[#D7490C] hover:to-[#B7410E] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {stripeLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Redirecting to Stripe...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay with Stripe (TEST)
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-gray-500">
                    Test card: 4242 4242 4242 4242 — any future expiry and CVC.
                  </p>
                </div>
              )}

              {/* Manual pay */}
              {canUseManualPayment && (
                <div className="bg-white rounded-xl shadow-lg p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="w-5 h-5 text-[#D7490C]" />
                    <h3 className="font-semibold text-gray-900">Manual Payment – Upload Receipt</h3>
                  </div>
                  {!canPayWithStripe && (
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800 font-medium">
                      ✓ Provider accepted your booking — complete payment to confirm
                    </div>
                  )}

                  <form onSubmit={handleManualUpload} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method Used</label>
                      <select
                        value={manualMethodType}
                        onChange={(e) => setManualMethodType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                        required
                      >
                        <option value="">Select method</option>
                        {manualMethods.map((method) => (
                          <option key={method.type} value={method.type}>{method.label || method.type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Transaction ID / Reference</label>
                      <input
                        type="text"
                        value={manualTransactionId}
                        onChange={(e) => setManualTransactionId(e.target.value)}
                        placeholder="e.g., TXN123456789"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Upload Receipt</label>
                      {!receiptFile ? (
                        <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#D7490C] transition-colors text-center px-3">
                          <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-600">Click to upload or drag and drop</span>
                          <span className="text-[11px] text-gray-500">JPG, PNG or PDF (max 5MB)</span>
                        </label>
                      ) : (
                        <div className="border border-gray-300 rounded-lg p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{receiptFile.name}</p>
                              <p className="text-gray-500">{(receiptFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                          {receiptPreview && (
                            <img src={receiptPreview} alt="Receipt preview" className="mt-3 max-h-40 mx-auto rounded border border-gray-200" />
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={manualUploading || !receiptFile}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white text-sm font-semibold hover:from-[#D7490C] hover:to-[#B7410E] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {manualUploading ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Upload Receipt (TEST)</>
                      )}
                    </button>
                  </form>

                  {showManualConfirmButton && (
                    <div className="mt-4 border-t border-gray-200 pt-3 space-y-2">
                      <p className="text-xs text-gray-600">Receipt uploaded. You can now confirm this booking.</p>
                      <button
                        type="button"
                        onClick={handleManualConfirm}
                        disabled={manualConfirming}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-green-600 text-green-700 text-sm font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {manualConfirming ? (
                          <><span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> Confirming...</>
                        ) : (
                          <><CheckCircle className="w-4 h-4" /> Confirm Booking (Manual – TEST)</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Accepted but no payment method configured */}
              {isAccepted && !isPaid && !canPayWithStripe && !canUseManualPayment && (
                <div className="bg-white rounded-xl shadow-lg p-5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">No Payment Method Available</h3>
                  </div>
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-3 text-xs text-yellow-800">
                    <p className="font-semibold mb-1">Booking accepted — payment not set up</p>
                    <p>The provider has not configured a payment method. Please contact them directly.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;