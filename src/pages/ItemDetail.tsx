import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import ImageUpload from '../components/ImageUpload';
import { Item, ItemCondition } from '../types';
import itemService from '../services/itemService';
import { authUtils } from '../utils/auth';
import { handleApiError } from '../utils/errorHandler';
import { formatCurrency } from '../utils/cart';
import { showToast } from '../utils/toast';

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      setError(null);
      const itemData = await itemService.getItemById(parseInt(id!));
      setItem(itemData);

      // Check if current user is the owner
      const currentUser = authUtils.getCurrentUser();
      if (currentUser && currentUser.id === itemData.seller.id) {
        setIsOwner(true);
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError('Invalid item ID');
      setLoading(false);
      return;
    }

    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!item) return;

    try {
      await itemService.deleteItem(item.id);
      showToast('Item deleted successfully');
      navigate('/my-items');
    } catch (err) {
      showToast(handleApiError(err));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!item) return;

    try {
      setUploadingImage(true);
      const updated = await itemService.uploadItemImage(item.id, file);
      setItem(updated);
      showToast('Image uploaded successfully');
    } catch (err) {
      showToast(handleApiError(err));
    } finally {
      setUploadingImage(false);
    }
  };

  const conditionColors: Record<ItemCondition, string> = {
    [ItemCondition.NEW]: '#4ad295',
    [ItemCondition.EXCELLENT]: '#22D3EE',
    [ItemCondition.GOOD]: '#A29BFE',
    [ItemCondition.FAIR]: '#FFD93D',
    [ItemCondition.POOR]: '#FF6B6B'
  };

  if (loading) {
    return (
      <AnimatedSection className="products">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading item details...</p>
        </div>
      </AnimatedSection>
    );
  }

  if (error || !item) {
    return (
      <AnimatedSection className="products">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Item Not Found</h2>
          <p style={{ color: '#FF6B6B', marginBottom: '1rem' }}>{error || 'The item you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </AnimatedSection>
    );
  }

  const sellerName = `${item.seller.firstName} ${item.seller.lastName}`;
  const imageUrl = item.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image';

  return (
    <AnimatedSection className="products">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          {/* Image Section */}
          <div>
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <img
                src={imageUrl}
                alt={item.title}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
                }}
              />
            </div>
            {isOwner && (
              <div style={{ marginTop: '1rem' }}>
                <ImageUpload
                  onUpload={handleImageUpload}
                  currentImageUrl={item.imageUrl}
                  label="Update Image"
                />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: conditionColors[item.condition],
                    color: '#05050C',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {item.condition}
                </span>
                <span
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                  }}
                >
                  {item.category}
                </span>
                {item.status !== 'ACTIVE' && (
                  <span
                    style={{
                      background: '#FF6B6B',
                      color: '#05050C',
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {item.status}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{item.title}</h1>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                {formatCurrency(item.price)}
              </div>
            </div>

            {item.description && (
              <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Description</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{item.description}</p>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Item Details</h3>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {item.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span>📍</span>
                    <span>{item.location}</span>
                  </div>
                )}
                {item.contactInfo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span>📞</span>
                    <span>{item.contactInfo}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <span>📅</span>
                  <span>Listed {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div style={{ padding: '1.5rem', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Seller Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {sellerName[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{sellerName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {item.seller.universityId}</div>
                </div>
              </div>
              <Link
                to={`/users/${item.seller.id}/profile`}
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  color: 'var(--primary-color)',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                View Seller Profile →
              </Link>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link
                  to={`/items/${item.id}/edit`}
                  className="btn-primary"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                >
                  Edit Item
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid #FF6B6B',
                    color: '#FF6B6B',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Delete Item
                </button>
              </div>
            )}
          </div>
        </div>

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
  );
};

export default ItemDetail;

