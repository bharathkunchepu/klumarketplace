import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import ImageUpload from '../components/ImageUpload';
import ProtectedRoute from '../components/ProtectedRoute';
import { ItemCategory, ItemCondition } from '../types';
import itemService from '../services/itemService';
import { handleApiError } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

const CreateItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    contactInfo: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = 'Description must be 5000 characters or less';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum < 0.01) {
        newErrors.price = 'Price must be at least 0.01';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (formData.location && formData.location.length > 200) {
      newErrors.location = 'Location must be 200 characters or less';
    }

    if (formData.contactInfo && formData.contactInfo.length > 100) {
      newErrors.contactInfo = 'Contact info must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const itemData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim() || undefined,
        contactInfo: formData.contactInfo.trim() || undefined
      };

      const createdItem = await itemService.createItem(itemData);

      // Upload image if provided
      if (image) {
        try {
          await itemService.uploadItemImage(createdItem.id, image);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          showToast('Item created but image upload failed');
        }
      }

      showToast('Item created successfully!');
      navigate(`/items/${createdItem.id}`);
    } catch (error) {
      showToast(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AnimatedSection className="products">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Create New Item Listing</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Title <span style={{ color: '#FF6B6B' }}>*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? 'input-error' : ''}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: `1.5px solid ${errors.title ? '#FF6B6B' : 'var(--glass-border)'}`,
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
                placeholder="e.g., MacBook Pro 13-inch"
                maxLength={200}
              />
              {errors.title && <span style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.title}</span>}
            </div>

            <div>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={errors.description ? 'input-error' : ''}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: `1.5px solid ${errors.description ? '#FF6B6B' : 'var(--glass-border)'}`,
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                placeholder="Describe your item in detail..."
                maxLength={5000}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                {errors.description && <span style={{ color: '#FF6B6B', fontSize: '0.85rem' }}>{errors.description}</span>}
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: 'auto' }}>
                  {formData.description.length}/5000
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="price" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Price (₹) <span style={{ color: '#FF6B6B' }}>*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={errors.price ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1.5px solid ${errors.price ? '#FF6B6B' : 'var(--glass-border)'}`,
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                  placeholder="0.00"
                />
                {errors.price && <span style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.price}</span>}
              </div>

              <div>
                <label htmlFor="category" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Category <span style={{ color: '#FF6B6B' }}>*</span>
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={errors.category ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1.5px solid ${errors.category ? '#FF6B6B' : 'var(--glass-border)'}`,
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Category</option>
                  <option value={ItemCategory.ELECTRONICS}>Electronics</option>
                  <option value={ItemCategory.BOOKS}>Books</option>
                  <option value={ItemCategory.CLOTHING}>Clothing</option>
                  <option value={ItemCategory.FURNITURE}>Furniture</option>
                  <option value={ItemCategory.SPORTS}>Sports</option>
                  <option value={ItemCategory.OTHER}>Other</option>
                </select>
                {errors.category && <span style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.category}</span>}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                Condition <span style={{ color: '#FF6B6B' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {Object.values(ItemCondition).map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => setFormData({ ...formData, condition })}
                    style={{
                      padding: '0.75rem',
                      background: formData.condition === condition ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.3)',
                      border: `1.5px solid ${formData.condition === condition ? 'var(--primary-color)' : 'var(--glass-border)'}`,
                      borderRadius: '12px',
                      color: formData.condition === condition ? 'var(--dark-bg)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: formData.condition === condition ? 600 : 400,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {condition}
                  </button>
                ))}
              </div>
              {errors.condition && <span style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.condition}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label htmlFor="location" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={errors.location ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1.5px solid ${errors.location ? '#FF6B6B' : 'var(--glass-border)'}`,
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                  placeholder="e.g., KL Main Campus"
                  maxLength={200}
                />
                {errors.location && <span style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.location}</span>}
              </div>

              <div>
                <label htmlFor="contactInfo" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Contact Info
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                  className={errors.contactInfo ? 'input-error' : ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1.5px solid ${errors.contactInfo ? '#FF6B6B' : 'var(--glass-border)'}`,
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                  placeholder="Phone or email"
                  maxLength={100}
                />
                {errors.contactInfo && <span style={{ color: '#FF6B6B', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>{errors.contactInfo}</span>}
              </div>
            </div>

            <div>
              <ImageUpload
                onUpload={(file) => setImage(file)}
                label="Item Image (Optional)"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-modern"
                style={{ flex: 1 }}
              >
                {isSubmitting ? 'Creating...' : 'Create Item'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  padding: '0.875rem',
                  borderRadius: '50px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </AnimatedSection>
    </ProtectedRoute>
  );
};

export default CreateItem;

