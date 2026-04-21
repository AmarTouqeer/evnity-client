import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
    setMessage("");
  };

  const validateEmail = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setIsSuccess(true);
        setEmail(""); // Clear email field
      } else {
        setError(
          data.message || "Failed to send reset link. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
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
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email and we'll send you reset instructions
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          {isSuccess ? (
            // Success State
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Check Your Email
              </h3>
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm">{message}</p>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                We've sent password reset instructions to your email address.
                Please check your inbox and spam folder.
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white py-3 rounded-lg font-semibold hover:from-[#D7490C] hover:to-[#B7410E] transition-all duration-200"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setMessage("");
                  }}
                  className="block w-full text-[#D7490C] hover:text-[#B7410E] font-medium transition-colors"
                >
                  Send Another Link
                </button>
              </div>
            </div>
          ) : (
            // Form State
            <>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email Input */}
                <div className="mb-6">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={handleChange}
                      className={`appearance-none relative block w-full pl-10 pr-3 py-3 border ${
                        error ? "border-red-300" : "border-gray-300"
                      } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D7490C] focus:border-transparent transition-all duration-200`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#B7410E] to-[#D7490C] hover:from-[#D7490C] hover:to-[#B7410E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D7490C] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-[#D7490C] hover:text-[#B7410E] transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                💡 Helpful Tips
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>
                  • Check your spam/junk folder if you don't see the email
                </li>
                <li>• The reset link will expire in 30 minutes</li>
                <li>
                  • Make sure to use the email address associated with your
                  account
                </li>
                <li>
                  • Contact support if you don't receive the email within 5
                  minutes
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-[#D7490C] hover:text-[#B7410E] transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
