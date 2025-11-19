import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import ImageUpload from '../components/ImageUpload';
import ProtectedRoute from '../components/ProtectedRoute';
import { Item, ItemCategory, ItemCondition } from '../types';
import itemService from '../services/itemService';
import { authUtils } from '../utils/auth';
import { handleApiError } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

const EditItem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const itemData = await itemService.getItemById(parseInt(id!));

      // Check if user is the owner
      const currentUser = authUtils.getCurrentUser();
      if (!currentUser || currentUser.id !== itemData.seller.id) {
        showToast('You do not have permission to edit this item');
        navigate(`/items/${id}`);
        return;
      }

      setItem(itemData);
      setFormData({
        title: itemData.title,
        description: itemData.description || '',
        price: itemData.price.toString(),
        category: itemData.category,
        condition: itemData.condition,
        location: itemData.location || '',
        contactInfo: itemData.contactInfo || ''
      });
    } catch (error) {
      showToast(handleApiError(error));
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !item) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location.trim() || undefined,
        contactInfo: formData.contactInfo.trim() || undefined
      };

      await itemService.updateItem(item.id, updateData);

      // Upload image if provided
      if (image) {
        try {
          await itemService.uploadItemImage(item.id, image);
        } catch (imageError) {
          console.error('Image upload failed:', imageError);
          showToast('Item updated but image upload failed');
        }
      }

      showToast('Item updated successfully!');
      navigate(`/items/${item.id}`);
    } catch (error) {
      showToast(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    try {
      await itemService.deleteItem(item.id);
      showToast('Item deleted successfully');
      navigate('/my-items');
    } catch (error) {
      showToast(handleApiError(error));
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AnimatedSection className="products">
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Loading...</p>
          </div>
        </AnimatedSection>
      </ProtectedRoute>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <ProtectedRoute>
      <AnimatedSection className="products">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
          <h2 style={{ marginBottom: '2rem' }}>Edit Item</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Same form fields as CreateItem */}
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
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1.5px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                  maxLength={200}
                />
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
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1.5px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem'
                  }}
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <ImageUpload
                onUpload={(file) => setImage(file)}
                currentImageUrl={item.imageUrl}
                label="Update Image (Optional)"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-modern"
                style={{ flex: 1 }}
              >
                {isSubmitting ? 'Updating...' : 'Update Item'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid #FF6B6B',
                  color: '#FF6B6B',
                  padding: '0.875rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Delete Item
              </button>
              <button
                type="button"
                onClick={() => navigate(`/items/${item.id}`)}
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%'
              }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Delete Item?</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Are you sure you want to delete "{item.title}"? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleDelete}
                    style={{
                      flex: 1,
                      background: '#FF6B6B',
                      color: '#05050C',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AnimatedSection>
    </ProtectedRoute>
  );
};

export default EditItem;

