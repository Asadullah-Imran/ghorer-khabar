const TrustBanner = () => {
  const trustPoints = [
    { icon: "verified_user", text: "100% Verified Kitchens" },
    { icon: "health_and_safety", text: "Hygiene Certified" },
    { icon: "eco", text: "Fresh Ingredients" },
    { icon: "local_shipping", text: "Contactless Delivery" },
  ];

  return (
    <div className="bg-white border-b border-[#f5f3f0] py-6">
      <div className="container mx-auto px-4 md:px-10 flex flex-wrap justify-center gap-8 md:gap-16 text-center">
        {trustPoints.map((point, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-brand-dark/70 font-semibold"
          >
            <span className="material-symbols-outlined text-brand-teal">
              {point.icon}
            </span>
            {point.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBanner;
