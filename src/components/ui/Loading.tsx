interface LoadingProps {
  variant?: "full" | "inline" | "small";
  size?: "sm" | "md" | "lg";
}

export default function Loading({
  variant = "full",
  size = "md",
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const spinnerSize = sizeClasses[size];

  // Full page loading
  if (variant === "full") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div
          className={`${spinnerSize} border-4 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin`}
        />
      </div>
    );
  }

  // Inline loading (for sections)
  if (variant === "inline") {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className={`${spinnerSize} border-4 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin`}
        />
      </div>
    );
  }

  // Small loading (for buttons, small spaces)
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${spinnerSize} border-2 border-brand-teal/20 border-t-brand-teal rounded-full animate-spin`}
      />
    </div>
  );
}
