import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Shield,
  Heart,
  Target,
  Award,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const About = () => {
  const stats = [
    { label: "Event Providers", value: "500+", icon: Users },
    { label: "Happy Customers", value: "2,000+", icon: Heart },
    { label: "Cities Covered", value: "40+", icon: Sparkles },
    { label: "Events Booked", value: "5,000+", icon: Calendar },
  ];

  const values = [
    {
      icon: Shield,
      title: "Trust & Safety",
      desc: "Every provider is verified by our admin team before appearing on Evnity. Your payments are secured through Stripe and verified manual flows.",
    },
    {
      icon: Target,
      title: "Local First",
      desc: "Built in Pakistan, for Pakistan. We support Easypaisa, JazzCash, and bank transfers alongside international card payments.",
    },
    {
      icon: Award,
      title: "Quality Providers",
      desc: "We admit only vetted photographers, caterers, venues, and suppliers so every booking meets a standard you can count on.",
    },
    {
      icon: TrendingUp,
      title: "Fair for Everyone",
      desc: "Transparent platform fees, clear payout breakdowns, and honest reviews. No hidden charges for customers or providers.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Evnity</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-3xl mx-auto">
            Pakistan's end-to-end platform for booking event venues, services,
            and rental resources — connecting customers with trusted local
            providers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Mission */}
        <section className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            Planning an event in Pakistan should not mean juggling a dozen
            WhatsApp chats, chasing quotes, and worrying about whether a vendor
            will actually show up. We built Evnity to put every trusted local
            provider — venues, photographers, caterers, DJs, decorators, tent
            and furniture rentals — in one place, with real reviews, verified
            identities, and secure payments.
          </p>
          <p className="text-gray-700 leading-relaxed text-lg mt-4">
            Our goal is simple: make it as easy to book a wedding hall in
            Lahore, a photographer in Karachi, or chairs for an event in
            Sahiwal as it is to book a ride on your phone.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-xl shadow-lg p-6 text-center"
              >
                <div className="inline-flex p-3 bg-orange-100 rounded-lg mb-3">
                  <Icon className="w-6 h-6 text-[#D7490C]" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </section>

        {/* Values */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              What We Stand For
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything we build is guided by four simple principles.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="inline-flex p-3 bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-lg mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* For customers vs providers */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              For Customers
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Browse and compare venues, services, and rentals across Pakistan.
              Read verified reviews, pay securely by card or local method, and
              track every booking from request to completion in one place.
            </p>
            <Link
              to="/events"
              className="inline-flex px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Events
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              For Providers
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              List your venue, service, or rental inventory, set your own
              pricing and payment methods, and reach customers across Pakistan.
              Connect Stripe for card payments or accept Easypaisa, JazzCash,
              and bank transfers directly.
            </p>
            <Link
              to="/provider/add-listing"
              className="inline-flex px-5 py-2.5 rounded-lg border-2 border-[#D7490C] text-[#D7490C] font-semibold hover:bg-orange-50 transition-colors"
            >
              Become a Provider
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] rounded-2xl shadow-lg p-10 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Plan your next event with us</h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            From intimate birthdays to grand weddings, we have verified
            providers ready to bring your vision to life.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/events"
              className="px-6 py-3 rounded-lg bg-white text-[#D7490C] font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Browsing
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white hover:text-[#D7490C] transition-colors"
            >
              How It Works
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;