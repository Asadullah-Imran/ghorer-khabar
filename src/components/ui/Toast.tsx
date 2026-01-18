"use client";

import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: "text-green-500",
    title: "text-green-900",
    message: "text-green-700",
    IconComponent: CheckCircle,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
    title: "text-red-900",
    message: "text-red-700",
    IconComponent: XCircle,
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "text-yellow-500",
    title: "text-yellow-900",
    message: "text-yellow-700",
    IconComponent: AlertCircle,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-500",
    title: "text-blue-900",
    message: "text-blue-700",
    IconComponent: Info,
  },
};

export default function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const style = toastStyles[type];
  const Icon = style.IconComponent;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg shadow-lg p-4 min-w-[320px] max-w-md animate-slide-down`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`${style.icon} flex-shrink-0 mt-0.5`} size={20} />
        
        <div className="flex-1 min-w-0">
          <h4 className={`${style.title} font-semibold text-sm`}>{title}</h4>
          {message && (
            <p className={`${style.message} text-sm mt-1`}>{message}</p>
          )}
        </div>

        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
