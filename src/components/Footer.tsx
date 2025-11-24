import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (location.pathname !== '/') {
        window.location.href = `/${href}`;
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-h3 font-heading font-semibold text-royal-blue mb-4">
              KLU Marketplace
            </h3>
            <p className="text-body-sm text-gray-600 font-body mb-4">
              Your trusted platform for buying and selling items within the KLU community.
              Connect with fellow students and make the most of your campus experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-body-sm font-heading font-semibold text-gray-900 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/#how-it-works"
                  onClick={(e) => handleAnchorClick(e, '#how-it-works')}
                  className="text-body-sm text-gray-600 hover:text-royal-blue transition-colors font-body cursor-pointer"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  onClick={(e) => handleAnchorClick(e, '#about')}
                  className="text-body-sm text-gray-600 hover:text-royal-blue transition-colors font-body cursor-pointer"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  onClick={(e) => handleAnchorClick(e, '#services')}
                  className="text-body-sm text-gray-600 hover:text-royal-blue transition-colors font-body cursor-pointer"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="/#reviews"
                  onClick={(e) => handleAnchorClick(e, '#reviews')}
                  className="text-body-sm text-gray-600 hover:text-royal-blue transition-colors font-body cursor-pointer"
                >
                  Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-body-sm font-heading font-semibold text-gray-900 mb-4">
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@klumarketplace.com"
                  className="text-body-sm text-gray-600 hover:text-royal-blue transition-colors font-body"
                >
                  support@klumarketplace.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="text-body-sm text-gray-600 hover:text-royal-blue transition-colors font-body"
                >
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-body-sm text-gray-600 font-body">
            © {new Date().getFullYear()} KLU Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

