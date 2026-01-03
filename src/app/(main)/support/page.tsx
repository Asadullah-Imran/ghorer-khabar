import {
  ContactForm,
  FAQSection,
} from "@/components/support/SupportInteractions";
import { CONTACT_INFO, SUPPORT_FAQS } from "@/lib/dummy-data/support";
import {
  ArrowLeft,
  Mail,
  MapPin,
  MessageCircleQuestion,
  Phone,
} from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header */}
      <div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-3 rounded-xl">
            <MessageCircleQuestion className="text-yellow-700" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Help & Support
            </h1>
            <p className="text-sm text-gray-500">We are here to help you</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* 2. Left Column: FAQs */}
        <div className="lg:col-span-2">
          <div className="bg-teal-50 rounded-xl p-6 mb-8 border border-teal-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-teal-900">
                Frequently Asked Questions
              </h3>
              <p className="text-sm text-teal-700 mt-1">
                Quick answers to common questions.
              </p>
            </div>
          </div>

          <FAQSection data={SUPPORT_FAQS} />
        </div>

        {/* 3. Right Column: Contact Info & Form */}
        <div className="lg:col-span-1 space-y-6 sticky top-24">
          {/* Contact Card */}
          <div className="bg-teal-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

            <h3 className="font-bold text-lg mb-4 relative z-10">
              Contact Us Directly
            </h3>

            <div className="space-y-4 relative z-10 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-teal-200 text-xs uppercase font-bold">
                    Call Us
                  </p>
                  <p className="font-semibold">{CONTACT_INFO.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-teal-200 text-xs uppercase font-bold">
                    Email Us
                  </p>
                  <p className="font-semibold">{CONTACT_INFO.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-teal-200 text-xs uppercase font-bold">
                    Visit HQ
                  </p>
                  <p className="font-semibold">{CONTACT_INFO.address}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-center text-teal-200">
              Support Hours: {CONTACT_INFO.hours}
            </div>
          </div>

          {/* Contact Form Component */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
