import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href: string; // Where "See More" points to (e.g., /explore?tab=dishes)
}

export default function SectionHeader({
  title,
  subtitle,
  href,
}: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6 px-4 md:px-0">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <Link
        href={href}
        className="text-teal-600 font-semibold text-sm flex items-center gap-1 hover:text-teal-800 transition"
      >
        See all <ArrowRight size={16} />
      </Link>
    </div>
  );
}
