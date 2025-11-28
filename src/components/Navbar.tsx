import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faUser,
  faBox,
  faSignOutAlt,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import { authUtils } from '../utils/auth';
import userService, { type UserProfile } from '../services/userService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Fetch user profile when logged in
  useEffect(() => {
    const loggedIn = authUtils.isLoggedIn();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const fetchProfile = async () => {
        try {
          const profile = await userService.getCurrentProfile();
          setUserProfile(profile);
        } catch (error) {
          // Silently fail - profile will just not show
          console.error('Failed to fetch user profile:', error);
        }
      };
      fetchProfile();
    } else {
      setUserProfile(null);
    }
  }, [location.pathname]); // Refetch when route changes (e.g., after profile update)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Only apply scroll-based styling on home page
    if (location.pathname !== '/') {
      setIsScrolled(true); // Always show white navbar on other pages
      return;
    }
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Change navbar style when scrolled past 100px on home page
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    authUtils.logout();
  };

  const navClasses = isScrolled
    ? 'bg-white border-b border-gray-200 shadow-md'
    : 'border-b border-transparent';

  const textClasses = isScrolled
    ? 'text-gray-700'
    : 'text-white';

  const logoClasses = isScrolled
    ? 'text-royal-blue'
    : 'text-white';

  // On home page, use absolute when transparent, sticky when scrolled
  // On other pages, always use sticky with white background
  const positionClass = location.pathname === '/'
    ? (!isScrolled ? 'absolute' : 'sticky')
    : 'sticky';

  return (
    <nav
      className={`${navClasses} ${positionClass} top-0 left-0 right-0 z-50 transition-all duration-300 ease-out`}
      style={!isScrolled && location.pathname === '/' ? {
        backgroundColor: 'transparent',
        background: 'transparent',
      } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img 
              src="/logo.png" 
              alt="KLU Marketplace" 
              className="h-10 w-auto transition-all duration-200 ease-out group-hover:scale-105"
            />
            <span className={`text-2xl font-heading font-bold ${logoClasses} transition-all duration-200 ease-out group-hover:scale-105 ${isScrolled ? 'group-hover:text-royal-blue-600' : 'group-hover:text-white/80'}`}>
              KLU Marketplace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`nav-link-item font-body relative group text-body-sm transition-all duration-300 ${
                location.pathname === '/'
                  ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                  : textClasses
              }`}
            >
              Home
              <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                location.pathname === '/'
                  ? 'w-full'
                  : 'w-0 group-hover:w-full'
              } ${isScrolled ? 'bg-royal-blue' : 'bg-white'}`}></span>
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link
                  to="/products"
                  className={`nav-link-item font-body relative group text-body-sm transition-all duration-300 ${
                    location.pathname === '/products'
                      ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                      : textClasses
                  }`}
                >
                  Products
                  <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    location.pathname === '/products'
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  } ${isScrolled ? 'bg-royal-blue' : 'bg-white'}`}></span>
                </Link>
                
                <Link
                  to="/profile"
                  className={`nav-link-item font-body relative group text-body-sm transition-all duration-300 ${
                    location.pathname === '/profile'
                      ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                      : textClasses
                  }`}
                >
                  Profile
                  <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    location.pathname === '/profile'
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  } ${isScrolled ? 'bg-royal-blue' : 'bg-white'}`}></span>
                </Link>
                
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isScrolled
                        ? 'hover:bg-gray-100 text-gray-700'
                        : 'hover:bg-white/20 text-white'
                    }`}
                  >
                    {/* Profile Image */}
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-royal-blue-200 flex items-center justify-center bg-gray-100">
                      {userProfile?.profileImageUrl ? (
                        <img
                          src={userProfile.profileImageUrl}
                          alt={`${userProfile.firstName} ${userProfile.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className={`text-lg ${isScrolled ? 'text-gray-400' : 'text-white/80'}`}
                        />
                      )}
                    </div>
                    {/* Name */}
                    <span className="font-body text-body-sm font-medium max-w-[120px] truncate">
                      {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border ${
                      isScrolled ? 'bg-white border-gray-200' : 'bg-white/95 backdrop-blur-sm border-white/20'
                    } py-2 z-50`}>
                      <Link
                        to="/my-items"
                        onClick={() => setIsDropdownOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors font-body ${
                          location.pathname === '/my-items' ? 'bg-gray-50 text-royal-blue font-semibold' : 'text-gray-700'
                        }`}
                      >
                        <FontAwesomeIcon icon={faBox} className="text-royal-blue" />
                        <span>My Items</span>
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600 font-body text-left"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nav-link-item font-body relative group text-body-sm transition-all duration-300 ${
                    location.pathname === '/login'
                      ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                      : textClasses
                  }`}
                >
                  Login
                  <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                    location.pathname === '/login'
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  } ${isScrolled ? 'bg-royal-blue' : 'bg-white'}`}></span>
                </Link>
                <Link
                  to="/signup"
                  className={`${isScrolled ? 'bg-royal-blue text-white' : 'bg-white/20 text-white border-2 border-white/50'} px-6 py-2 rounded-md font-heading font-semibold text-button transition-all duration-200 ease-out hover:bg-royal-blue-600 hover:shadow-md hover:scale-105 active:scale-95 backdrop-blur-sm`}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden ${textClasses} hover:opacity-80 transition-opacity`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 space-y-4 animate-fade-in ${isScrolled ? 'bg-white' : 'bg-transparent backdrop-blur-sm rounded-lg mt-2'}`}>
            <Link
              to="/"
              className={`block font-body transition-all duration-300 hover:translate-x-2 hover:font-medium text-body-sm ${
                location.pathname === '/'
                  ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                  : textClasses
              } ${isScrolled ? 'hover:text-royal-blue' : 'hover:text-white/80'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link
                  to="/products"
                  className={`block font-body transition-all duration-300 hover:translate-x-2 hover:font-medium text-body-sm ${
                    location.pathname === '/products'
                      ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                      : textClasses
                  } ${isScrolled ? 'hover:text-royal-blue' : 'hover:text-white/80'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                
                <Link
                  to="/profile"
                  className={`block font-body transition-all duration-300 hover:translate-x-2 hover:font-medium text-body-sm ${
                    location.pathname === '/profile'
                      ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                      : textClasses
                  } ${isScrolled ? 'hover:text-royal-blue' : 'hover:text-white/80'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                
                {/* User Profile Section in Mobile */}
                <div className={`pt-4 border-t ${isScrolled ? 'border-gray-200' : 'border-white/20'} mt-2`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-royal-blue-200 flex items-center justify-center bg-gray-100">
                      {userProfile?.profileImageUrl ? (
                        <img
                          src={userProfile.profileImageUrl}
                          alt={`${userProfile.firstName} ${userProfile.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className="text-xl text-gray-400"
                        />
                      )}
                    </div>
                    <div>
                      <p className={`font-body font-semibold ${textClasses}`}>
                        {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'User'}
                      </p>
                      {userProfile?.universityId && (
                        <p className={`text-body-sm font-body ${isScrolled ? 'text-gray-500' : 'text-white/70'}`}>
                          {userProfile.universityId}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/my-items"
                    className={`block font-body transition-all duration-300 hover:translate-x-2 hover:font-medium text-body-sm mb-2 ${
                      location.pathname === '/my-items'
                        ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                        : textClasses
                    } ${isScrolled ? 'hover:text-royal-blue' : 'hover:text-white/80'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Items
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full bg-coral text-white px-6 py-2 rounded-md hover:bg-coral-600 transition-all duration-300 font-heading font-semibold text-button text-center hover:shadow-md hover:scale-105 active:scale-95 mt-2`}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block font-body transition-all duration-300 hover:translate-x-2 hover:font-medium text-body-sm ${
                    location.pathname === '/login'
                      ? isScrolled ? 'text-royal-blue font-semibold' : 'text-white font-semibold'
                      : textClasses
                  } ${isScrolled ? 'hover:text-royal-blue' : 'hover:text-white/80'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`block ${isScrolled ? 'bg-royal-blue' : 'bg-white/20 border-2 border-white/50'} text-white px-6 py-2 rounded-md hover:bg-royal-blue-600 transition-all duration-300 font-heading font-semibold text-button text-center hover:shadow-md hover:scale-105 active:scale-95 backdrop-blur-sm`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

