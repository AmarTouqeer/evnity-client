import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";

const VerifyOTP = () => {
  const [otp, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setOTP(value);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otp }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Email verified successfully! Redirecting...");

        // Update user data in localStorage
        const user = JSON.parse(localStorage.getItem("user"));
        user.isEmailVerified = true;
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect after 2 seconds
        setTimeout(() => {
          if (user.role === "admin") {
            // Admins go to admin dashboard
            navigate("/admin/dashboard");
          } else if (user.isApprovedByAdmin) {
            // Already approved users can access
            if (user.role === "provider") {
              navigate("/provider/dashboard");
            } else {
              navigate("/");
            }
          } else {
            // Not approved yet - go to pending approval page
            navigate("/pending-approval");
          }
        }, 2000);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/auth/resend-otp`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("OTP sent successfully! Please check your email.");
        setCountdown(60); // 60 seconds cooldown
        setOTP(""); // Clear OTP input
      } else {
        setError(data.message || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-2xl flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to your email address
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={handleChange}
                maxLength="6"
                placeholder="000000"
                className="w-full px-4 py-4 border border-gray-300 rounded-lg text-center text-3xl tracking-widest font-bold focus:ring-2 focus:ring-[#D7490C] focus:border-transparent"
                autoFocus
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Code expires in 10 minutes
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#B7410E] to-[#D7490C] hover:from-[#D7490C] hover:to-[#B7410E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D7490C] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center">
                  Verify Email
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
              className="inline-flex items-center text-[#D7490C] hover:text-[#B7410E] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isResending ? "animate-spin" : ""}`}
              />
              {countdown > 0
                ? `Resend in ${countdown}s`
                : isResending
                ? "Sending..."
                : "Resend Code"}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Having trouble?{" "}
              <a href="#" className="text-[#D7490C] hover:text-[#B7410E]">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
