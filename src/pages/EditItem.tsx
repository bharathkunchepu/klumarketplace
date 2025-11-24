import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  faCheckCircle,
  faArrowLeft,
  faImage as faImageIcon
} from '@fortawesome/free-solid-svg-icons';
import itemService, { type CreateItemData } from '../services/itemService';
import { toastUtils } from '../utils/toast';
import { authUtils } from '../utils/auth';
import { ItemCategory, ItemCondition } from '../types';
import type { Item } from '../types';

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

const EditItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authUtils.isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch item data
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) {
        navigate('/my-items');
        return;
      }

      try {
        setLoading(true);
        const itemData = await itemService.getItemById(parseInt(id, 10));
        setItem(itemData);
        
        // Check if user is the owner
        const userId = localStorage.getItem('userId');
        if (userId && itemData.seller.id !== parseInt(userId, 10)) {
          toastUtils.error('You can only edit your own items');
          navigate('/my-items');
          return;
        }

        // Pre-populate form
        setFormData({
          title: itemData.title || '',
          description: itemData.description || '',
          price: itemData.price.toString() || '',
          category: itemData.category || '',
          condition: itemData.condition || '',
          location: itemData.location || '',
          contactInfo: itemData.contactInfo || '',
        });
        if (itemData.imageUrl) {
          setImagePreview(itemData.imageUrl);
        }
      } catch (error: any) {
        console.error('Error fetching item:', error);
        if (error.response?.status === 404) {
          toastUtils.error('Item not found');
        } else if (error.response?.status === 403) {
          toastUtils.error('You can only edit your own items');
        } else {
          toastUtils.showApiError(error);
        }
        navigate('/my-items');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  // Validation functions (same as CreateItem)
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
    const parts = price.split('.');
    if (parts[0].length > 8) {
      return 'Price cannot exceed 8 digits before decimal';
    }
    if (parts[1] && parts[1].length > 2) {
      return 'Price can have maximum 2 decimal places';
    }
    return undefined;
  };

  const validateField = (field: keyof FormData, value: string): boolean => {
    let error: string | undefined;
    
    switch (field) {
      case 'title':
        error = validateTitle(value);
        break;
      case 'description':
        error = validateDescription(value);
        break;
      case 'price':
        error = validatePrice(value);
        break;
      case 'category':
        if (!value) {
          error = 'Category is required';
        }
        break;
      case 'condition':
        if (!value) {
          error = 'Condition is required';
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name as keyof FormData, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name as keyof FormData, value);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageError('Image size must be less than 5MB');
      return;
    }

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
    setImagePreview(item?.imageUrl || null);
    setImageError('');
    const fileInput = document.getElementById('itemImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage || !id) return;

    setIsUploadingImage(true);
    try {
      const updatedItem = await itemService.uploadItemImage(parseInt(id, 10), selectedImage);
      setItem(updatedItem);
      setImagePreview(updatedItem.imageUrl || null);
      setSelectedImage(null);
      toastUtils.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      if (error.response?.status === 403) {
        toastUtils.error('You can only upload images for your own items');
      } else {
        toastUtils.showApiError(error);
      }
    } finally {
      setIsUploadingImage(false);
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
      const itemData: Partial<CreateItemData> = {
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

      await itemService.updateItem(parseInt(id!, 10), itemData);
      toastUtils.success('Item updated successfully!');
      navigate(`/items/${id}`);
    } catch (error: any) {
      console.error('Error updating item:', error);
      if (error.response?.status === 403) {
        toastUtils.error('You can only update your own items');
      } else if (error.response?.status === 404) {
        toastUtils.error('Item not found');
      } else {
        toastUtils.showApiError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FontAwesomeIcon icon={faSpinner} spin className="text-royal-blue text-4xl" />
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-body font-body text-gray-600 hover:text-royal-blue transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back
          </button>
          <h1 className="text-h1 font-heading font-bold text-gray-900 mb-2">
            Edit Item
          </h1>
          <p className="text-body text-gray-600 font-body">
            Update your item listing information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-body-sm font-heading font-semibold text-gray-900 mb-3">
              <FontAwesomeIcon icon={faUpload} className="mr-2 text-royal-blue" />
              Item Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Item preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-coral text-white rounded-full flex items-center justify-center hover:bg-coral-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <FontAwesomeIcon icon={faImageIcon} className="text-4xl text-gray-400 mb-2" />
                    <p className="text-body-sm text-gray-500 font-body">No image</p>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <input
                  type="file"
                  id="itemImage"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label
                  htmlFor="itemImage"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md text-body-sm font-body text-gray-700 bg-white hover:bg-gray-50 cursor-pointer text-center transition-colors"
                >
                  {imagePreview ? 'Change Image' : 'Select Image'}
                </label>
                {selectedImage && (
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={isUploadingImage}
                    className="w-full px-4 py-2 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploadingImage ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUpload} />
                        Upload Image
                      </>
                    )}
                  </button>
                )}
                {imageError && (
                  <p className="text-body-sm text-coral font-body">{imageError}</p>
                )}
                <p className="text-body-sm text-gray-500 font-body">
                  Max file size: 5MB. Supported formats: JPEG, PNG, WebP, GIF
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-body-sm font-heading font-semibold text-gray-900 mb-2">
              <FontAwesomeIcon icon={faTag} className="mr-2 text-royal-blue" />
              Title <span className="text-coral">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-md font-body text-body focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all ${
                errors.title ? 'border-coral' : 'border-gray-300'
              }`}
              placeholder="Enter item title"
            />
            {errors.title && <p className="mt-1 text-body-sm text-coral font-body">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-body-sm font-heading font-semibold text-gray-900 mb-2">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2 text-royal-blue" />
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={6}
              className={`w-full px-4 py-3 border rounded-md font-body text-body focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all resize-none ${
                errors.description ? 'border-coral' : 'border-gray-300'
              }`}
              placeholder="Describe your item..."
            />
            {errors.description && <p className="mt-1 text-body-sm text-coral font-body">{errors.description}</p>}
            <p className="mt-1 text-body-sm text-gray-500 font-body">
              {formData.description.length}/5000 characters
            </p>
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-body-sm font-heading font-semibold text-gray-900 mb-2">
                <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-royal-blue" />
                Price (₹) <span className="text-coral">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                onBlur={handleBlur}
                step="0.01"
                min="0.01"
                className={`w-full px-4 py-3 border rounded-md font-body text-body focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all ${
                  errors.price ? 'border-coral' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-body-sm text-coral font-body">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-body-sm font-heading font-semibold text-gray-900 mb-2">
                <FontAwesomeIcon icon={faTag} className="mr-2 text-royal-blue" />
                Category <span className="text-coral">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-md font-body text-body bg-white focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all appearance-none cursor-pointer ${
                  errors.category ? 'border-coral' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                <option value={ItemCategory.BOOKS}>Books</option>
                <option value={ItemCategory.STATIONERY}>Stationery</option>
                <option value={ItemCategory.VEHICLES}>Vehicles</option>
                <option value={ItemCategory.ELECTRONICS}>Electronics</option>
                <option value={ItemCategory.FURNITURE}>Furniture</option>
                <option value={ItemCategory.CLOTHING}>Clothing</option>
                <option value={ItemCategory.SPORTS}>Sports</option>
                <option value={ItemCategory.OTHER}>Other</option>
              </select>
              {errors.category && <p className="mt-1 text-body-sm text-coral font-body">{errors.category}</p>}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="condition" className="block text-body-sm font-heading font-semibold text-gray-900 mb-2">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-royal-blue" />
              Condition <span className="text-coral">*</span>
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-md font-body text-body bg-white focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all appearance-none cursor-pointer ${
                errors.condition ? 'border-coral' : 'border-gray-300'
              }`}
            >
              <option value="">Select condition</option>
              <option value={ItemCondition.NEW}>New</option>
              <option value={ItemCondition.LIKE_NEW}>Like New</option>
              <option value={ItemCondition.GOOD}>Good</option>
              <option value={ItemCondition.FAIR}>Fair</option>
              <option value={ItemCondition.POOR}>Poor</option>
            </select>
            {errors.condition && <p className="mt-1 text-body-sm text-coral font-body">{errors.condition}</p>}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-body-sm font-heading font-semibold text-gray-900 mb-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-royal-blue" />
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-md font-body text-body focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all ${
                errors.location ? 'border-coral' : 'border-gray-300'
              }`}
              placeholder="e.g., Main Campus, Building A"
            />
            {errors.location && <p className="mt-1 text-body-sm text-coral font-body">{errors.location}</p>}
          </div>

          {/* Contact Info */}
          <div>
            <label htmlFor="contactInfo" className="block text-body-sm font-heading font-semibold text-gray-900 mb-2">
              <FontAwesomeIcon icon={faPhone} className="mr-2 text-royal-blue" />
              Contact Information
            </label>
            <input
              type="text"
              id="contactInfo"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-md font-body text-body focus:ring-2 focus:ring-royal-blue focus:border-royal-blue transition-all ${
                errors.contactInfo ? 'border-coral' : 'border-gray-300'
              }`}
              placeholder="Email or phone number"
            />
            {errors.contactInfo && <p className="mt-1 text-body-sm text-coral font-body">{errors.contactInfo}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-heading font-semibold text-button hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  Updating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  Update Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;

