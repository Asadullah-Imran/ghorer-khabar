import { BookOpen, ChefHat, Home, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* 1. Main Content */}
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
        {/* Illustration: Framed Empty Plate */}
        {/* Make sure your image is saved as 'public/empty-plate.png' */}
        <div className="relative w-full h-96 mx-auto mb-6 p-2 bg-white rounded-lg shadow-xl border-4 border-gray-200">
          <Image
            src="/empty-plate.png"
            alt="Framed Empty Plate"
            fill
            className="object-cover rounded-sm"
            priority
          />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-teal-900 tracking-tight">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900">
            Oops! Empty Plate.
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            We looked everywhere in the kitchen, but the page you are looking
            for has been taken off the menu.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {/* Yellow Home Button */}
          <Link
            href="/feed"
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Home size={18} />
            Return Home
          </Link>

          {/* Secondary Button */}
          <Link
            href="/explore"
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 hover:border-teal-200 text-gray-700 hover:text-teal-700 font-bold transition-all"
          >
            <Search size={18} />
            Browse Menu
          </Link>
        </div>
      </div>

      {/* 2. Helpful Links Grid */}
      <div className="mt-16 w-full max-w-2xl border-t border-gray-200 pt-10">
        <h3 className="text-gray-900 font-bold text-center mb-6">
          While you're here, try these:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/explore?tab=kitchens"
            className="group p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <ChefHat size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Find Chefs</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Verified home cooks nearby
              </p>
            </div>
          </Link>

          <Link
            href="/feed?category=plans"
            className="group p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-white transition-colors">
              <BookOpen size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Meal Plans</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Budget friendly tiffin
              </p>
            </div>
          </Link>

          <Link
            href="/support"
            className="group p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all flex flex-col items-center text-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Help Center</h4>
              <p className="text-xs text-gray-500 mt-0.5">Get support 24/7</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
