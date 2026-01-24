import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <p>© 2024 Ghorer Khabar. All rights reserved.</p>
          <Link
            href="/support"
            className="hover:text-brand-teal transition-colors"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
