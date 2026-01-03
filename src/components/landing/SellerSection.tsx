import Link from "next/link";

const SellerSection = () => {
  const features = [
    {
      icon: "dashboard",
      title: "Kitchen Manager",
      description:
        "Manage orders, inventory, and your daily menu from a single, intuitive dashboard.",
    },
    {
      icon: "account_balance_wallet",
      title: "Seamless Payouts",
      description:
        "Get paid securely and on time directly to your bank account every week.",
    },
    {
      icon: "calendar_month",
      title: "Flexible Schedule",
      description:
        "Cook when you want. You set your own availability and order limits.",
    },
    {
      icon: "trending_up",
      title: "Growth Tools",
      description:
        "Access insights on popular dishes and pricing strategies to grow your sales.",
    },
  ];

  return (
    <section id="seller" className="py-20 px-4 md:px-10 bg-[#f0fdfa]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
              <span className="w-8 h-[2px] bg-primary"></span>
              For Home Chefs
            </div>

            <h2 className="text-4xl font-bold text-brand-dark leading-tight">
              Your kitchen, your rules.
              <br /> Our technology.
            </h2>

            <p className="text-lg text-gray-600">
              Transform your culinary passion into a thriving business. We
              handle the logistics, payments, and marketing so you can focus on
              cooking.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl bg-white border border-gray-100 shadow-sm flex flex-col gap-3"
                >
                  <div className="text-primary">
                    <span className="material-symbols-outlined text-3xl">
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="font-bold text-brand-dark">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Link
                href="/register?role=seller"
                className="rounded-xl px-6 py-3 bg-brand-teal text-white font-bold hover:bg-brand-teal/90 transition-colors w-fit shadow-lg shadow-brand-teal/20"
              >
                Become a Partner Chef
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-tr from-brand-teal/20 to-primary/20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellerSection;
