import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ShieldCheck, LogOut, RefreshCw } from "lucide-react";

const PendingApproval = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isMounting, setIsMounting] = useState(true); // initial load spinner

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Always fetch fresh data from API — never trust stale localStorage
  const fetchFreshStatus = async (showSpinner = false) => {
    if (showSpinner) setIsChecking(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        // Token invalid or expired — send to login
        navigate("/login");
        return;
      }

      const data = await response.json();
      // /auth/me → { success: true, data: { user: { ... } } }
      const freshUser = data?.data?.user || data?.data || null;

      if (!freshUser) {
        navigate("/login");
        return;
      }

      // Keep localStorage in sync
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);

      return freshUser;
    } catch (err) {
      console.error("Failed to fetch status:", err);
      return null;
    } finally {
      if (showSpinner) setIsChecking(false);
    }
  };

  // On mount: load fresh user from API
  useEffect(() => {
    (async () => {
      setIsMounting(true);
      const freshUser = await fetchFreshStatus();
      setIsMounting(false);

      // If already approved redirect immediately — no need to stay on this page
      if (freshUser?.isApprovedByAdmin || freshUser?.adminApprovalStatus === "approved") {
        // Don't redirect — let them see the "Proceed to Login" button and click it
        // This makes the approval state visible and user-controlled
      }
    })();
  }, []);

  const handleCheckStatus = async () => {
    const freshUser = await fetchFreshStatus(true);

    if (!freshUser) {
      alert("Failed to check approval status. Please try again.");
      return;
    }

    if (freshUser.isApprovedByAdmin || freshUser.adminApprovalStatus === "approved") {
      // State is updated — button will swap to "Proceed to Login" automatically
      // No alert needed, the UI change is the feedback
    } else if (freshUser.adminApprovalStatus === "rejected") {
      alert(
        `Your account has been rejected.\nReason: ${freshUser.adminRejectionReason || "Not specified"}`
      );
    } else {
      alert(" Your account is still pending approval. Please check back later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isApproved = user?.isApprovedByAdmin || user?.adminApprovalStatus === "approved";
  const isRejected = user?.adminApprovalStatus === "rejected";
  const cnic = user?.providerInfo?.cnic || user?.CNIC || null;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  if (isMounting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D7490C] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Checking account status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div
            className={`px-8 py-12 text-center transition-colors duration-500 ${
              isApproved
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : isRejected
                ? "bg-gradient-to-r from-red-600 to-red-700"
                : "bg-gradient-to-r from-[#B7410E] to-[#D7490C]"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className="relative">
                {isApproved ? (
                  <ShieldCheck className="w-20 h-20 text-white" />
                ) : (
                  <Clock className="w-20 h-20 text-white animate-pulse" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isApproved
                ? "Account Approved!"
                : isRejected
                ? "Account Rejected"
                : "Pending Admin Approval"}
            </h1>
            <p className="text-white/80 text-lg">
              {isApproved
                ? "You can now log in and access all features"
                : isRejected
                ? "Your account could not be approved"
                : "Your account is being reviewed"}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">

            {/* Account Details */}
            {user ? (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Name</span>
                    <span>{user.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email</span>
                    <span>{user.email || "—"}</span>
                  </div>
                  {user.phone && (
                    <div className="flex justify-between">
                      <span className="font-medium">Phone</span>
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.city && (
                    <div className="flex justify-between">
                      <span className="font-medium">City</span>
                      <span>{user.city}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Role</span>
                    <span className="capitalize">{user.role || "—"}</span>
                  </div>
                  {user.role === "provider" && cnic && (
                    <div className="flex justify-between">
                      <span className="font-medium">CNIC</span>
                      <span className="font-mono tracking-widest bg-gray-100 px-2 py-0.5 rounded">
                        {cnic}
                      </span>
                    </div>
                  )}
                  {user.role === "provider" && user.providerInfo?.businessName && (
                    <div className="flex justify-between">
                      <span className="font-medium">Business</span>
                      <span>{user.providerInfo.businessName}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-medium">Status</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        statusColors[user.adminApprovalStatus] || statusColors.pending
                      }`}
                    >
                      {user.adminApprovalStatus
                        ? user.adminApprovalStatus.charAt(0).toUpperCase() +
                          user.adminApprovalStatus.slice(1)
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-500 text-center">
                Loading account details...
              </div>
            )}

            {/* Steps — hide when approved or rejected */}
            {!isApproved && !isRejected && (
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Registration Complete</h3>
                    <p className="text-gray-600 text-sm">
                      You have successfully registered and verified your email.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Awaiting Admin Review</h3>
                    <p className="text-gray-600 text-sm">
                      Our admin team is reviewing your account. This usually takes 24–48 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Next Steps</h3>
                    <p className="text-gray-600 text-sm">
                      Once approved, you'll have full access to all features. We'll notify you via email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approved success message */}
            {isApproved && (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-semibold mb-1">
                   Your account has been approved!
                </p>
                <p className="text-sm text-green-700">
                  You can now log in and access all features of your{" "}
                  <span className="capitalize font-medium">{user?.role}</span> account.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isApproved ? (
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Proceed to Login
                </button>
              ) : (
                <button
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white rounded-lg hover:from-[#A03A0C] hover:to-[#C0400B] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <RefreshCw className={`w-5 h-5 ${isChecking ? "animate-spin" : ""}`} />
                  {isChecking ? "Checking..." : "Check Approval Status"}
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>

            {/* Tip — only when pending */}
            {!isApproved && !isRejected && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Click "Check Approval Status" to refresh.
                  You'll also receive an email notification once the review is complete.
                </p>
              </div>
            )}

            {/* Rejection box */}
            {isRejected && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-semibold mb-1"> Account Rejected</p>
                <p className="text-sm text-red-700">
                  <strong>Reason:</strong>{" "}
                  {user?.adminRejectionReason || "Not specified"}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Please contact support if you believe this is an error.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a href="mailto:support@evnity.com" className="text-[#D7490C] hover:underline font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;