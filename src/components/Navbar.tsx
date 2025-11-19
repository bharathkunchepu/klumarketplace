import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { cartUtils } from '../utils/cart';
import { useScroll } from '../hooks/useScroll';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const scrolled = useScroll();
  const user = authUtils.getCurrentUser();

  useEffect(() => {
    const updateCartCount = () => {
      const items = cartUtils.loadCart();
      setCartCount(cartUtils.getCartCount(items));
    };
    
    updateCartCount();
    
    // Listen for custom storage events (for same-tab updates)
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event dispatched when cart changes
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="logo">KLU Marketplace</Link>
        <button
          className={`nav-toggle ${isMenuOpen ? 'open' : ''}`}
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
          </li>
          <li>
            <a href="#products" onClick={() => setIsMenuOpen(false)}>Products</a>
          </li>
          {!user ? (
            <li>
              <Link to="/signup" className="btn-signup" onClick={() => setIsMenuOpen(false)}>
                Join
              </Link>
            </li>
          ) : (
            <>
              <li>
                <Link to="/my-items" className={isActive('/my-items') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
                  My Items
                </Link>
              </li>
              <li>
                <Link to="/items/create" className={isActive('/items/create') ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>
                  Sell Item
                </Link>
              </li>
              <li>
                <Link to="/cart" className={`cart-link ${isActive('/cart') ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                  Cart <span className="cart-count">{cartCount}</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" id="nav-account" onClick={() => setIsMenuOpen(false)}>
                  {user.firstName ? (
                    <div className="nav-account-pill">
                      <div className="nav-account-name">{user.firstName}</div>
                    </div>
                  ) : (
                    <>
                      <span className="nav-avatar">👤</span>
                    </>
                  )}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

