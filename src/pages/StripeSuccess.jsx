import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { paymentAPI } from "../services/api";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

const StripeSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const loadPaymentDetails = async () => {
      const storedBookingId = localStorage.getItem("stripeBookingId");

      if (!storedBookingId) {
        setLoading(false);
        setError(
          "Payment completed, but we could not find the related booking. Please check your bookings list."
        );
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await paymentAPI.getBookingPaymentDetails(
          storedBookingId
        );
        if (response.success && response.data?.booking) {
          setPaymentDetails(response.data.booking);
        } else {
          setError(response.message || "Failed to load payment details.");
        }
      } catch (err) {
        setError(err.message || "Failed to load payment details.");
      } finally {
        setLoading(false);
        // Clear once we've used it
        localStorage.removeItem("stripeBookingId");
      }
    };

    loadPaymentDetails();
  }, []);

  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Successful (Test)
              </h1>
              <p className="text-sm text-gray-600">
                Your Stripe test payment has been completed. This is a demo
                transaction and no real money has been charged.
              </p>
            </div>
          </div>

          {sessionId && (
            <p className="text-xs text-gray-500 mb-4">
              Stripe Session ID:{" "}
              <span className="font-mono break-all">{sessionId}</span>
            </p>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading updated booking and payment details...
            </div>
          )}

          {!loading && error && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!loading && paymentDetails && (
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Booking Summary
                </h2>
                <p className="text-sm text-gray-700">
                  Booking ID:{" "}
                  <span className="font-mono">{paymentDetails._id}</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Status:{" "}
                  <span className="font-semibold capitalize">
                    {paymentDetails.status}
                  </span>{" "}
                  • Payment:{" "}
                  <span className="font-semibold capitalize">
                    {paymentDetails.paymentStatus}
                  </span>
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Total Amount:{" "}
                  <span className="font-semibold text-[#D7490C]">
                    PKR {paymentDetails.totalAmount?.toLocaleString()}
                  </span>
                </p>
                {paymentDetails.paidAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Paid at:{" "}
                    {new Date(paymentDetails.paidAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Fee Breakdown
                </h2>
                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    Platform Fee ({paymentDetails.platformFeePercentage || 0}
                    %):{" "}
                    <span className="font-semibold">
                      PKR {paymentDetails.platformFee?.toLocaleString() || 0}
                    </span>
                  </p>
                  <p>
                    Provider Payout:{" "}
                    <span className="font-semibold">
                      PKR{" "}
                      {paymentDetails.providerPayout?.toLocaleString() || 0}
                    </span>
                  </p>
                  <p>
                    Payment Method:{" "}
                    <span className="font-semibold capitalize">
                      {paymentDetails.paymentMethod}
                    </span>
                  </p>
                  {paymentDetails.transferStatus && (
                    <p>
                      Transfer Status:{" "}
                      <span className="font-semibold capitalize">
                        {paymentDetails.transferStatus}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white text-sm font-semibold hover:from-[#D7490C] hover:to-[#B7410E]"
            >
              Go to My Bookings
            </button>
            {paymentDetails && (
              <Link
                to={`/bookings/${paymentDetails._id}`}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                View Booking Detail
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeSuccess;

