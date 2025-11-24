import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faIdCard, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { authUtils } from '../utils/auth';
import { toastUtils } from '../utils/toast';
import { ErrorMessages, extractErrorMessage } from '../utils/errorMessages';

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  universityId: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  universityId?: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    universityId: '',
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
    if (!email.endsWith('@kluniversity.edu')) {
      return ErrorMessages.REGISTRATION.INVALID_EMAIL_DOMAIN;
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return ErrorMessages.VALIDATION.PASSWORD_REQUIRED;
    }
    if (password.length < 8) {
      return ErrorMessages.VALIDATION.PASSWORD_TOO_SHORT;
    }
    if (password.length > 100) {
      return ErrorMessages.VALIDATION.PASSWORD_TOO_LONG;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return ErrorMessages.VALIDATION.PASSWORD_NO_LOWERCASE;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return ErrorMessages.VALIDATION.PASSWORD_NO_UPPERCASE;
    }
    if (!/(?=.*\d)/.test(password)) {
      return ErrorMessages.VALIDATION.PASSWORD_NO_NUMBER;
    }
    return undefined;
  };

  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name.trim()) {
      return fieldName === 'First name' 
        ? ErrorMessages.VALIDATION.FIRST_NAME_REQUIRED 
        : ErrorMessages.VALIDATION.LAST_NAME_REQUIRED;
    }
    if (name.trim().length < 2) {
      return fieldName === 'First name'
        ? ErrorMessages.VALIDATION.FIRST_NAME_TOO_SHORT
        : ErrorMessages.VALIDATION.LAST_NAME_TOO_SHORT;
    }
    if (name.trim().length > 50) {
      return fieldName === 'First name'
        ? ErrorMessages.VALIDATION.FIRST_NAME_TOO_LONG
        : ErrorMessages.VALIDATION.LAST_NAME_TOO_LONG;
    }
    return undefined;
  };

  const validateUniversityId = (universityId: string): string | undefined => {
    if (!universityId.trim()) {
      return ErrorMessages.VALIDATION.UNIVERSITY_ID_REQUIRED;
    }
    if (universityId.trim().length > 20) {
      return ErrorMessages.VALIDATION.UNIVERSITY_ID_TOO_LONG;
    }
    return undefined;
  };

  const validateField = (name: keyof FormData, value: string): boolean => {
    let error: string | undefined;

    switch (name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'firstName':
        error = validateName(value, 'First name');
        break;
      case 'lastName':
        error = validateName(value, 'Last name');
        break;
      case 'universityId':
        error = validateUniversityId(value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return !error;
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
    
    // Mark all fields as touched
    const allFields: (keyof FormData)[] = ['email', 'password', 'firstName', 'lastName', 'universityId'];
    allFields.forEach((field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, formData[field]);
    });

    // Check if form is valid
    const isValid = allFields.every((field) => {
      const fieldError = errors[field];
      if (fieldError) return false;
      return validateField(field, formData[field]);
    });

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await authUtils.signup(formData);
      toastUtils.showRegistrationSuccess();
      // If token is received, redirect to products page
      // Otherwise, redirect to login page
      if (authUtils.isLoggedIn()) {
        navigate('/products', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error);
      const apiMessage = error?.response?.data?.message || errorMessage;
      
      // Email already exists - show inline on email field
      if (apiMessage.toLowerCase().includes('email') && 
          (apiMessage.toLowerCase().includes('already') || 
           apiMessage.toLowerCase().includes('exists') ||
           apiMessage.toLowerCase().includes('registered'))) {
        setErrors((prev) => ({ 
          ...prev, 
          email: apiMessage || ErrorMessages.REGISTRATION.EMAIL_EXISTS 
        }));
      }
      // University ID already exists - show inline on universityId field
      else if (apiMessage.toLowerCase().includes('university') || 
               apiMessage.toLowerCase().includes('universityid') ||
               apiMessage.toLowerCase().includes('university id')) {
        if (apiMessage.toLowerCase().includes('already') || 
            apiMessage.toLowerCase().includes('exists')) {
          setErrors((prev) => ({ 
            ...prev, 
            universityId: apiMessage || ErrorMessages.REGISTRATION.UNIVERSITY_ID_EXISTS 
          }));
        } else {
          setErrors((prev) => ({ 
            ...prev, 
            universityId: apiMessage || ErrorMessages.REGISTRATION.INVALID_UNIVERSITY_ID 
          }));
        }
      }
      // Network/server errors - show as toast
      else if (error?.code === 'ERR_NETWORK' || 
               error?.message === 'Network Error' ||
               error?.response?.status >= 500) {
        toastUtils.showApiError(error);
      }
      // Validation errors from backend - show inline
      else if (error?.response?.status === 400) {
        // Try to map to specific fields
        if (apiMessage.toLowerCase().includes('email')) {
          setErrors((prev) => ({ ...prev, email: apiMessage }));
        } else if (apiMessage.toLowerCase().includes('password')) {
          setErrors((prev) => ({ ...prev, password: apiMessage }));
        } else if (apiMessage.toLowerCase().includes('firstname') || 
                   apiMessage.toLowerCase().includes('first name')) {
          setErrors((prev) => ({ ...prev, firstName: apiMessage }));
        } else if (apiMessage.toLowerCase().includes('lastname') || 
                   apiMessage.toLowerCase().includes('last name')) {
          setErrors((prev) => ({ ...prev, lastName: apiMessage }));
        } else {
          toastUtils.error(apiMessage || ErrorMessages.REGISTRATION.REGISTRATION_FAILED);
        }
      }
      // Other errors - show as toast
      else {
        toastUtils.error(apiMessage || ErrorMessages.REGISTRATION.REGISTRATION_FAILED);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-royal-blue to-royal-blue-600 px-8 py-6">
            <h1 className="text-h1 font-heading font-bold text-white text-center">
              Create Your Account
            </h1>
            <p className="text-body text-white/90 text-center mt-2 font-body">
              Join KLU Marketplace and start buying and selling today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                  First Name <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${
                      errors.firstName && touched.firstName
                        ? 'border-coral focus:ring-coral focus:border-coral'
                        : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.firstName && touched.firstName && (
                  <p className="mt-1 text-body-sm text-coral font-body">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                  Last Name <span className="text-coral">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${
                      errors.lastName && touched.lastName
                        ? 'border-coral focus:ring-coral focus:border-coral'
                        : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                    } focus:outline-none focus:ring-2`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.lastName && touched.lastName && (
                  <p className="mt-1 text-body-sm text-coral font-body">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${
                    errors.email && touched.email
                      ? 'border-coral focus:ring-coral focus:border-coral'
                      : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                  } focus:outline-none focus:ring-2`}
                  placeholder="yourname@kluniversity.edu"
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.email}</p>
              )}
              <p className="mt-1 text-body-sm text-gray-500 font-body">
                Must be a KL University email address
              </p>
            </div>

            {/* University ID */}
            <div>
              <label htmlFor="universityId" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                University ID <span className="text-coral">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faIdCard} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="universityId"
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body uppercase ${
                    errors.universityId && touched.universityId
                      ? 'border-coral focus:ring-coral focus:border-coral'
                      : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                  } focus:outline-none focus:ring-2`}
                  placeholder="STU003"
                  maxLength={20}
                />
              </div>
              {errors.universityId && touched.universityId && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.universityId}</p>
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
                  className={`block w-full pl-10 pr-10 py-3 border rounded-md font-body text-body ${
                    errors.password && touched.password
                      ? 'border-coral focus:ring-coral focus:border-coral'
                      : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                  } focus:outline-none focus:ring-2`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.password}</p>
              )}
              <div className="mt-2 text-body-sm text-gray-600 font-body">
                <p className="mb-1">Password must contain:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li className={formData.password.length >= 8 ? 'text-green' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green' : ''}>
                    One lowercase letter
                  </li>
                  <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green' : ''}>
                    One uppercase letter
                  </li>
                  <li className={/(?=.*\d)/.test(formData.password) ? 'text-green' : ''}>
                    One number
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-royal-blue text-white py-3 px-4 rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-body-sm text-gray-600 font-body">
                Already have an account?{' '}
                <Link to="/login" className="text-royal-blue hover:text-royal-blue-600 font-body font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

