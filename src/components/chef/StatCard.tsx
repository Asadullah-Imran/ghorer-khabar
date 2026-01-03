import { ArrowDown, ArrowUp, TrendingUp } from "lucide-react";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  backgroundColor = "bg-white",
  textColor = "text-gray-900",
  iconColor = "text-teal-600",
  badge,
  badgeColor = "bg-green-100 text-green-800",
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`${backgroundColor} rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition cursor-${
        onClick ? "pointer" : "default"
      }`}
    >
      {/* Top Section: Title & Icon */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        {icon && <div className={`${iconColor} text-2xl`}>{icon}</div>}
      </div>

      {/* Value Section */}
      <div className="mb-4">
        <div className={`text-3xl font-black ${textColor} leading-tight`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Bottom Section: Trend & Badge */}
      <div className="flex items-center justify-between">
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? (
              <ArrowUp size={16} />
            ) : (
              <ArrowDown size={16} />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
        {badge && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
