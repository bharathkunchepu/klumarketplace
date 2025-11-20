import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { SignupData } from '../types';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validatePhone, 
  validateConfirmPassword, 
  validateUniversityId,
  getPasswordStrength 
} from '../utils/validation';
import AnimatedSection from '../components/AnimatedSection';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    universityId: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignupData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof SignupData, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    const emailFromQuery = new URLSearchParams(location.search).get('email');
    if (emailFromQuery) {
      setFormData(prev => ({ ...prev, email: emailFromQuery }));
    }
  }, [location]);

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  const validateField = (name: keyof SignupData, value: string) => {
    let result;
    
    switch (name) {
      case 'firstName':
        result = validateName(value, 'First name');
        break;
      case 'lastName':
        result = validateName(value, 'Last name');
        break;
      case 'email':
        result = validateEmail(value);
        break;
      case 'phone':
        result = validatePhone(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'confirmPassword':
        result = validateConfirmPassword(formData.password, value);
        break;
      case 'universityId':
        result = validateUniversityId(value);
        break;
      default:
        result = { isValid: true };
    }

    setErrors(prev => ({
      ...prev,
      [name]: result.error
    }));

    return result.isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation for touched fields
    if (touched[name as keyof SignupData]) {
      validateField(name as keyof SignupData, value);
    }

    // Special handling for confirm password
    if (name === 'password' && touched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  const handleBlur = (field: keyof SignupData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldValue = formData[field];
    if (fieldValue !== undefined) {
      validateField(field, fieldValue);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields: (keyof SignupData)[] = ['firstName', 'lastName', 'email', 'phone', 'universityId', 'password', 'confirmPassword'];
    allFields.forEach(field => setTouched(prev => ({ ...prev, [field]: true })));

    // Validate all fields
    const validationResults = allFields.map(field => {
      const fieldValue = formData[field];
      if (fieldValue === undefined) {
        return false;
      }
      return validateField(field, fieldValue);
    });
    const isValid = validationResults.every(result => result);

    if (!isValid || !termsAccepted) {
      if (!termsAccepted) {
        alert('Please accept the Terms & Conditions to continue.');
      }
      return;
    }

    setIsSubmitting(true);

    try {
      await authUtils.signup(formData);
      const redirect = (location.state as { redirect?: string })?.redirect || '/';
      navigate(redirect, { state: { message: 'Account created successfully!' } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      if (message.includes('already exists')) {
        setErrors(prev => ({ ...prev, email: message }));
        setTimeout(() => {
          navigate('/login', { state: { email: formData.email, redirect: location.state } });
        }, 2000);
      } else {
        alert(message);
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
            <div className="auth-icon">🚀</div>
            <h1>Join KLU Marketplace</h1>
            <p className="subtitle">Create your account and start trading</p>
          </div>

          <form className="auth-form-modern" onSubmit={handleSubmit} noValidate>
            <div className="form-row-modern">
              <div className={`form-group-modern ${errors.firstName ? 'error' : touched.firstName && formData.firstName ? 'success' : ''}`}>
                <label htmlFor="firstname">
                  First Name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="firstname"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('firstName')}
                    className={errors.firstName ? 'input-error' : ''}
                    aria-invalid={!!errors.firstName}
                  />
                  {touched.firstName && !errors.firstName && formData.firstName && (
                    <span className="input-success-icon">✓</span>
                  )}
                </div>
                {errors.firstName && (
                  <span className="error-message-modern" role="alert">{errors.firstName}</span>
                )}
              </div>

              <div className={`form-group-modern ${errors.lastName ? 'error' : touched.lastName && formData.lastName ? 'success' : ''}`}>
                <label htmlFor="lastname">
                  Last Name <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="lastname"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('lastName')}
                    className={errors.lastName ? 'input-error' : ''}
                    aria-invalid={!!errors.lastName}
                  />
                  {touched.lastName && !errors.lastName && formData.lastName && (
                    <span className="input-success-icon">✓</span>
                  )}
                </div>
                {errors.lastName && (
                  <span className="error-message-modern" role="alert">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-row-modern">
              <div className={`form-group-modern ${errors.email ? 'error' : touched.email && formData.email ? 'success' : ''}`}>
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
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className={errors.email ? 'input-error' : ''}
                    aria-invalid={!!errors.email}
                  />
                  {touched.email && !errors.email && formData.email && (
                    <span className="input-success-icon">✓</span>
                  )}
                </div>
                {errors.email && (
                  <span className="error-message-modern" role="alert">{errors.email}</span>
                )}
                {touched.email && !errors.email && formData.email && (
                  <span className="success-message">Valid KLU email!</span>
                )}
              </div>

              <div className={`form-group-modern ${errors.phone ? 'error' : touched.phone && formData.phone ? 'success' : ''}`}>
                <label htmlFor="phone">
                  Phone Number <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleBlur('phone')}
                    className={errors.phone ? 'input-error' : ''}
                    aria-invalid={!!errors.phone}
                    maxLength={10}
                  />
                  {touched.phone && !errors.phone && formData.phone && (
                    <span className="input-success-icon">✓</span>
                  )}
                </div>
                {errors.phone && (
                  <span className="error-message-modern" role="alert">{errors.phone}</span>
                )}
              </div>
            </div>

            <div className={`form-group-modern ${errors.universityId ? 'error' : touched.universityId && formData.universityId ? 'success' : ''}`}>
              <label htmlFor="universityId">
                University ID <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🎓</span>
                <input
                  type="text"
                  id="universityId"
                  name="universityId"
                  placeholder="STU001"
                  value={formData.universityId}
                  onChange={handleChange}
                  onBlur={() => handleBlur('universityId')}
                  className={errors.universityId ? 'input-error' : ''}
                  aria-invalid={!!errors.universityId}
                  maxLength={20}
                />
                {touched.universityId && !errors.universityId && formData.universityId && (
                  <span className="input-success-icon">✓</span>
                )}
              </div>
              {errors.universityId && (
                <span className="error-message-modern" role="alert">{errors.universityId}</span>
              )}
            </div>

            <div className="form-row-modern">
              <div className={`form-group-modern ${errors.password ? 'error' : touched.password && formData.password ? 'success' : ''}`}>
                <label htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    className={errors.password ? 'input-error' : ''}
                    aria-invalid={!!errors.password}
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
                {formData.password && passwordStrength && (
                  <div className="password-strength">
                    <div className="strength-label">Password Strength:</div>
                    <div className="strength-bar">
                      <div 
                        className={`strength-fill ${passwordStrength.strength}`}
                        style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                      ></div>
                    </div>
                    <span className={`strength-text ${passwordStrength.strength}`}>
                      {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <span className="error-message-modern" role="alert">{errors.password}</span>
                )}
                {touched.password && !errors.password && formData.password && (
                  <div className="password-requirements">
                    <span className="requirement-item success">✓ At least 8 characters</span>
                    <span className={`requirement-item ${/(?=.*[a-z])/.test(formData.password) ? 'success' : ''}`}>
                      {/(?=.*[a-z])/.test(formData.password) ? '✓' : '○'} Lowercase letter
                    </span>
                    <span className={`requirement-item ${/(?=.*[A-Z])/.test(formData.password) ? 'success' : ''}`}>
                      {/(?=.*[A-Z])/.test(formData.password) ? '✓' : '○'} Uppercase letter
                    </span>
                    <span className={`requirement-item ${/(?=.*\d)/.test(formData.password) ? 'success' : ''}`}>
                      {/(?=.*\d)/.test(formData.password) ? '✓' : '○'} Number
                    </span>
                  </div>
                )}
              </div>

              <div className={`form-group-modern ${errors.confirmPassword ? 'error' : touched.confirmPassword && formData.confirmPassword && !errors.confirmPassword ? 'success' : ''}`}>
                <label htmlFor="confirm-password">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={errors.confirmPassword ? 'input-error' : ''}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    className="toggle-password-modern"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message-modern" role="alert">{errors.confirmPassword}</span>
                )}
                {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <span className="success-message">Passwords match!</span>
                )}
              </div>
            </div>

            <div className={`form-agree-modern ${!termsAccepted && touched.confirmPassword ? 'error' : ''}`}>
              <input 
                type="checkbox" 
                id="terms" 
                name="terms" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the <Link to="#" className="terms-link">Terms & Conditions</Link>
              </label>
            </div>
            {!termsAccepted && touched.confirmPassword && (
              <span className="error-message-modern">Please accept the Terms & Conditions</span>
            )}

            <button 
              type="submit" 
              className="btn-primary-modern btn-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
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
            Already have an account? <Link to="/login">Sign In Here</Link>
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Signup;

