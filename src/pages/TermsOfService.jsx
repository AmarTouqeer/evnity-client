import { FileText } from "lucide-react";

const TermsOfService = () => {
  const lastUpdated = "April 21, 2026";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `These Terms of Service ("Terms") govern your use of Evnity (the "Platform"), operated from Pakistan. By creating an account, listing a service, or booking through the Platform, you agree to be bound by these Terms. If you do not agree, you must not use the Platform.

These Terms should be read alongside our Privacy Policy, which forms an integral part of the contract between you and Evnity.`,
    },
    {
      title: "2. Who Can Use Evnity",
      content: `You must be at least 18 years old and legally able to enter contracts under the laws of your country of residence. Providers must be legitimate businesses or individuals offering the services they list, and must comply with all applicable Pakistani laws including tax and licensing obligations.

If you are using Evnity on behalf of a business, you represent that you have authority to bind that business to these Terms.`,
    },
    {
      title: "3. Accounts",
      content: `You are responsible for the information you provide and for keeping your login credentials secure. You must notify us immediately at support@evnity.pk if you suspect unauthorized access to your account. Evnity may suspend or terminate accounts that violate these Terms, submit false information, or harm other users.`,
    },
    {
      title: "4. Role of the Platform",
      content: `Evnity is a marketplace that connects customers with independent providers. Evnity is not the provider of the services listed. We do not own venues, perform photography, cater events, or rent equipment ourselves.

The contract for any booking is between the customer and the provider; Evnity's role is limited to facilitating discovery, booking, payments, reviews, and dispute tracking. Evnity is not a party to the underlying service contract.`,
    },
    {
      title: "5. Listings and Content",
      content: `Providers are responsible for the accuracy of their listings, including descriptions, pricing, availability, and images. All listings are reviewed by Evnity's admin team before being published. Evnity reserves the right to edit, suspend, or remove listings that violate these Terms, contain misleading information, or infringe on third-party rights.

By posting content on Evnity, you confirm that you own it or have the rights to share it, and that it does not violate any third party's intellectual property, privacy, or other rights.`,
    },
    {
      title: "6. Bookings",
      content: `A booking is confirmed only when the provider accepts the request and payment is successfully received. Providers must respond to booking requests within a reasonable time. Once a booking is accepted and paid, both parties are expected to honor it. Cancellations are governed by each provider's cancellation policy where applicable.`,
    },
    {
      title: "7. Payments, Fees, and Payouts",
      content: `Customers can pay for bookings through Stripe (card payments) or manual Pakistani methods (Easypaisa, JazzCash, bank transfer, cash), depending on what the provider has enabled.

For Stripe payments, Evnity operates as a platform using Stripe Connect. We collect the full booking amount from the customer, deduct a platform fee, and transfer the remainder to the provider through Stripe. The platform fee percentage is displayed on each booking before payment.

For manual payments, the customer pays the provider directly and uploads proof. Evnity tracks the booking but does not handle the funds.

All prices are shown in PKR (or the currency the provider has configured) and may be subject to applicable taxes. Providers are responsible for their own tax filings and for ensuring that the price displayed is the final price charged.`,
    },
    {
      title: "8. Refunds and Disputes",
      content: `Refunds are issued according to the circumstances of the booking:
- If a provider cancels an accepted booking after payment, the customer is refunded in full.
- If a customer cancels, any refund depends on the provider's cancellation policy and the time of cancellation.
- If the service is not delivered as promised, the customer may file a dispute within 7 days of the scheduled event date.

Evnity will investigate disputes in good faith but is not obligated to issue refunds beyond what Stripe or the original payment channel allows. Final decisions on disputes rest with Evnity.

Nothing in this section affects statutory consumer rights that may apply in your country of residence.`,
    },
    {
      title: "9. Reviews",
      content: `Customers may leave a rating and written review after a completed booking. Reviews must be honest, based on real experience, and free from hate speech, harassment, or false statements. Evnity may remove reviews that violate these rules. Providers may reply to reviews but may not offer incentives in exchange for positive ratings.`,
    },
    {
      title: "10. Prohibited Conduct",
      content: `You agree not to:
- Post false, misleading, or fraudulent listings.
- Use the Platform for illegal activity, including money laundering or sale of prohibited goods.
- Harass, threaten, or defame other users.
- Attempt to circumvent the booking or payment flow (for example, asking customers to pay outside Evnity to avoid the platform fee).
- Scrape, reverse-engineer, or interfere with the Platform's operation.
- Upload malware, viruses, or disruptive code.

Violations may result in account suspension, listing removal, and — where appropriate — legal action under the Prevention of Electronic Crimes Act 2016 (PECA) or other applicable law.`,
    },
    {
      title: "11. Intellectual Property",
      content: `The Evnity name, logo, design, and code are the property of Evnity. You may not copy, modify, or redistribute them without written permission. By posting content (listings, photos, reviews), you grant Evnity a non-exclusive, royalty-free, worldwide license to display, promote, and host that content on and in connection with the Platform.`,
    },
    {
      title: "12. Disclaimers",
      content: `The Platform is provided "as is" and "as available" without warranties of any kind, whether express or implied, to the maximum extent permitted by law. Evnity does not guarantee that every provider will meet expectations, that the Platform will be uninterrupted, or that it will be free of errors. Bookings are made at your own discretion and risk.

Nothing in these Terms excludes liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.`,
    },
    {
      title: "13. Limitation of Liability",
      content: `To the maximum extent permitted by applicable law, Evnity is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Evnity's total aggregate liability for any claim relating to the Platform is limited to the total amount of platform fees you paid to Evnity in the three (3) months before the claim arose.

This limitation does not apply to liabilities that cannot be limited under applicable law, including certain consumer protection laws that may apply to you.`,
    },
    {
      title: "14. Indemnification",
      content: `You agree to indemnify and hold Evnity, its directors, employees, and affiliates harmless from claims, damages, or expenses (including reasonable legal fees) arising from your breach of these Terms, your use of the Platform, or your violation of the rights of any third party.`,
    },
    {
      title: "15. Termination",
      content: `You may close your account at any time through your account settings. Evnity may suspend or terminate your account if you violate these Terms, if required by law, or if we reasonably believe your conduct poses a risk to the Platform or other users. Pending bookings and payment obligations survive termination.`,
    },
    {
      title: "16. Changes to These Terms",
      content: `Evnity may update these Terms from time to time. Material changes will be announced by email or a notice on the Platform at least 14 days before they take effect. Continued use after the effective date means you accept the updated Terms. If you do not agree with the changes, you should close your account before they take effect.`,
    },
    {
      title: "17. Governing Law and Jurisdiction",
      content: `These Terms are governed by the laws of the Islamic Republic of Pakistan. Any disputes that cannot be resolved amicably will fall under the exclusive jurisdiction of the courts of Pakistan.

Where you are a consumer located in a jurisdiction whose laws provide mandatory consumer protections, nothing in these Terms limits those protections, and you may also bring proceedings in the courts of your country of residence where local law allows.`,
    },
    {
      title: "18. Severability",
      content: `If any part of these Terms is found to be unenforceable or invalid by a court of competent jurisdiction, the remaining provisions will continue in full force and effect.`,
    },
    {
      title: "19. Contact",
      content: `Questions, complaints, or legal notices should be sent to:

Email: support@evnity.pk
Website: www.evnity.pk`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#B7410E] to-[#D7490C] text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-orange-100">Last updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
          <p className="text-gray-700 leading-relaxed mb-8 p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm">
            <strong>Summary:</strong> These Terms explain how you can use
            Evnity, the role Evnity plays as a marketplace between customers
            and providers, how payments and refunds work, and what happens if
            something goes wrong. Please read them carefully.
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

export default TermsOfService;