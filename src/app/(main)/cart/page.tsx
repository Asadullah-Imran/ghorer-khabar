import CartPageContent from "@/components/cart/CartPageContent";
import { INITIAL_CART_DATA } from "@/lib/dummy-data/cart";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-10 lg:px-40">
      <div className="w-full max-w-[1080px] mx-auto">
        {/* Page Heading */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-gray-900 text-3xl md:text-4xl font-black leading-tight tracking-tight">
            Your Food Cart
          </h1>
          <p className="text-gray-500 text-base font-normal">
            Review your order before checkout
          </p>
        </div>

        {/* Interactive Content */}
        <CartPageContent initialData={INITIAL_CART_DATA} />
      </div>
    </main>
  );
}
