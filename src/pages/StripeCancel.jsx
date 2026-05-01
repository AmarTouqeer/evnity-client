import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const StripeCancel = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    const bookingId = localStorage.getItem("stripeBookingId");
    if (bookingId) {
      navigate(`/bookings/${bookingId}`);
    } else {
      navigate("/bookings");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Payment Cancelled
              </h1>
              <p className="text-sm text-gray-600">
                Your Stripe test payment was cancelled before completion. No
                real money has been charged.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-700">
            You can retry the payment from your booking details page, or choose
            a manual payment method if available.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={handleTryAgain}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white text-sm font-semibold hover:from-[#D7490C] hover:to-[#B7410E]"
            >
              Back to Booking
            </button>
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50"
            >
              Go to My Bookings
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Note: This environment uses Stripe in test mode. Use only Stripe
            test cards and bank accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StripeCancel;

