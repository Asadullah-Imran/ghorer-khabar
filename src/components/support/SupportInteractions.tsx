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
  const [topic, setTopic] = useState("Order Issue");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (topic === "Order Issue" && !orderNumber.trim()) {
      setError("Please enter your order number");
      return;
    }
    
    if (!message.trim()) {
      setError("Please enter your message");
      return;
    }
    
    setIsSending(true);
    
    try {
      const res = await fetch("/api/support/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          orderNumber: topic === "Order Issue" ? orderNumber : null,
          message,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }
      
      setSent(true);
      setTopic("Order Issue");
      setOrderNumber("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <label className="block space-y-1">
        <span className="text-xs font-bold text-gray-500 uppercase">Topic</span>
        <select 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
        >
          <option>Order Issue</option>
          <option>Payment Issue</option>
          <option>Feedback</option>
          <option>Other</option>
        </select>
      </label>

      {topic === "Order Issue" && (
        <label className="block space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase">
            Order Number <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g., cm4vg3h5w0000..."
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can find your order number in the order confirmation or 'My Orders' page.
          </p>
        </label>
      )}

      <label className="block space-y-1">
        <span className="text-xs font-bold text-gray-500 uppercase">
          Message <span className="text-red-500">*</span>
        </span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Describe your issue in detail..."
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
