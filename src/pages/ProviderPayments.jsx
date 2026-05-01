import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingAPI } from "../services/api";
import { CheckCircle, Loader2, Wallet, XCircle } from "lucide-react";

const ProviderPayments = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaidBookings = async () => {
    try {
      setLoading(true);
      // Fetches all bookings for this provider where paymentStatus = "paid"
      const response = await bookingAPI.getProviderPaidBookings();
      const list = response?.data?.bookings || response?.bookings || response?.data || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPaidBookings(); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-[#D7490C]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold">Payments Received</h1>
          <p className="text-orange-100 text-sm mt-1">
            Bookings where customers have paid — accept to mark as completed
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            <Wallet className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No pending payments yet</p>
            <p className="text-sm mt-1">
              When a customer completes payment, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const itemName =
                booking.event?.title || booking.event?.name ||
                booking.service?.title || booking.service?.name ||
                booking.resource?.name || "Booking";

              const isCompleted = booking.status === "completed";
              const method = booking.paymentMethod === "stripe"
                ? "Stripe (Card)"
                : booking.manualPayment?.methodType
                  ? `Manual – ${booking.manualPayment.methodType}`
                  : "Manual";

              const paidAt = booking.paidAt
                ? new Date(booking.paidAt).toLocaleString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : null;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{itemName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {booking.customer?.name} · {booking.customer?.email}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                      <span>
                        Amount:{" "}
                        <span className="font-semibold text-[#D7490C]">
                          PKR {(booking.totalAmount || 0).toLocaleString()}
                        </span>
                      </span>
                      <span>Method: <span className="font-medium">{method}</span></span>
                      {paidAt && <span>Paid: {paidAt}</span>}
                      {booking.providerPayout != null && (
                        <span className="text-green-700 font-semibold">
                          Your payout: PKR {booking.providerPayout.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status / Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`/bookings/${booking._id}`)}
                          className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => navigate(`/bookings/${booking._id}`)}
                          className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                          Accept Payment
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderPayments;