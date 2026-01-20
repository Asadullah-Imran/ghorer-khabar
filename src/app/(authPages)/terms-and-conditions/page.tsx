"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TermsAndConditionsPage() {
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
          <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
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
              Welcome to Ghorer Khabar
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Ghorer Khabar is a marketplace platform that connects food lovers
              with verified home chefs. These Terms and Conditions govern your
              use of our website, mobile application, and services. By
              registering, accessing, or using Ghorer Khabar, you agree to be
              bound by these terms.
            </p>
          </section>

          {/* 1. Acceptance of Terms */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h3>
            <p className="text-gray-700 leading-relaxed">
              By creating an account and using the Ghorer Khabar platform, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms and Conditions and our Privacy Policy. If you do
              not agree to these terms, please do not use our services.
            </p>
          </section>

          {/* 2. Eligibility */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              2. User Eligibility
            </h3>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>You must be at least 18 years old to register</li>
              <li>
                You must be a resident of Bangladesh to use our services
              </li>
              <li>
                You agree to provide accurate, current, and complete information
              </li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>
                Each person is limited to one personal account; creating
                multiple accounts is prohibited
              </li>
            </ul>
          </section>

          {/* 3. User Types and Roles */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              3. User Types: Buyers and Sellers (Chefs)
            </h3>

            <h4 className="font-semibold text-gray-900 mb-2 mt-4">
              Buyer Responsibilities:
            </h4>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li>
                Provide accurate delivery addresses and contact information
              </li>
              <li>
                Complete payments on time and maintain valid payment methods
              </li>
              <li>Provide honest feedback and ratings about dishes and chefs</li>
              <li>
                Respect chef's policies regarding ordering deadlines and
                specifications
              </li>
            </ul>

            <h4 className="font-semibold text-gray-900 mb-2 mt-4">
              Chef (Seller) Responsibilities:
            </h4>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside ml-2">
              <li>Prepare food according to health and food safety standards</li>
              <li>
                Maintain kitchen cleanliness as per local health regulations
              </li>
              <li>
                Provide accurate descriptions of dishes, ingredients, and
                allergen information
              </li>
              <li>Complete orders on time and maintain quality standards</li>
              <li>Comply with all local food safety and licensing requirements</li>
            </ul>
          </section>

          {/* 4. Order Process */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              4. Order Process and Payment
            </h3>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                All orders must be placed through the Ghorer Khabar platform
              </li>
              <li>
                Prices displayed are final and include all applicable charges
              </li>
              <li>
                Payment must be completed before order confirmation (unless
                stated otherwise)
              </li>
              <li>
                Ghorer Khabar facilitates payments but does not hold customer
                funds
              </li>
              <li>
                Refunds for cancelled orders will be processed within 5-7
                business days
              </li>
              <li>
                Chefs have the right to decline orders that do not meet their
                specifications
              </li>
            </ul>
          </section>

          {/* 5. Food Safety and Quality */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              5. Food Safety and Quality Standards
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Ghorer Khabar is committed to ensuring food safety:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                All chefs must comply with Bangladesh food safety regulations
              </li>
              <li>
                Food must be prepared in compliance with local health standards
              </li>
              <li>
                Allergen information must be clearly disclosed in dish
                descriptions
              </li>
              <li>
                Chefs must maintain proper food storage and handling practices
              </li>
              <li>
                Ghorer Khabar reserves the right to conduct spot inspections
              </li>
              <li>
                Non-compliant chefs will face suspension or permanent ban from
                the platform
              </li>
            </ul>
          </section>

          {/* 6. Delivery */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              6. Delivery Terms
            </h3>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                Delivery times are estimates and subject to location, traffic,
                and order volume
              </li>
              <li>
                Buyers are responsible for ensuring someone is available to
                receive delivery
              </li>
              <li>
                If the delivery address is incomplete or unreachable, Ghorer
                Khabar is not responsible for delayed delivery
              </li>
              <li>
                Buyers must inspect food upon delivery and report issues
                immediately
              </li>
              <li>
                Refunds for delivery-related issues must be reported within 24
                hours of delivery
              </li>
            </ul>
          </section>

          {/* 7. Reviews and Ratings */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              7. Reviews and Ratings
            </h3>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                Users are encouraged to provide honest feedback about their
                experience
              </li>
              <li>
                Reviews must be truthful, respectful, and free from offensive
                content
              </li>
              <li>
                Ghorer Khabar reserves the right to remove inappropriate,
                false, or defamatory reviews
              </li>
              <li>
                Users may not post reviews on behalf of others or post fake
                reviews
              </li>
              <li>Reviews are subject to a moderation process</li>
            </ul>
          </section>

          {/* 8. Limitation of Liability */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              8. Limitation of Liability
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              To the maximum extent permitted by law:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                Ghorer Khabar is not liable for indirect, incidental, special,
                or consequential damages
              </li>
              <li>
                Ghorer Khabar's total liability shall not exceed the transaction
                value
              </li>
              <li>
                Ghorer Khabar is not responsible for disputes between buyers and
                chefs
              </li>
              <li>
                Users assume full responsibility for their use of the platform
              </li>
            </ul>
          </section>

          {/* 9. Prohibited Activities */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              9. Prohibited Activities
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to engage in the following activities:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                Harassment, bullying, or threatening communication toward other
                users
              </li>
              <li>
                Posting false, defamatory, or illegal content on the platform
              </li>
              <li>
                Attempting to bypass platform security or exploit
                vulnerabilities
              </li>
              <li>Fraudulent orders or payment methods</li>
              <li>
                Using the platform for illegal activities or selling prohibited
                items
              </li>
              <li>
                Sharing your account credentials or allowing unauthorized
                access
              </li>
              <li>
                Engaging in unauthorized commercial activities or reselling on
                the platform
              </li>
            </ul>
          </section>

          {/* 10. Intellectual Property */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              10. Intellectual Property Rights
            </h3>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                All content, design, and functionality of the Ghorer Khabar
                platform are owned by Ghorer Khabar
              </li>
              <li>
                You may not reproduce, distribute, or use our content without
                permission
              </li>
              <li>
                User-generated content (reviews, photos) grants Ghorer Khabar a
                non-exclusive license to use
              </li>
              <li>
                Trademarks, logos, and brand names are the property of their
                respective owners
              </li>
            </ul>
          </section>

          {/* 11. Account Suspension and Termination */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              11. Account Suspension and Termination
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Ghorer Khabar reserves the right to suspend or terminate accounts
              for:
            </p>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>Violation of these Terms and Conditions</li>
              <li>Repeated food safety violations (for chefs)</li>
              <li>Fraudulent or illegal activities</li>
              <li>Harassment or abusive behavior toward other users</li>
              <li>Non-compliance with regulatory requirements</li>
              <li>
                Inactivity for extended periods (subject to notice period)
              </li>
            </ul>
          </section>

          {/* 12. Privacy */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              12. Privacy and Data Protection
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Ghorer Khabar collects and processes personal data according to
              our Privacy Policy. By using the platform, you consent to the
              collection and use of your data as outlined in our Privacy Policy.
              For more information, please refer to our complete Privacy Policy.
            </p>
          </section>

          {/* 13. Changes to Terms */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              13. Modification of Terms
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Ghorer Khabar reserves the right to modify these Terms and
              Conditions at any time. Changes will be effective upon posting to
              the platform. Your continued use of the platform following the
              posting of changes constitutes your acceptance of the modified
              terms. We will provide notice of significant changes via email or
              platform notifications.
            </p>
          </section>

          {/* 14. Dispute Resolution */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              14. Dispute Resolution
            </h3>
            <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
              <li>
                Disputes shall first be addressed through direct communication
                between parties
              </li>
              <li>
                If unresolved, Ghorer Khabar provides a dispute resolution
                process
              </li>
              <li>
                Both parties agree to attempt mediation before pursuing legal
                action
              </li>
              <li>
                For disputes related to food quality or delivery, evidence must
                be provided within 24 hours
              </li>
            </ul>
          </section>

          {/* 15. Governing Law */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              15. Governing Law and Jurisdiction
            </h3>
            <p className="text-gray-700 leading-relaxed">
              These Terms and Conditions are governed by and construed in
              accordance with the laws of Bangladesh. Any disputes arising from
              or relating to these terms shall be subject to the exclusive
              jurisdiction of the courts in Bangladesh.
            </p>
          </section>

          {/* 16. Contact Information */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              16. Contact Us
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms and Conditions, please
              contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-900 font-semibold">Ghorer Khabar</p>
              <p className="text-gray-700">Email: support@ghorerkhabar.com</p>
              <p className="text-gray-700">Website: www.ghorerkhabar.com</p>
              <p className="text-gray-700">Location: Dhaka, Bangladesh</p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="border-t border-gray-200 pt-8 bg-teal-50 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Acknowledgment
            </h3>
            <p className="text-gray-700 leading-relaxed">
              By clicking "I Agree" during registration, you acknowledge that
              you have read, understood, and agree to be bound by these Terms
              and Conditions and our Privacy Policy. Thank you for being part of
              the Ghorer Khabar community!
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
