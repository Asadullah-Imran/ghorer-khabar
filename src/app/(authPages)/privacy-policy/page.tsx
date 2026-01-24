"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/register"
            className="flex items-center gap-2 text-teal-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Registration
          </Link>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-teal-100">Effective Date: January 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-yellow-400 p-2 rounded-lg">
            <Image
              src="/ghorer-khabar-logo.png"
              alt="Ghorer Khabar"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-2xl font-bold text-teal-900">
            Ghorer<span className="text-yellow-400">Khabar</span>
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Privacy Matters
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At Ghorer Khabar, we are committed to protecting your privacy and
              ensuring transparency about how we collect, use, and protect your
              personal information. This Privacy Policy explains our practices
              regarding data collection and your rights.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              1. Information We Collect
            </h3>

            <h4 className="font-semibold text-gray-900 mb-2 mt-4">
              Personal Information You Provide:
            </h4>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li>Full name and email address</li>
              <li>Phone number and delivery addresses</li>
              <li>Payment and billing information</li>
              <li>Date of birth (for age verification)</li>
              <li>Profile picture and preferences</li>
              <li>
                For chefs: Kitchen information, NID/ID details, and bank
                information
              </li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-2 mt-4">
              Information Collected Automatically:
            </h4>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and time spent on the platform</li>
              <li>Cookies and tracking technologies</li>
              <li>Location data (with your permission)</li>
              <li>Transaction history and order details</li>
            </ul>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. How We Use Your Information
            </h3>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>To create and manage your account</li>
              <li>To process orders, payments, and deliveries</li>
              <li>To send order confirmations and updates</li>
              <li>To improve our services and user experience</li>
              <li>To send promotional offers and newsletters (with consent)</li>
              <li>To verify identity and prevent fraud</li>
              <li>To respond to customer inquiries and support requests</li>
              <li>To comply with legal obligations and regulations</li>
              <li>To personalize your experience on the platform</li>
            </ul>
          </section>

          {/* 3. Data Sharing and Disclosure */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. How We Share Your Information
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may share your information in the following circumstances:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>With Chefs/Sellers:</strong> Delivery addresses and
                contact details to fulfill orders
              </li>
              <li>
                <strong>With Payment Processors:</strong> Credit card and
                payment information (encrypted)
              </li>
              <li>
                <strong>With Delivery Partners:</strong> Address and contact
                information for deliveries
              </li>
              <li>
                <strong>With Legal Authorities:</strong> When required by law
                or court orders
              </li>
              <li>
                <strong>With Service Providers:</strong> Cloud hosting, analytics, and customer support
              </li>
              <li>
                <strong>Business Transfers:</strong> In case of merger,
                acquisition, or sale of assets
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We do NOT sell or lease your personal information to third parties
              for marketing purposes.
            </p>
          </section>

          {/* 4. Data Security */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              4. Data Security
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We implement industry-standard security measures to protect your
              data:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                SSL/TLS encryption for all data transmitted over the internet
              </li>
              <li>Secure password hashing and authentication protocols</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls limiting employee access to personal data</li>
              <li>Secure storage of sensitive information</li>
              <li>
                Immediate response protocols for data breaches or security
                incidents
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              However, no method of transmission over the internet is 100% secure.
              While we strive to protect your information, we cannot guarantee
              absolute security.
            </p>
          </section>

          {/* 5. Your Rights */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              5. Your Privacy Rights
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You have the following rights regarding your personal information:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                <strong>Right to Access:</strong> Request a copy of your
                personal data
              </li>
              <li>
                <strong>Right to Rectification:</strong> Correct inaccurate or
                incomplete information
              </li>
              <li>
                <strong>Right to Erasure:</strong> Request deletion of your
                data (subject to legal requirements)
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> Limit how your
                data is used
              </li>
              <li>
                <strong>Right to Data Portability:</strong> Receive your data
                in a structured format
              </li>
              <li>
                <strong>Right to Opt-Out:</strong> Unsubscribe from marketing
                communications
              </li>
              <li>
                <strong>Right to Lodge Complaints:</strong> Report privacy
                concerns to relevant authorities
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              To exercise any of these rights, contact us at
              support@ghorerkhabar.com with your request.
            </p>
          </section>

          {/* 6. Cookies and Tracking */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              6. Cookies and Tracking Technologies
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>Remember your login information and preferences</li>
              <li>Understand how you interact with our platform</li>
              <li>Deliver personalized content and recommendations</li>
              <li>Analyze usage patterns and improve functionality</li>
              <li>Track website performance and user behavior</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              You can control cookies through your browser settings. Note that
              disabling cookies may affect your user experience.
            </p>
          </section>

          {/* 7. Children's Privacy */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              7. Children's Privacy
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Ghorer Khabar is not intended for users under 18 years of age. We
              do not knowingly collect personal information from children. If we
              discover that we have collected data from a minor, we will delete
              it immediately. Parents or guardians who believe their child has
              provided information should contact us at support@ghorerkhabar.com.
            </p>
          </section>

          {/* 8. Data Retention */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              8. Data Retention
            </h3>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to
              provide our services and fulfill the purposes outlined in this
              policy. After account deletion, we may retain some data for legal,
              accounting, or security purposes as permitted by law. Transaction
              records are typically retained for 7 years for accounting and legal
              compliance.
            </p>
          </section>

          {/* 9. Third-Party Links */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              9. Third-Party Links and Services
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Our platform may contain links to third-party websites and
              services. We are not responsible for their privacy practices. When
              you visit external sites, please review their privacy policies.
              This Privacy Policy applies only to Ghorer Khabar.
            </p>
          </section>

          {/* 10. International Data Transfers */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              10. International Data Transfers
            </h3>
            <p className="text-gray-700 leading-relaxed">
              While Ghorer Khabar operates primarily in Bangladesh, your data may
              be transferred, stored, or processed internationally as part of our
              cloud infrastructure. By using our services, you consent to such
              transfers. We implement appropriate safeguards to protect your data
              during transfers.
            </p>
          </section>

          {/* 11. Changes to Privacy Policy */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              11. Policy Updates
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Ghorer Khabar may update this Privacy Policy from time to time to
              reflect changes in practices or regulations. We will notify you of
              significant changes via email or platform notification. Your
              continued use of the platform after updates constitutes your
              acceptance of the revised policy.
            </p>
          </section>

          {/* 12. Contact Information */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              12. Contact Us
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              For privacy inquiries, requests, or concerns, please contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-semibold">Ghorer Khabar - Privacy Team</p>
              <p className="text-gray-700">Email: privacy@ghorerkhabar.com</p>
              <p className="text-gray-700">Support: support@ghorerkhabar.com</p>
              <p className="text-gray-700">Website: www.ghorerkhabar.com</p>
              <p className="text-gray-700">Location: Dhaka, Bangladesh</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="border-t border-gray-200 pt-8 bg-teal-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Your Consent
            </h3>
            <p className="text-gray-700 leading-relaxed">
              By using Ghorer Khabar, you consent to the collection and use of
              your information as described in this Privacy Policy. We are
              committed to protecting your privacy and maintaining your trust.
            </p>
          </section>
        </div>

        {/* Back Button */}
        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 text-white rounded-xl font-semibold hover:bg-teal-800 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
