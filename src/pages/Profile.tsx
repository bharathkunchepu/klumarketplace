import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import { authUtils } from '../utils/auth';
import { User } from '../types';
import userService from '../services/userService';
import { handleApiError } from '../utils/errorHandler';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await userService.getCurrentUserProfile();
      setUser(profile);
      setEditData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || ''
      });
      // Update stored user data
      authUtils.setCurrentUser(profile);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authUtils.isLoggedIn()) {
      navigate('/login');
      return;
    }

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleUpdateProfile = async () => {
    try {
      const updated = await userService.updateProfile(editData);
      setUser(updated);
      authUtils.setCurrentUser(updated);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      const updated = await userService.uploadProfileImage(file);
      setUser(updated);
      authUtils.setCurrentUser(updated);
      alert('Profile image updated successfully!');
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      authUtils.logout();
      navigate('/logout');
    }
  };

  if (loading) {
    return (
      <AnimatedSection className="products">
        <h2>Your Account</h2>
        <div className="products-grid" style={{ maxWidth: '600px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
          <div className="product-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p>Loading...</p>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (error || !user) {
    return (
      <AnimatedSection className="products">
        <h2>Your Account</h2>
        <div className="products-grid" style={{ maxWidth: '600px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
          <div className="product-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#FF6B6B' }}>{error || 'Failed to load profile'}</p>
            <button onClick={fetchProfile} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#A29BFE', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  const initials = (user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase();

  return (
    <AnimatedSection className="products">
      <h2>Your Account</h2>
      <div className="products-grid" style={{ maxWidth: '900px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
        {/* Profile Header */}
        <div className="product-card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={name}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #A29BFE, #6C5CE7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', fontWeight: 'bold', margin: '0 auto' }}>
                  {initials}
                </div>
              )}
              <label style={{ position: 'absolute', bottom: '0', right: '0', background: '#A29BFE', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #05050C' }}>
                📷
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
            <h3 style={{ color: '#A29BFE', marginBottom: '0.5rem', fontSize: '1.5rem' }}>{name}</h3>
            <p style={{ color: '#B8BCD0' }}>{user.email}</p>
            <p style={{ color: '#B8BCD0', fontSize: '0.9rem', marginTop: '0.25rem' }}>ID: {user.universityId}</p>
          </div>

          {/* Statistics */}
          {user.statistics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(162,155,254,0.16)' }}>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(162,155,254,0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#A29BFE', marginBottom: '0.25rem' }}>{user.statistics.totalItems}</div>
                <div style={{ fontSize: '0.85rem', color: '#B8BCD0' }}>Total Items</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(162,155,254,0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#A29BFE', marginBottom: '0.25rem' }}>{user.statistics.activeItems}</div>
                <div style={{ fontSize: '0.85rem', color: '#B8BCD0' }}>Active</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(162,155,254,0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#A29BFE', marginBottom: '0.25rem' }}>{user.statistics.soldItems}</div>
                <div style={{ fontSize: '0.85rem', color: '#B8BCD0' }}>Sold</div>
              </div>
              <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(162,155,254,0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#A29BFE', marginBottom: '0.25rem' }}>₹{user.statistics.totalValue.toLocaleString()}</div>
                <div style={{ fontSize: '0.85rem', color: '#B8BCD0' }}>Total Value</div>
              </div>
            </div>
          )}

          {/* Profile Information */}
          <div style={{ borderTop: '1px solid rgba(162,155,254,0.16)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ color: '#A29BFE', fontSize: '1.1rem' }}>Profile Information</h4>
              {!editing && (
                <button onClick={() => setEditing(true)} style={{ background: 'transparent', border: '1px solid #A29BFE', color: '#A29BFE', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  Edit
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#B8BCD0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>First Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(162,155,254,0.16)', borderRadius: '8px', color: '#F5F6FC' }}
                  />
                ) : (
                  <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#F5F6FC' }}>
                    {user.firstName || 'Not provided'}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', color: '#B8BCD0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(162,155,254,0.16)', borderRadius: '8px', color: '#F5F6FC' }}
                  />
                ) : (
                  <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#F5F6FC' }}>
                    {user.lastName || 'Not provided'}
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', color: '#B8BCD0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#B8BCD0' }}>
                  {user.email} (read-only)
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#B8BCD0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>University ID</label>
                <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#B8BCD0' }}>
                  {user.universityId} (read-only)
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: '#B8BCD0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(162,155,254,0.16)', borderRadius: '8px', color: '#F5F6FC' }}
                  />
                ) : (
                  <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#F5F6FC' }}>
                    {user.phone || 'Not provided'}
                  </div>
                )}
              </div>
              {editing && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={handleUpdateProfile} style={{ flex: 1, background: 'linear-gradient(135deg, #A29BFE, #6C5CE7)', color: '#05050C', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Save
                  </button>
                  <button onClick={() => { setEditing(false); setEditData({ firstName: user.firstName || '', lastName: user.lastName || '', phone: user.phone || '' }); }} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(162,155,254,0.16)', color: '#B8BCD0', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ borderTop: '1px solid rgba(162,155,254,0.16)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <button onClick={handleLogout} style={{ background: 'linear-gradient(135deg, #A29BFE, #6C5CE7)', color: '#05050C', border: 'none', width: '100%', padding: '0.75rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '25px', fontWeight: '600', marginBottom: '0.75rem' }}>
              Logout
            </button>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(162,155,254,0.16)', color: '#B8BCD0', width: '100%', padding: '0.75rem', borderRadius: '25px', cursor: 'pointer' }}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Profile;

