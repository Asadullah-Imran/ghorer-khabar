"use client";

import { ChevronDown, ChevronUp, Loader2, Send } from "lucide-react";
import { useState } from "react";

// --- 1. FAQ Accordion ---
export function FAQSection({ data }: { data: any[] }) {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {data.map((cat, catIdx) => (
        <div key={catIdx}>
          <h3 className="font-bold text-gray-900 mb-3">{cat.category}</h3>
          <div className="space-y-3">
            {cat.items.map((item: any, i: number) => {
              const id = `${catIdx}-${i}`;
              const isOpen = openIndex === id;

              return (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:border-teal-200"
                >
                  <button
                    onClick={() => toggle(id)}
                    className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {item.q}
                    {isOpen ? (
                      <ChevronUp size={18} className="text-teal-600" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 text-sm text-gray-500 bg-gray-50/50 leading-relaxed border-t border-gray-100 mt-1">
                      <div className="pt-3">{item.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 2. Contact Form ---
export function ContactForm() {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate API
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
    }, 1500);
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in fade-in">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Send size={24} />
        </div>
        <h3 className="text-lg font-bold text-green-800">Message Sent!</h3>
        <p className="text-sm text-green-700 mt-1">
          Our team will get back to you within 2 hours.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-bold text-green-800 underline hover:text-green-900"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
    >
      <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
        Send us a message
      </h3>

      <label className="block space-y-1">
        <span className="text-xs font-bold text-gray-500 uppercase">Topic</span>
        <select className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none">
          <option>Order Issue</option>
          <option>Payment Issue</option>
          <option>Feedback</option>
          <option>Other</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-bold text-gray-500 uppercase">
          Message
        </span>
        <textarea
          required
          rows={4}
          placeholder="Describe your issue..."
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
        ></textarea>
      </label>

      <button
        type="submit"
        disabled={isSending}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
      >
        {isSending ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Send size={18} />
        )}
        {isSending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
