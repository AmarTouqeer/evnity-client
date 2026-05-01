import { Link } from "react-router-dom";
import { User, Store, ArrowRight } from "lucide-react";

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Join Our Platform
          </h1>
          <p className="text-lg text-gray-600">
            Choose how you want to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Customer Card */}
          <Link
            to="/register/customer"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                I'm a Customer
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Book events, services, and rent resources for your special
                occasions. Browse through thousands of options.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Book events & venues
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Hire professional services
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Rent resources & equipment
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Leave reviews & ratings
                </li>
              </ul>

              <div className="flex items-center justify-between text-blue-600 font-semibold group-hover:text-blue-700">
                <span>Register as Customer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </Link>

          {/* Provider Card */}
          <Link
            to="/register/provider"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
          >
            <div className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-[#B7410E] to-[#D7490C] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Store className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                I'm a Provider
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                List your events, services, or resources and grow your business.
                Connect with thousands of customers.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-[#D7490C] rounded-full mr-3"></div>
                  List events & venues
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-[#D7490C] rounded-full mr-3"></div>
                  Offer professional services
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-[#D7490C] rounded-full mr-3"></div>
                  Rent out resources
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-[#D7490C] rounded-full mr-3"></div>
                  Manage bookings & earnings
                </li>
              </ul>

              <div className="flex items-center justify-between text-[#D7490C] font-semibold group-hover:text-[#B7410E]">
                <span>Register as Provider</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </div>

            <div className="h-2 bg-gradient-to-r from-[#B7410E] to-[#D7490C] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </Link>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#D7490C] hover:text-[#B7410E] font-semibold transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
