import { Link } from "react-router-dom";
import {
  Search,
  CheckCircle,
  CreditCard,
  Star,
  UserPlus,
  Package,
  Wallet,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const HowItWorks = () => {
  const customerSteps = [
    {
      icon: Search,
      title: "Browse & Discover",
      desc: "Search events, services, or resources by city, category, date, and budget. Read verified reviews and view provider profiles before you commit.",
    },
    {
      icon: CheckCircle,
      title: "Request a Booking",
      desc: "Pick your date, time, and any extras, then send a booking request. The provider has 24 hours to accept or suggest changes.",
    },
    {
      icon: CreditCard,
      title: "Pay Securely",
      desc: "Once your booking is accepted, pay by Stripe card or a local method (Easypaisa, JazzCash, bank transfer) and upload your receipt. Every payment is tracked.",
    },
    {
      icon: Star,
      title: "Enjoy & Review",
      desc: "After your event, leave a rating and review to help the next customer choose confidently.",
    },
  ];

  const providerSteps = [
    {
      icon: UserPlus,
      title: "Sign Up & Get Verified",
      desc: "Create a provider account with your business details. Our admin team reviews and approves you — usually within 24–48 hours.",
    },
    {
      icon: Package,
      title: "Create Your Listings",
      desc: "Post your venues, services, or rental inventory with photos, pricing, and availability. Choose the payment methods you accept.",
    },
    {
      icon: Wallet,
      title: "Get Bookings & Paid",
      desc: "Accept customer requests, receive payments via Stripe Connect or manual methods, and track everything in your provider dashboard.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      desc: "Positive reviews and completed bookings boost your ranking. Scale from one listing to a full catalog on your own terms.",
    },
  ];

  const faqs = [
    {
      q: "How much does it cost to use Evnity?",
      a: "Browsing and creating listings is free. Evnity charges a small platform fee on successful bookings to keep the service running and invest in new features. The exact fee is shown transparently on every booking.",
    },
    {
      q: "How do payments work?",
      a: "Customers can pay by card through Stripe or by local method (Easypaisa, JazzCash, bank transfer) depending on what the provider accepts. Stripe payments settle automatically; manual payments require the customer to upload a receipt which the provider then confirms.",
    },
    {
      q: "What if a provider cancels after I've paid?",
      a: "Our booking flow protects both sides. If a provider cancels an accepted booking after payment, the amount is refunded to the customer and the provider's account is reviewed. Repeat issues lead to suspension.",
    },
    {
      q: "How fast do providers get paid?",
      a: "Stripe payouts follow Stripe's standard schedule (typically 2–7 business days after capture, minus the platform fee). Manual payments are between the customer and provider directly — Evnity just helps track receipts.",
    },
    {
      q: "Can I list in multiple cities?",
      a: "Yes. Each listing has its own city and full address, so you can cover as many locations as you serve. Just submit a separate listing per location.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How Evnity Works</h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto">
            Whether you're planning an event or providing a service, here's
            exactly how Evnity works from start to finish.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Customer flow */}
        <section>
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-orange-100 text-[#D7490C] text-sm font-semibold rounded-full mb-3">
              FOR CUSTOMERS
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Book in four simple steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <Icon className="w-6 h-6 text-[#D7490C]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Start Browsing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Provider flow */}
        <section>
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 text-sm font-semibold rounded-full mb-3">
              FOR PROVIDERS
            </span>
            <h2 className="text-3xl font-bold text-gray-900">
              Grow your business with Evnity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providerSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="bg-white rounded-xl shadow-lg p-6 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <Icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/provider/add-listing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-green-600 text-green-700 font-semibold hover:bg-green-50 transition-colors"
            >
              Become a Provider
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5 max-w-3xl mx-auto">
            {faqs.map((item, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-lg overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 bg-gray-50 hover:bg-gray-100 font-semibold text-gray-900 text-left">
                  <span>{item.q}</span>
                  <span className="text-[#D7490C] text-xl transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 py-4 text-gray-700 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of customers and providers using Evnity.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Create Account
            </Link>
            <Link
              to="/events"
              className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Browse First
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;