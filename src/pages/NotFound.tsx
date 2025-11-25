import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faSearch, 
  faBox, 
  faShoppingCart,
  faArrowLeft,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingItems, setFloatingItems] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Create floating items
  useEffect(() => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setFloatingItems(items);
  }, []);

  const quickLinks = [
    { path: '/', label: 'Home', icon: faHome },
    { path: '/products', label: 'Browse Products', icon: faBox },
    { path: '/products/create', label: 'Sell Item', icon: faShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-50 via-white to-coral-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingItems.map((item) => (
          <div
            key={item.id}
            className="absolute w-16 h-16 rounded-full opacity-10"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              background: item.id % 2 === 0 ? '#4169E1' : '#FF6B6B',
              animation: `float ${3 + item.delay}s ease-in-out infinite`,
              animationDelay: `${item.delay}s`,
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated 404 Number */}
          <div className="mb-8 relative">
            <h1 
              className="text-9xl md:text-[12rem] font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-royal-blue via-coral to-royal-blue animate-gradient-x"
              style={{
                transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon 
                icon={faExclamationTriangle} 
                className="text-6xl md:text-8xl text-amber-400 opacity-20 animate-pulse"
                style={{
                  transform: `translate(${-mousePosition.x * 0.2}px, ${-mousePosition.y * 0.2}px) rotate(15deg)`,
                }}
              />
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-8 space-y-4 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Oops! This Page Got Lost in the Marketplace
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 font-body max-w-2xl mx-auto">
              Looks like this item has been sold or moved! Don't worry, we've got plenty of other great finds waiting for you.
            </p>
          </div>

          {/* Interactive Search Box */}
          <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="max-w-md mx-auto relative">
              <div className="flex items-center bg-white rounded-full shadow-lg px-6 py-4 border-2 border-royal-blue-200 hover:border-royal-blue-400 transition-all duration-300">
                <FontAwesomeIcon icon={faSearch} className="text-royal-blue-500 mr-3 text-xl" />
                <input
                  type="text"
                  placeholder="Search for items..."
                  className="flex-1 outline-none text-gray-700 font-body text-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      navigate('/products');
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/"
              className="group flex items-center space-x-3 bg-royal-blue text-white px-8 py-4 rounded-full font-heading font-semibold text-button shadow-lg hover:shadow-xl hover:bg-royal-blue-600 transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faHome} className="text-xl group-hover:translate-x-1 transition-transform" />
              <span>Go Home</span>
            </Link>
            
            <Link
              to="/products"
              className="group flex items-center space-x-3 bg-coral text-white px-8 py-4 rounded-full font-heading font-semibold text-button shadow-lg hover:shadow-xl hover:bg-coral-600 transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faBox} className="text-xl group-hover:rotate-12 transition-transform" />
              <span>Browse Products</span>
            </Link>

            <button
              onClick={() => navigate(-1)}
              className="group flex items-center space-x-3 bg-white text-royal-blue border-2 border-royal-blue px-8 py-4 rounded-full font-heading font-semibold text-button shadow-lg hover:shadow-xl hover:bg-royal-blue-50 transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xl group-hover:-translate-x-1 transition-transform" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.6s' }}>
            {quickLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl border-2 border-transparent hover:border-royal-blue-300 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-royal-blue-100 to-coral-100 flex items-center justify-center group-hover:from-royal-blue-200 group-hover:to-coral-200 transition-all duration-300">
                    <FontAwesomeIcon 
                      icon={link.icon} 
                      className="text-2xl text-royal-blue-600 group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <span className="font-heading font-semibold text-gray-900 group-hover:text-royal-blue transition-colors">
                    {link.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Fun Message */}
          <div className="mt-12 animate-fade-in" style={{ animationDelay: '1s' }}>
            <p className="text-gray-500 font-body text-body-sm italic">
              "Not all who wander are lost... but this page definitely is!" 🛍️
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;

