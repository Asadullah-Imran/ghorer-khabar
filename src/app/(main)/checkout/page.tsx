import CheckoutPageContent from "@/components/checkout/CheckoutPageContent";
import { CHECKOUT_USER_DATA } from "@/lib/dummy-data/checkout";
import Link from "next/link";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 2. Main Content */}
      <main className="grow py-8 px-4 md:px-10 lg:px-40">
        <div className="max-w-5xl mx-auto w-full">
          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-teal-900 text-3xl md:text-4xl font-black leading-tight mb-2">
              Secure Checkout
            </h1>
            <p className="text-gray-500 text-base font-normal">
              Complete your order details below to enjoy your home-cooked meal.
            </p>
            <div className="mt-3">
              <Link
                href="/cart"
                className="inline-flex items-center text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>

          {/* Form Component */}
          <CheckoutPageContent userData={CHECKOUT_USER_DATA} />
        </div>
      </main>
    </div>
  );
}
