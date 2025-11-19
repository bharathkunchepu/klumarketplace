import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import ProductCard from '../components/ProductCard';
import { User, Item } from '../types';
import userService from '../services/userService';
import itemService from '../services/itemService';
import { handleApiError } from '../utils/errorHandler';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    try {
      const profile = await userService.getUserProfileById(parseInt(id!));
      setUser(profile);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async () => {
    try {
      // Note: API doesn't have a direct endpoint for user's items by user ID
      // This would need to be implemented on backend or we filter client-side
      // For now, we'll just show a message
    } catch (err) {
      console.error('Failed to fetch user items:', err);
    }
  };

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    fetchUserProfile();
    fetchUserItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  if (loading) {
    return (
      <AnimatedSection className="products">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading profile...</p>
        </div>
      </AnimatedSection>
    );
  }

  if (error || !user) {
    return (
      <AnimatedSection className="products">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>User Not Found</h2>
          <p style={{ color: '#FF6B6B', marginBottom: '1rem' }}>{error || 'The user you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </AnimatedSection>
    );
  }

  const name = `${user.firstName} ${user.lastName}`;
  const initials = (user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase();

  return (
    <AnimatedSection className="products">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', marginBottom: '3rem' }}>
          {/* Profile Card */}
          <div style={{ padding: '2rem', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', height: 'fit-content' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={name}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
                />
              ) : (
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 1rem' }}>
                  {initials}
                </div>
              )}
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>ID: {user.universityId}</p>
            </div>

            {user.statistics && (
              <div style={{ display: 'grid', gap: '0.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Items</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.statistics.totalItems}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.statistics.activeItems}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Sold</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user.statistics.soldItems}</span>
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Items Listed by {user.firstName}</h3>
            {userItems.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>This user hasn't listed any items yet.</p>
              </div>
            ) : (
              <div className="products-grid-modern">
                {userItems.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default UserProfile;

