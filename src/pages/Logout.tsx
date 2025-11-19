import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import { authUtils } from '../utils/auth';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authUtils.logout();
  }, []);

  return (
    <AnimatedSection className="auth-section">
      <div className="auth-container">
        <div className="auth-card">
          <h1>Logged Out</h1>
          <p className="subtitle">You have been safely signed out of your account.</p>
          <div className="info-card" style={{ marginTop: '1.5rem' }}>
            <h3>What's next?</h3>
            <ul>
              <li>Browse the latest listings on the marketplace.</li>
              <li>Sign back in to manage your own listings.</li>
              <li>Stay tuned for campus deals and updates.</li>
            </ul>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '2rem' }}>
            <button className="btn-primary btn-full" onClick={() => navigate('/')}>Return to Home</button>
            <button className="btn-ghost btn-full" onClick={() => navigate('/login')}>Sign In Again</button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Logout;

