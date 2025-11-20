import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { validateEmail } from '../utils/validation';
import AnimatedSection from '../components/AnimatedSection';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    const emailFromQuery = new URLSearchParams(location.search).get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [location]);

  const validateField = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      const result = validateEmail(value);
      setEmailError(result.error || '');
      return result.isValid;
    } else {
      if (!value) {
        setPasswordError('Password is required');
        return false;
      }
      setPasswordError('');
      return true;
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      validateField('email', email);
    } else {
      validateField('password', password);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      validateField('email', value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      validateField('password', value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);
    setEmailError('');
    setPasswordError('');

    try {
      await authUtils.login({ email, password });
      const redirect = (location.state as { redirect?: string })?.redirect || '/';
      navigate(redirect);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      if (message.includes('Account locked') || message.includes('locked')) {
        setPasswordError(message);
        setEmailError('');
      } else if (message.includes('No account found') || message.includes('Invalid email')) {
        setEmailError(message);
        setPasswordError('');
        setTimeout(() => {
          navigate('/signup', { state: { email, redirect: location.state } });
        }, 2000);
      } else if (message.includes('Invalid') && message.includes('password')) {
        setPasswordError(message);
        setEmailError('');
      } else {
        setPasswordError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedSection className="auth-section">
      <div className="auth-container">
        <div className="auth-card-modern">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h1>Welcome Back</h1>
            <p className="subtitle">Sign in to your KLU Marketplace account</p>
          </div>

          <form className="auth-form-modern" onSubmit={handleSubmit} noValidate>
            <div className="form-row-modern">
              <div className={`form-group-modern ${emailError ? 'error' : touched.email && email ? 'success' : ''}`}>
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your.email@klu.edu.in"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    className={emailError ? 'input-error' : ''}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? 'email-error' : undefined}
                  />
                  {touched.email && !emailError && email && (
                    <span className="input-success-icon">✓</span>
                  )}
                </div>
                {emailError && (
                  <span className="error-message-modern" id="email-error" role="alert">
                    {emailError}
                  </span>
                )}
                {touched.email && !emailError && email && (
                  <span className="success-message">Email looks good!</span>
                )}
              </div>

              <div className={`form-group-modern ${passwordError ? 'error' : touched.password && password ? 'success' : ''}`}>
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    className={passwordError ? 'input-error' : ''}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="toggle-password-modern"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {passwordError && (
                  <span className="error-message-modern" id="password-error" role="alert">
                    {passwordError}
                  </span>
                )}
              </div>
            </div>

            <div className="form-options">
              <div className="form-remember">
                <input type="checkbox" id="remember" name="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <Link to="#" className="forgot-password-link" onClick={(e) => { e.preventDefault(); alert('Password reset is not configured in this demo. Please contact the admin.'); }}>
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className="btn-primary-modern btn-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider-modern">
            <span>OR</span>
          </div>

          <div className="social-login-modern">
            <button type="button" className="btn-social-modern google" onClick={() => alert('Google login is not configured in this demo.')}>
              <span className="social-icon">G</span>
              <span>Continue with Google</span>
            </button>
            <button type="button" className="btn-social-modern facebook" onClick={() => alert('Facebook login is not configured in this demo.')}>
              <span className="social-icon">f</span>
              <span>Continue with Facebook</span>
            </button>
          </div>

          <p className="auth-link-modern">
            Don't have an account? <Link to="/signup">Sign Up Here</Link>
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Login;

