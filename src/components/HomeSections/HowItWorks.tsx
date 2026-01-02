"use client";

import { useState } from "react";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<"buyer" | "seller">("buyer");

  const buyerSteps = [
    {
      number: 1,
      icon: "person_add",
      title: "Create Your Taste Profile",
      description:
        "Sign up and tell us your dietary preferences. We curate kitchens that match your health goals.",
    },
    {
      number: 2,
      icon: "storefront",
      title: "Browse Verified Kitchens",
      description:
        'Explore local home chefs. Look for the "Hygiene Verified" badge and read reviews.',
    },
    {
      number: 3,
      icon: "calendar_month",
      title: "Plan or On-Demand",
      description:
        "Subscribe to weekly meal plans or order one-off special dinners when cravings hit.",
    },
    {
      number: 4,
      icon: "local_shipping",
      title: "Doorstep Delivery",
      description:
        "Track your tiffin box in real-time. Eco-friendly packaging keeps food fresh and hot.",
    },
  ];

  const sellerSteps = [
    {
      number: 1,
      icon: "assignment_add",
      title: "Apply to Become a Chef",
      description:
        "Complete our simple application form and schedule a kitchen inspection.",
    },
    {
      number: 2,
      icon: "school",
      title: "Complete Training",
      description:
        "Complete our food safety and platform training program at your own pace.",
    },
    {
      number: 3,
      icon: "kitchen",
      title: "Set Up Your Kitchen",
      description:
        "Set your menu, pricing, and schedule using our Kitchen Manager dashboard.",
    },
    {
      number: 4,
      icon: "payments",
      title: "Start Earning",
      description:
        "Receive orders, cook with confidence, and get paid weekly with automatic payouts.",
    },
  ];

  const steps = activeTab === "buyer" ? buyerSteps : sellerSteps;

  return (
    <section
      id="how-it-works"
      className="py-20 px-4 md:px-10 bg-background-light"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
            How It Works
          </h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Simple, transparent process for both food lovers and home chefs
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-12 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setActiveTab("buyer")}
              className={`group flex flex-1 items-center justify-center gap-3 rounded-xl p-4 transition-all ${
                activeTab === "buyer"
                  ? "bg-brand-teal/10 ring-1 ring-brand-teal border-brand-teal"
                  : "bg-transparent hover:bg-gray-50 border border-transparent hover:border-gray-200"
              }`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full ${
                  activeTab === "buyer"
                    ? "bg-brand-teal text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white"
                } transition-colors`}
              >
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <div className="text-left">
                <p
                  className={`text-sm font-bold ${
                    activeTab === "buyer"
                      ? "text-brand-teal"
                      : "text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  For Foodies
                </p>
                <p className="text-xs font-medium text-gray-500">
                  I want to eat fresh
                </p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("seller")}
              className={`group flex flex-1 items-center justify-center gap-3 rounded-xl p-4 transition-all ${
                activeTab === "seller"
                  ? "bg-primary/10 ring-1 ring-primary border-primary"
                  : "bg-transparent hover:bg-gray-50 border border-transparent hover:border-gray-200"
              }`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full ${
                  activeTab === "seller"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-brand-teal group-hover:text-white"
                } transition-colors`}
              >
                <span className="material-symbols-outlined">soup_kitchen</span>
              </div>
              <div className="text-left">
                <p
                  className={`text-sm font-bold ${
                    activeTab === "seller"
                      ? "text-primary"
                      : "text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  For Home Chefs
                </p>
                <p className="text-xs font-medium text-gray-500">
                  I want to start a kitchen
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative flex gap-6 pb-12 last:pb-0"
              >
                <div className="absolute left-[22px] top-10 bottom-0 w-[2px] bg-gray-100 group-last:hidden"></div>
                <div
                  className={`relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full ${
                    step.number % 2 === 0
                      ? "bg-white border-2 border-brand-teal text-brand-teal"
                      : "bg-brand-teal text-white"
                  } shadow-lg shadow-brand-teal/20`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {step.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="sticky top-24 flex flex-col gap-6">
            <div className="overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100">
              <div className="aspect-video w-full bg-gradient-to-br from-brand-teal/20 to-primary/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="size-20 rounded-full bg-white/90 shadow-lg flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-3xl text-brand-teal">
                      {activeTab === "buyer" ? "restaurant" : "soup_kitchen"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark mb-2">
                    {activeTab === "buyer"
                      ? "Focus on Transparency"
                      : "KitchenOS Included"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeTab === "buyer"
                      ? "We visit every kitchen before they go live. We check for cleanliness, ingredient quality, and packaging standards."
                      : "Join hundreds of home chefs earning from their passion. We provide the tech, delivery, and marketing."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-brand-teal/10 to-primary/10 p-6 border border-brand-teal/20">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-teal text-white">
                  <span className="material-symbols-outlined">
                    sentiment_satisfied
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-brand-dark mb-1">
                    {activeTab === "buyer"
                      ? "Students & Professionals"
                      : "Flexible & Rewarding"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {activeTab === "buyer"
                      ? "Designed for busy schedules. Pause your subscription anytime you're out of town."
                      : "Work from your own kitchen, set your own hours, and earn competitive income."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
