import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  const lastUpdated = "April 21, 2026";

  const sections = [
    {
      title: "1. Introduction",
      content: `Evnity ("Evnity", "we", "our", "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and safeguard your information when you use our website, mobile app, or services (collectively, the "Platform").

This Policy applies to customers, providers, and visitors. It is designed to comply with the laws of the Islamic Republic of Pakistan — including the Prevention of Electronic Crimes Act 2016 (PECA) — and, where applicable, with the EU General Data Protection Regulation (GDPR) and UK GDPR for users located in those regions.

By using the Platform, you acknowledge that you have read and understood this Policy. If you do not agree with it, please do not use the Platform.`,
    },
    {
      title: "2. Data Controller",
      content: `For the purposes of Pakistani data protection law and (where applicable) the GDPR, Evnity is the controller of the personal data you provide through the Platform.

Contact: support@evnity.pk
Website: www.evnity.pk`,
    },
    {
      title: "3. Information We Collect",
      content: `We collect information in three ways:

(a) Information you provide directly — name, email, phone number, city, address, profile photo, and (for providers) business details, bank or wallet account information needed to receive payments, and any content you post such as listings, reviews, and messages.

(b) Information collected automatically — IP address, device type, browser, pages visited, and cookies used to keep you logged in and remember your preferences.

(c) Information from third parties — payment and verification details returned by Stripe when you transact, and data from social login providers if you choose to sign in using them.

We do not intentionally collect special categories of personal data (such as data revealing racial or ethnic origin, religion, or health information). Please do not submit such data through the Platform.`,
    },
    {
      title: "4. Legal Bases for Processing (GDPR)",
      content: `Where GDPR applies, we process your personal data under the following legal bases:

- Contract — to create your account, process bookings, and deliver the services you request.
- Legitimate interests — to operate, secure, and improve the Platform; to prevent fraud and abuse; and to communicate essential service updates.
- Consent — for optional marketing emails, non-essential cookies, and any other activity where we explicitly ask for your permission. You can withdraw consent at any time.
- Legal obligation — to comply with Pakistani law, court orders, tax records, and lawful requests from regulators.

Where GDPR does not apply, we still process data only for the purposes described in this Policy.`,
    },
    {
      title: "5. How We Use Your Information",
      content: `We use your information to:
- Create and manage your account.
- Process bookings and payments (Stripe card payments and manual Pakistani methods such as Easypaisa, JazzCash, and bank transfers).
- Connect customers with providers and facilitate communication.
- Verify provider identity before approval.
- Send booking confirmations, receipts, and important service announcements.
- Detect fraud, abuse, and violations of our Terms of Service.
- Improve the Platform and develop new features.
- Comply with Pakistani law and respond to lawful requests.`,
    },
    {
      title: "6. Payments and Financial Data",
      content: `Card payments are handled by Stripe. Evnity does not see, store, or process your full card number, CVC, or expiry date — Stripe receives this information directly through its secure checkout. Stripe acts as an independent data controller for the payment data it collects; we recommend you also review Stripe's privacy notice at stripe.com/privacy.

For manual payments (Easypaisa, JazzCash, bank transfers), the customer pays the provider outside our Platform and uploads a receipt. We store the receipt, method type, and any transaction reference you provide, so the provider can verify payment.

We retain transaction metadata (booking ID, amount, platform fee, payout amount) for accounting, tax, and dispute resolution purposes.`,
    },
    {
      title: "7. Information Sharing",
      content: `We do not sell your personal data. We share it only with:
- The other party in a booking (customer ↔ provider) to the extent needed to fulfill the booking.
- Payment processors (Stripe) to process transactions.
- Service providers we use for hosting, email, analytics, and cloud storage, under confidentiality obligations and data processing agreements.
- Law enforcement or regulators when required by Pakistani law or a court order.
- Acquirers or successors in the event of a merger, acquisition, or asset sale, with continuity of this Policy.`,
    },
    {
      title: "8. International Data Transfers",
      content: `Evnity is based in Pakistan, and some of our service providers (including Stripe, Cloudinary, and our hosting provider) are located outside Pakistan — including in the United States and the European Union.

When we transfer personal data outside your country of residence, we rely on appropriate safeguards such as:
- Standard Contractual Clauses (SCCs) approved by the European Commission for transfers subject to GDPR.
- Contractual commitments from processors to maintain data security and confidentiality.
- The data-protection practices of the receiving country, where recognized as adequate.

By using the Platform, you understand that your data may be processed in countries whose data-protection laws may differ from those of your country of residence.`,
    },
    {
      title: "9. Cookies and Tracking",
      content: `We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the Platform is used.

We use two categories:
- Essential cookies — required for the Platform to work (login sessions, security, basic preferences). These cannot be disabled without breaking the Platform.
- Analytics cookies — help us understand usage patterns in aggregate. Where GDPR applies, we ask for your consent before setting these.

You can disable cookies in your browser settings, but some features of the Platform will not work properly without them.`,
    },
    {
      title: "10. Data Security",
      content: `We use reasonable technical and organizational safeguards to protect your data, including:
- Encryption in transit (HTTPS/TLS).
- Password hashing (bcrypt or equivalent).
- Role-based access control.
- Regular security reviews and dependency updates.
- Payment card data handled exclusively by Stripe (PCI-DSS compliant).

No method of transmission or storage is 100% secure. If we become aware of a breach that affects your personal data, we will notify you and the relevant authorities in line with applicable law — generally within 72 hours where GDPR applies.`,
    },
    {
      title: "11. Data Retention",
      content: `We keep your account data for as long as your account is active. When you delete your account, we remove or anonymize your personal data within a reasonable period (typically 30–90 days), except where we are required to retain it for:
- Legal, tax, or accounting purposes (transaction records are kept for up to 7 years).
- Fraud prevention and dispute resolution.
- Compliance with court orders or regulatory requests.

Anonymized analytics data may be retained indefinitely.`,
    },
    {
      title: "12. Your Rights",
      content: `Subject to applicable law, you have the right to:

- Access — request a copy of the personal data we hold about you.
- Rectification — correct inaccurate or incomplete data.
- Erasure ("right to be forgotten") — ask us to delete your personal data where there is no legal reason for us to keep it.
- Restriction — limit how we process your data in certain circumstances.
- Portability — receive your data in a structured, commonly-used, machine-readable format and transfer it to another controller.
- Objection — object to processing based on legitimate interests or direct marketing.
- Withdraw consent — where processing is based on consent, withdraw it at any time (without affecting past processing).
- Lodge a complaint — with a data protection authority if you believe we have mishandled your data. Where GDPR applies, this is the supervisory authority in your country of residence.

To exercise any of these rights, email support@evnity.pk. We will respond within 30 days (or sooner where required by law) and may need to verify your identity before acting.`,
    },
    {
      title: "13. Children's Privacy",
      content: `The Platform is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has provided us with personal information, please contact support@evnity.pk and we will delete it promptly.`,
    },
    {
      title: "14. Third-Party Links",
      content: `The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. Please read their privacy policies before sharing information with them.`,
    },
    {
      title: "15. Automated Decision-Making",
      content: `Evnity does not make fully automated decisions that produce legal or similarly significant effects about you. Our admin team reviews provider approvals, listing approvals, and dispute outcomes with human judgement.`,
    },
    {
      title: "16. Changes to This Policy",
      content: `We may update this Privacy Policy from time to time. If we make material changes, we will notify registered users by email or through a notice on the Platform at least 14 days before the changes take effect. The "Last Updated" date at the top of this page shows when it was last revised.`,
    },
    {
      title: "17. Governing Law",
      content: `This Privacy Policy is governed by the laws of the Islamic Republic of Pakistan, including the Prevention of Electronic Crimes Act 2016 (PECA) and any data protection legislation in force from time to time. Nothing in this Policy limits any rights you may have under mandatory local laws in your country of residence.

Any disputes relating to this Policy fall under the exclusive jurisdiction of the courts of Pakistan, subject to any overriding statutory rights available to you under the laws of your jurisdiction.`,
    },
    {
      title: "18. Contact Us",
      content: `For any questions about this Privacy Policy, to exercise your data rights, or to report a privacy concern, contact us at:

Email: support@evnity.pk
Website: www.evnity.pk

We will do our best to respond promptly and resolve your concern.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-orange-100">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
          <p className="text-gray-700 leading-relaxed mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm">
            <strong>Summary:</strong> Evnity collects the minimum data needed
            to run the Platform, never sells your information, handles card
            payments securely through Stripe, and gives you full rights to
            access, correct, export, or delete your data. The full policy
            follows below.
          </p>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  {section.title}
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;