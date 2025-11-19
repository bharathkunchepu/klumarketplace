import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-modern">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">KLU Marketplace</div>
            <p className="footer-tagline">
              A platform for students to buy and sell items within campus.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">📘</a>
              <a href="#" className="social-link" aria-label="Twitter">🐦</a>
              <a href="#" className="social-link" aria-label="Instagram">📷</a>
              <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Marketplace</h4>
              <ul>
                <li><Link to="/#products">Browse Items</Link></li>
                <li><Link to="/#about">About Us</Link></li>
                <li><a href="#how">How It Works</a></li>
                <li><Link to="/signup">Join Now</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Safety Guidelines</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQs</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Cookie Policy</a></li>
                <li><a href="#">Community Guidelines</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; 2025 KLU Marketplace. All rights reserved.</p>
            <p className="footer-made-with">
              Made with <span className="heart">❤️</span> for KLU students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

