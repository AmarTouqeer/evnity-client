import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Number with gradient */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-[#B7410E] to-[#D7490C] bg-clip-text text-transparent">
            404
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#B7410E] to-[#D7490C] mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-lg mb-2">
            The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500">
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white font-semibold rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all duration-300 transform hover:scale-105"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </button>

            <Link
              to="/events"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Search className="mr-2 h-4 w-4" />
              Browse Events
            </Link>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              to="/login"
              className="text-[#D7490C] hover:text-[#B7410E] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-[#D7490C] hover:text-[#B7410E] transition-colors"
            >
              Sign Up
            </Link>
            <Link
              to="/events"
              className="text-[#D7490C] hover:text-[#B7410E] transition-colors"
            >
              Browse Events
            </Link>
            <Link
              to="/services"
              className="text-[#D7490C] hover:text-[#B7410E] transition-colors"
            >
              Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
