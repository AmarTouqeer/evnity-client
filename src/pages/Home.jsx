import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Calendar,
  Users,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
// Import your custom images
import heroImage from "../assets/1.png";
import featuresImage from "../assets/2.png";
import galleryImage from "../assets/3.png";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const features = [
    {
      icon: Calendar,
      title: "Event Management",
      description:
        "Create and manage events with ease. From weddings to corporate events.",
    },
    {
      icon: Users,
      title: "Service Providers",
      description:
        "Connect with trusted photographers, caterers, decorators and more.",
    },
    {
      icon: MapPin,
      title: "Resource Booking",
      description:
        "Book venues, equipment, and resources for your perfect event.",
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Read reviews and ratings to make informed decisions.",
    },
  ];

  const stats = [
    { number: "10K+", label: "Events Hosted" },
    { number: "5K+", label: "Happy Customers" },
    { number: "1K+", label: "Service Providers" },
    { number: "20+", label: "Cities Covered" },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#B7410E] via-[#D7490C] to-[#D7490C] text-white rounded-3xl mx-4">
        <div className="absolute inset-0 bg-[#B7410E] bg-opacity-20"></div>
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-20 px-6 max-w-7xl mx-auto">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Make Your Events
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Extraordinary
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl">
              Your one-stop solution for events, resources, and services. From
              intimate gatherings to grand celebrations.
            </p>
            {!isAuthenticated() && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-[#B7410E] transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Right side - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Event Management"
                className="w-full h-auto rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl mx-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Thousands Across Pakistan
            </h2>
            <p className="text-lg text-gray-600">
              Join our growing community of satisfied customers and service
              providers
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold text-[#D7490C] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className="relative">
            <img
              src={featuresImage}
              alt="Event Features"
              className="w-full h-auto rounded-2xl shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#B7410E]/20 to-transparent rounded-2xl"></div>
          </div>

          {/* Right side - Features */}
          <div>
            <div className="mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need for Perfect Events
              </h2>
              <p className="text-xl text-gray-600">
                From planning to execution, we provide all the tools and
                services you need.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-xl flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 rounded-3xl mx-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Evnity Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to create your perfect event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#D7490C]">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up & Browse</h3>
              <p className="text-gray-600">
                Create your account and explore thousands of events, services,
                and resources.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#B7410E]">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book & Connect</h3>
              <p className="text-gray-600">
                Book your preferred services and connect with verified
                providers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Your Event</h3>
              <p className="text-gray-600">
                Relax and enjoy your perfectly organized event with our support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery/Showcase Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Creating Memories That Last Forever
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                From intimate ceremonies to grand celebrations, we help bring
                your vision to life with our comprehensive event management
                services.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full mr-4"></div>
                  <span className="text-gray-700">
                    Professional event planning and coordination
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full mr-4"></div>
                  <span className="text-gray-700">
                    Trusted network of verified service providers
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full mr-4"></div>
                  <span className="text-gray-700">
                    End-to-end event management solutions
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full mr-4"></div>
                  <span className="text-gray-700">
                    24/7 support throughout your event journey
                  </span>
                </div>
              </div>

              {!isAuthenticated() && (
                <div className="mt-8">
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white font-semibold rounded-lg hover:from-[#D7490C] hover:to-[#B7410E] transition-all duration-300"
                  >
                    Explore Our Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right side - Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={galleryImage}
                  alt="Event Gallery"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
              {/* Decorative background shapes */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Create Amazing Events?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers and start planning your
            perfect event today.
          </p>
          {!isAuthenticated() && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white font-semibold rounded-xl hover:from-[#D7490C] hover:to-[#B7410E] transition-all duration-300 transform hover:scale-105"
              >
                Start Planning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              Free to join
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              Verified providers
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              24/7 support
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
