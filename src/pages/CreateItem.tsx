import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTag, 
  faDollarSign, 
  faFileAlt, 
  faMapMarkerAlt, 
  faPhone,
  faSpinner,
  faUpload,
  faTimes,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import itemService, { type CreateItemData } from '../services/itemService';
import { toastUtils } from '../utils/toast';
import { authUtils } from '../utils/auth';
import { ItemCategory, ItemCondition } from '../types';

interface FormData {
  title: string;
  description: string;
  price: string;
  category: ItemCategory | '';
  condition: ItemCondition | '';
  location: string;
  contactInfo: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  condition?: string;
  location?: string;
  contactInfo?: string;
}

const CreateItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    contactInfo: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string>('');

  // Check authentication
  useEffect(() => {
    if (!authUtils.isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  // Validation functions
  const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) {
      return 'Title is required';
    }
    if (title.trim().length < 3) {
      return 'Title must be at least 3 characters';
    }
    if (title.trim().length > 200) {
      return 'Title must be 200 characters or less';
    }
    return undefined;
  };

  const validateDescription = (description: string): string | undefined => {
    if (description.length > 5000) {
      return 'Description must be 5000 characters or less';
    }
    return undefined;
  };

  const validatePrice = (price: string): string | undefined => {
    if (!price.trim()) {
      return 'Price is required';
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      return 'Price must be a valid number';
    }
    if (priceNum < 0.01) {
      return 'Price must be at least 0.01';
    }
    // Check for max 8 integer digits and 2 decimal places
    const parts = price.split('.');
    if (parts[0].length > 8) {
      return 'Price cannot exceed 8 digits before decimal';
    }
    if (parts[1] && parts[1].length > 2) {
      return 'Price can have maximum 2 decimal places';
    }
    // Check total digits (8 integer + 2 decimal = 10 total digits max)
    const totalDigits = price.replace('.', '').length;
    if (totalDigits > 10) {
      return 'Price cannot exceed 10 total digits';
    }
    return undefined;
  };

  const validateCategory = (category: ItemCategory | ''): string | undefined => {
    if (!category) {
      return 'Category is required';
    }
    return undefined;
  };

  const validateCondition = (condition: ItemCondition | ''): string | undefined => {
    if (!condition) {
      return 'Condition is required';
    }
    return undefined;
  };

  const validateLocation = (location: string): string | undefined => {
    if (location.length > 200) {
      return 'Location must be 200 characters or less';
    }
    return undefined;
  };

  const validateContactInfo = (contactInfo: string): string | undefined => {
    if (contactInfo.length > 100) {
      return 'Contact information must be 100 characters or less';
    }
    return undefined;
  };

  const validateField = (name: keyof FormData, value: string | ItemCategory | ItemCondition): boolean => {
    let error: string | undefined;

    switch (name) {
      case 'title':
        error = validateTitle(value as string);
        break;
      case 'description':
        error = validateDescription(value as string);
        break;
      case 'price':
        error = validatePrice(value as string);
        break;
      case 'category':
        error = validateCategory(value as ItemCategory | '');
        break;
      case 'condition':
        error = validateCondition(value as ItemCondition | '');
        break;
      case 'location':
        error = validateLocation(value as string);
        break;
      case 'contactInfo':
        error = validateContactInfo(value as string);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return !error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      validateField(name as keyof FormData, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateField(name as keyof FormData, value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow only numbers and one decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    setFormData((prev) => ({
      ...prev,
      price: value,
    }));

    if (touched.price) {
      validateField('price', value);
    }
  };

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPG, PNG, WEBP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    setImageError('');
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields: (keyof FormData)[] = ['title', 'description', 'price', 'category', 'condition', 'location', 'contactInfo'];
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
      toastUtils.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemData: CreateItemData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        category: formData.category as ItemCategory,
        condition: formData.condition as ItemCondition,
      };

      // Add optional fields only if they have values
      if (formData.description.trim()) {
        itemData.description = formData.description.trim();
      }
      if (formData.location.trim()) {
        itemData.location = formData.location.trim();
      }
      if (formData.contactInfo.trim()) {
        itemData.contactInfo = formData.contactInfo.trim();
      }

      await itemService.createItem(itemData, selectedImage || undefined);
      toastUtils.success('Item created successfully!');
      navigate('/products');
    } catch (error: any) {
      toastUtils.showApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-h1 font-heading font-bold text-gray-900 mb-2">
            Create New Item
          </h1>
          <p className="text-body text-gray-600 font-body">
            List your item for sale on KLU Marketplace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 space-y-6">
          {/* Title - Required */}
          <div>
            <label htmlFor="title" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
              Title <span className="text-coral">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faTag} className="text-gray-400" />
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${
                  errors.title && touched.title
                    ? 'border-coral focus:ring-coral focus:border-coral'
                    : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                } focus:outline-none focus:ring-2`}
                placeholder="e.g., Calculus Textbook - 3rd Edition"
                maxLength={200}
              />
            </div>
            {errors.title && touched.title && (
              <p className="mt-1 text-body-sm text-coral font-body">{errors.title}</p>
            )}
            <p className="mt-1 text-body-sm text-gray-500 font-body">
              {formData.title.length}/200 characters (minimum 3)
            </p>
          </div>

          {/* Description - Optional */}
          <div>
            <label htmlFor="description" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FontAwesomeIcon icon={faFileAlt} className="text-gray-400" />
              </div>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={5}
                className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${
                  errors.description && touched.description
                    ? 'border-coral focus:ring-coral focus:border-coral'
                    : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                } focus:outline-none focus:ring-2`}
                placeholder="Provide detailed information about your item..."
                maxLength={5000}
              />
            </div>
            {errors.description && touched.description && (
              <p className="mt-1 text-body-sm text-coral font-body">{errors.description}</p>
            )}
            <p className="mt-1 text-body-sm text-gray-500 font-body">
              {formData.description.length}/5000 characters
            </p>
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price - Required */}
            <div>
              <label htmlFor="price" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                Price (₹) <span className="text-coral">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faDollarSign} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handlePriceChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${
                    errors.price && touched.price
                      ? 'border-coral focus:ring-coral focus:border-coral'
                      : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                  } focus:outline-none focus:ring-2`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && touched.price && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.price}</p>
              )}
              <p className="mt-1 text-body-sm text-gray-500 font-body">
                Minimum: ₹0.01, Max 8 digits + 2 decimals
              </p>
            </div>

            {/* Category - Required */}
            <div>
              <label htmlFor="category" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                Category <span className="text-coral">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <FontAwesomeIcon icon={faTag} className="text-gray-400" />
                </div>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body appearance-none bg-white ${
                    errors.category && touched.category
                      ? 'border-coral focus:ring-coral focus:border-coral'
                      : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                  } focus:outline-none focus:ring-2`}
                >
                  <option value="">Select a category</option>
                  <option value={ItemCategory.BOOKS}>Books</option>
                  <option value={ItemCategory.ELECTRONICS}>Electronics</option>
                  <option value={ItemCategory.CLOTHING}>Clothing</option>
                  <option value={ItemCategory.FURNITURE}>Furniture</option>
                  <option value={ItemCategory.SPORTS}>Sports</option>
                  <option value={ItemCategory.STATIONERY}>Stationery</option>
                  <option value={ItemCategory.VEHICLES}>Vehicles</option>
                  <option value={ItemCategory.OTHER}>Other</option>
                </select>
              </div>
              {errors.category && touched.category && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Condition - Required */}
          <div>
            <label htmlFor="condition" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
              Condition <span className="text-coral">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.entries(ItemCondition).map(([, value]) => (
                <label
                  key={value}
                  className={`flex items-center justify-center p-3 border-2 rounded-md cursor-pointer transition-all ${
                    formData.condition === value
                      ? 'border-royal-blue bg-royal-blue-50 text-royal-blue'
                      : 'border-gray-200 hover:border-royal-blue-300'
                  } ${errors.condition && touched.condition ? 'border-coral' : ''}`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={value}
                    checked={formData.condition === value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="sr-only"
                  />
                  <span className="text-body-sm font-body font-medium text-center">
                    {value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
            {errors.condition && touched.condition && (
              <p className="mt-1 text-body-sm text-coral font-body">{errors.condition}</p>
            )}
          </div>

          {/* Location and Contact Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location - Optional */}
            <div>
              <label htmlFor="location" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${
                    errors.location && touched.location
                      ? 'border-coral focus:ring-coral focus:border-coral'
                      : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                  } focus:outline-none focus:ring-2`}
                  placeholder="e.g., Main Campus Library"
                  maxLength={200}
                />
              </div>
              {errors.location && touched.location && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.location}</p>
              )}
              <p className="mt-1 text-body-sm text-gray-500 font-body">
                {formData.location.length}/200 characters
              </p>
            </div>

            {/* Contact Info - Optional */}
            <div>
              <label htmlFor="contactInfo" className="block text-body-sm font-body font-medium text-gray-700 mb-2">
                Contact Information
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md font-body text-body ${
                    errors.contactInfo && touched.contactInfo
                      ? 'border-coral focus:ring-coral focus:border-coral'
                      : 'border-gray-300 focus:ring-royal-blue focus:border-royal-blue'
                  } focus:outline-none focus:ring-2`}
                  placeholder="e.g., +1234567890"
                  maxLength={100}
                />
              </div>
              {errors.contactInfo && touched.contactInfo && (
                <p className="mt-1 text-body-sm text-coral font-body">{errors.contactInfo}</p>
              )}
              <p className="mt-1 text-body-sm text-gray-500 font-body">
                {formData.contactInfo.length}/100 characters
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-body-sm font-body font-medium text-gray-700 mb-2">
              Item Image
            </label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-royal-blue transition-colors">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label
                  htmlFor="image"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FontAwesomeIcon icon={faUpload} className="text-4xl text-gray-400 mb-3" />
                  <p className="text-body font-body text-gray-600 mb-2">
                    Click to upload an image
                  </p>
                  <p className="text-body-sm font-body text-gray-500 mb-3">
                    JPG, PNG, WEBP, or GIF (max 5MB)
                  </p>
                  <span className="px-4 py-2 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-colors">
                    Choose File
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-coral text-white p-2 rounded-full hover:bg-coral-600 transition-colors shadow-lg"
                      aria-label="Remove image"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 rounded-md">
                    <p className="text-body-sm font-body text-gray-700">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green mr-1" />
                      {selectedImage?.name}
                    </p>
                    <p className="text-body-sm font-body text-gray-500">
                      {(selectedImage?.size ? (selectedImage.size / 1024 / 1024).toFixed(2) : '0')} MB
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-heading font-semibold text-button hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Change Image
                  </label>
                </div>
              </div>
            )}
            
            {imageError && (
              <p className="mt-2 text-body-sm text-coral font-body">{imageError}</p>
            )}
            <p className="mt-2 text-body-sm text-gray-500 font-body">
              Upload an image to help buyers see your item. Image will be uploaded to Cloudinary.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-royal-blue text-white py-3 px-6 rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 focus:outline-none focus:ring-2 focus:ring-royal-blue focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Item'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-heading font-semibold text-button hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateItem;

