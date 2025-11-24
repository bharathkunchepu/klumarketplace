import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faIdCard,
  faPhone,
  faEdit,
  faSave,
  faTimes,
  faCamera,
  faSpinner,
  faBox,
  faCheckCircle,
  faDollarSign,
  faChartLine,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import { authUtils } from '../utils/auth';
import userService, { type UpdateProfileData, type UserProfile } from '../services/userService';
import { toastUtils } from '../utils/toast';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');

  // Check authentication
  useEffect(() => {
    if (!authUtils.isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getCurrentProfile();
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
        });
      } catch (error: any) {
        toastUtils.showApiError(error, 'Failed to load profile');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (authUtils.isLoggedIn()) {
      fetchProfile();
    }
  }, [navigate]);

  // Validation
  const validateFirstName = (firstName: string): string | undefined => {
    if (!firstName.trim()) {
      return 'First name is required';
    }
    if (firstName.trim().length < 1) {
      return 'First name must be at least 1 character';
    }
    if (firstName.trim().length > 100) {
      return 'First name must be 100 characters or less';
    }
    return undefined;
  };

  const validateLastName = (lastName: string): string | undefined => {
    if (!lastName.trim()) {
      return 'Last name is required';
    }
    if (lastName.trim().length < 1) {
      return 'Last name must be at least 1 character';
    }
    if (lastName.trim().length > 100) {
      return 'Last name must be 100 characters or less';
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return undefined; // Phone is optional
    }
    if (phone.trim().length > 20) {
      return 'Phone number must be 20 characters or less';
    }
    // Phone pattern: ^[+]?[(]?[0-9]{1,4}[)]?[-\\s.]?[(]?[0-9]{1,4}[)]?[-\\s.]?[0-9]{1,9}$
    const phonePattern = /^[+]?[(]?[0-9]{1,4}[)]?[-\\s.]?[(]?[0-9]{1,4}[)]?[-\\s.]?[0-9]{1,9}$/;
    if (!phonePattern.test(phone.trim())) {
      return 'Please enter a valid phone number';
    }
    return undefined;
  };

  const validateField = (name: string, value: string): boolean => {
    let error: string | undefined;

    switch (name) {
      case 'firstName':
        error = validateFirstName(value);
        break;
      case 'lastName':
        error = validateLastName(value);
        break;
      case 'phone':
        error = validatePhone(value);
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
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name, value);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
    setTouched({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
      });
    }
    setErrors({});
    setTouched({});
  };

  const handleSave = async () => {
    // Mark all fields as touched
    const allFields = ['firstName', 'lastName', 'phone'];
    allFields.forEach((field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, formData[field as keyof typeof formData]);
    });

    // Check if form is valid
    const isValid = allFields.every((field) => {
      const fieldError = errors[field];
      if (fieldError) return false;
      return validateField(field, formData[field as keyof typeof formData]);
    });

    if (!isValid) {
      toastUtils.error('Please correct the errors in the form');
      return;
    }

    setIsSaving(true);
    try {
      const updateData: UpdateProfileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      if (formData.phone.trim()) {
        updateData.phone = formData.phone.trim();
      }

      const updatedProfile = await userService.updateProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      toastUtils.success('Profile updated successfully!');
    } catch (error: any) {
      toastUtils.showApiError(error, 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, WEBP, or GIF)');
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB');
      setSelectedImage(null);
      setImagePreview(null);
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    try {
      const updatedProfile = await userService.uploadProfileImage(selectedImage);
      setProfile(updatedProfile);
      setSelectedImage(null);
      setImagePreview(null);
      toastUtils.success('Profile image uploaded successfully!');
    } catch (error: any) {
      toastUtils.showApiError(error, 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImagePreview = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
    const fileInput = document.getElementById('profile-image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl text-royal-blue animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 font-heading font-bold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="text-body text-gray-600 font-body">
            Manage your profile information and view your trading statistics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-royal-blue to-royal-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-h3 font-heading font-bold text-white">
                    Profile Information
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={handleEdit}
                      className="text-white/90 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      <span className="text-body-sm font-body">Edit</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-royal-blue-100 bg-gray-100 flex items-center justify-center">
                      {profile.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt={`${profile.firstName} ${profile.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUserCircle} className="text-6xl text-gray-400" />
                      )}
                    </div>
                    {!isEditing && (
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 bg-royal-blue text-white p-3 rounded-full cursor-pointer hover:bg-royal-blue-600 transition-colors shadow-lg"
                        title="Change profile picture"
                      >
                        <FontAwesomeIcon icon={faCamera} />
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Image Upload Preview */}
                  {imagePreview && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full max-w-md">
                      <div className="flex items-center gap-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-body-sm font-body text-gray-700 mb-1">
                            {selectedImage?.name}
                          </p>
                          <p className="text-body-sm text-gray-500 font-body">
                            {(selectedImage?.size ? selectedImage.size / 1024 / 1024 : 0).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleImageUpload}
                            disabled={isUploading}
                            className="px-4 py-2 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isUploading ? (
                              <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon icon={faSave} />
                                Upload
                              </>
                            )}
                          </button>
                          <button
                            onClick={handleRemoveImagePreview}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-heading font-semibold text-button hover:bg-gray-300 transition-colors"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                          </button>
                        </div>
                      </div>
                      {imageError && (
                        <p className="mt-2 text-body-sm text-coral font-body">{imageError}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-body-sm font-body font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-royal-blue" />
                      First Name
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 border-2 rounded-lg font-body text-body focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all ${
                            errors.firstName && touched.firstName
                              ? 'border-coral'
                              : 'border-gray-200'
                          }`}
                        />
                        {errors.firstName && touched.firstName && (
                          <p className="mt-1 text-body-sm text-coral font-body">{errors.firstName}</p>
                        )}
                      </>
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg font-body text-body text-gray-900">
                        {profile.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-body-sm font-body font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-royal-blue" />
                      Last Name
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-3 border-2 rounded-lg font-body text-body focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all ${
                            errors.lastName && touched.lastName
                              ? 'border-coral'
                              : 'border-gray-200'
                          }`}
                        />
                        {errors.lastName && touched.lastName && (
                          <p className="mt-1 text-body-sm text-coral font-body">{errors.lastName}</p>
                        )}
                      </>
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg font-body text-body text-gray-900">
                        {profile.lastName}
                      </p>
                    )}
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-body-sm font-body font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faEnvelope} className="text-royal-blue" />
                      Email
                    </label>
                    <p className="px-4 py-3 bg-gray-50 rounded-lg font-body text-body text-gray-900">
                      {profile.email}
                    </p>
                    {profile.emailVerified && (
                      <p className="mt-1 text-body-sm text-green-600 font-body flex items-center gap-1">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-xs" />
                        Email verified
                      </p>
                    )}
                  </div>

                  {/* University ID (Read-only) */}
                  <div>
                    <label className="block text-body-sm font-body font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faIdCard} className="text-royal-blue" />
                      University ID
                    </label>
                    <p className="px-4 py-3 bg-gray-50 rounded-lg font-body text-body text-gray-900">
                      {profile.universityId}
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-body-sm font-body font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faPhone} className="text-royal-blue" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="+1234567890"
                          className={`w-full px-4 py-3 border-2 rounded-lg font-body text-body focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all ${
                            errors.phone && touched.phone
                              ? 'border-coral'
                              : 'border-gray-200'
                          }`}
                        />
                        {errors.phone && touched.phone && (
                          <p className="mt-1 text-body-sm text-coral font-body">{errors.phone}</p>
                        )}
                        <p className="mt-1 text-body-sm text-gray-500 font-body">
                          Optional - Enter your phone number
                        </p>
                      </>
                    ) : (
                      <p className="px-4 py-3 bg-gray-50 rounded-lg font-body text-body text-gray-900">
                        {profile.phone || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <label className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <p className="px-4 py-3 bg-gray-50 rounded-lg font-body text-body text-gray-900">
                      {profile.role}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 bg-royal-blue text-white rounded-lg font-heading font-semibold text-button hover:bg-royal-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-heading font-semibold text-button hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-royal-blue to-royal-blue-600 px-6 py-4">
                <h2 className="text-h3 font-heading font-bold text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartLine} />
                  Statistics
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Total Items */}
                <div className="p-4 bg-gradient-to-br from-royal-blue-50 to-royal-blue-100 rounded-lg border border-royal-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBox} className="text-royal-blue" />
                      <span className="text-body-sm font-body font-medium text-gray-700">Total Items</span>
                    </div>
                  </div>
                  <p className="text-h2 font-heading font-bold text-royal-blue">
                    {profile.statistics.totalItems}
                  </p>
                </div>

                {/* Active Items */}
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                      <span className="text-body-sm font-body font-medium text-gray-700">Active Items</span>
                    </div>
                  </div>
                  <p className="text-h2 font-heading font-bold text-green-600">
                    {profile.statistics.activeItems}
                  </p>
                </div>

                {/* Sold Items */}
                <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-teal" />
                      <span className="text-body-sm font-body font-medium text-gray-700">Sold Items</span>
                    </div>
                  </div>
                  <p className="text-h2 font-heading font-bold text-teal">
                    {profile.statistics.soldItems}
                  </p>
                </div>

                {/* Total Sales */}
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faDollarSign} className="text-amber" />
                      <span className="text-body-sm font-body font-medium text-gray-700">Total Sales</span>
                    </div>
                  </div>
                  <p className="text-h2 font-heading font-bold text-amber">
                    {formatCurrency(profile.statistics.totalSales)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

