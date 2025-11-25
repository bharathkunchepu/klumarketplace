import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { authUtils } from '../utils/auth';
import { toastUtils } from '../utils/toast';
import { ErrorMessages, extractErrorMessage } from '../utils/errorMessages';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (authUtils.isLoggedIn()) {
      navigate('/products', { replace: true });
    }
  }, [navigate]);

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return ErrorMessages.VALIDATION.EMAIL_REQUIRED;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ErrorMessages.VALIDATION.EMAIL_INVALID;
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return ErrorMessages.VALIDATION.PASSWORD_REQUIRED;
    }
    return undefined;
  };

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    let error: string | undefined;

    switch (name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      validateField(name as keyof FormData, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name as keyof FormData, value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Mark all fields as touched
    const allFields: (keyof FormData)[] = ['email', 'password'];
    allFields.forEach((field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    });

    // Validate all fields
    const validationErrors: FormErrors = {};
    allFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        validationErrors[field] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    console.log('🔵 Starting login attempt...');

    try {
      console.log('🔵 Calling authUtils.login...');
      const result = await authUtils.login({ email: formData.email, password: formData.password });

      console.log('🟢 Login resolved successfully:', result);
      console.log('🟢 isLoggedIn:', authUtils.isLoggedIn());

      // CRITICAL: Defensive check - verify token was actually set
      if (!authUtils.isLoggedIn()) {
        console.error('🔴 Login succeeded but no token found!');
        throw new Error('Login did not set authentication token');
      }

      console.log('🟢 About to navigate...');
      toastUtils.showLoginSuccess();
      navigate('/products', { replace: true });
    } catch (error: any) {
      console.log('🔴 Login threw error:', error);
      console.log('🔴 Error response:', error?.response);
      console.log('🔴 Error status:', error?.response?.status);
      const errorMessage = extractErrorMessage(error);
      const apiMessage = error?.response?.data?.message || errorMessage;

      // Show authentication errors inline on password field
      if (apiMessage && (
        apiMessage.toLowerCase().includes('invalid') ||
        apiMessage.toLowerCase().includes('incorrect') ||
        apiMessage.toLowerCase().includes('no account') ||
        apiMessage.toLowerCase().includes('not found') ||
        apiMessage.toLowerCase().includes('wrong password')
      )) {
        setErrors((prev) => ({
          ...prev,
          password: apiMessage || ErrorMessages.AUTH.INVALID_CREDENTIALS
        }));
      }
      // Account locked - show as toast
      else if (apiMessage && (
        apiMessage.toLowerCase().includes('locked') ||
        apiMessage.toLowerCase().includes('disabled')
      )) {
        toastUtils.error(apiMessage || ErrorMessages.AUTH.ACCOUNT_LOCKED);
      }
      // Network/server errors - show as toast
      else if (error?.code === 'ERR_NETWORK' ||
        error?.message === 'Network Error' ||
        (error?.response?.status && error.response.status >= 500)) {
        toastUtils.showApiError(error);
      }
      // Handle 401 errors specifically (invalid credentials)
      else if (error?.response?.status === 401) {
        setErrors((prev) => ({
          ...prev,
          password: apiMessage || ErrorMessages.AUTH.INVALID_CREDENTIALS
        }));
      }
      // Handle 400 errors (bad request)
      else if (error?.response?.status === 400) {
        setErrors((prev) => ({
          ...prev,
          password: apiMessage || ErrorMessages.AUTH.INVALID_CREDENTIALS
        }));
      }
      // Other errors - show inline on password field
      else {
        setErrors((prev) => ({
          ...prev,
          password: apiMessage || ErrorMessages.AUTH.INVALID_CREDENTIALS
        }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-royal-blue to-royal-blue-600 px-8 py-6">
            <h1 className="text-h1 font-heading font-bold text-white text-center">
              Welcome Back
            </h1>
            <p className="text-body text-white/90 text-center mt-2 font-body">
              Sign in to your KLU Marketplace account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                Email Address <span className="text-coral">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${errors.email && touched.email
                    ? 'border-coral focus:ring-coral focus:border-coral'
                    : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                    } focus:outline-none focus:ring-2`}
                  placeholder="yourname@kluniversity.edu"
                  autoComplete="email"
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                Password <span className="text-coral">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-md font-body text-body ${errors.password && touched.password
                    ? 'border-coral focus:ring-coral focus:border-coral'
                    : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                    } focus:outline-none focus:ring-2`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-body-sm text-royal-blue hover:text-royal-blue-600 font-body transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                role="button"

                disabled={isSubmitting}
                className="w-full bg-royal-blue text-white py-3 px-4 rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-body-sm text-gray-600 font-body">
                Don't have an account?{' '}
                <Link to="/signup" className="text-royal-blue hover:text-royal-blue-600 font-body font-medium">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

