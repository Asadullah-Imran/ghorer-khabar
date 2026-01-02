const Footer = () => {
  const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
    { name: "Contact", href: "#" },
  ];

  const communityLinks = [
    { name: "For Chefs", href: "#seller" },
    { name: "For Foodies", href: "#buyer" },
    { name: "Safety Guidelines", href: "#safety" },
    { name: "Blog", href: "#" },
  ];

  const legalLinks = [
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ];

  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary text-brand-dark">
                <span className="material-symbols-outlined text-sm">
                  soup_kitchen
                </span>
              </div>
              <h3 className="text-lg font-bold">Ghorer Khabar</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bringing the authentic taste of home to your doorstep. Healthy,
              transparent, and delicious.
            </p>
            <div className="flex gap-4 mt-2">
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <span className="sr-only">Facebook</span>FB
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <span className="sr-only">Twitter</span>TW
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <span className="sr-only">Instagram</span>IG
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg">Company</h4>
            {companyLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-primary transition-colors text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg">Community</h4>
            {communityLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-primary transition-colors text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg">Legal</h4>
            {legalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-primary transition-colors text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2024 Ghorer Khabar. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
