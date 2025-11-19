import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import ProtectedRoute from '../components/ProtectedRoute';
import { Item, ItemStatus, Pagination as PaginationType } from '../types';
import itemService from '../services/itemService';
import { handleApiError } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

const MyItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ItemStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(0);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        status: activeTab !== 'all' ? activeTab : undefined,
        page: currentPage,
        size: 20
      };

      const response = await itemService.getMyItems(params);
      setItems(response.items);
      setPagination(response.pagination);
    } catch (error) {
      showToast(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await itemService.deleteItem(itemId);
      showToast('Item deleted successfully');
      fetchItems();
    } catch (error) {
      showToast(handleApiError(error));
    }
  };

  // Calculate tab counts from current items (could be improved with API support)
  const tabs = [
    { key: 'all' as const, label: 'All', count: pagination?.totalElements || items.length },
    { key: ItemStatus.ACTIVE, label: 'Active', count: activeTab === ItemStatus.ACTIVE ? (pagination?.totalElements || items.length) : items.filter(i => i.status === ItemStatus.ACTIVE).length },
    { key: ItemStatus.SOLD, label: 'Sold', count: activeTab === ItemStatus.SOLD ? (pagination?.totalElements || items.length) : items.filter(i => i.status === ItemStatus.SOLD).length },
    { key: ItemStatus.INACTIVE, label: 'Inactive', count: activeTab === ItemStatus.INACTIVE ? (pagination?.totalElements || items.length) : items.filter(i => i.status === ItemStatus.INACTIVE).length }
  ];

  return (
    <ProtectedRoute>
      <AnimatedSection className="products">
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2>My Items</h2>
            <button
              onClick={() => navigate('/items/create')}
              className="btn-primary-modern"
              style={{ whiteSpace: 'nowrap' }}
            >
              + Create New Item
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(0);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeTab === tab.key ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'var(--glass-bg)',
                  border: `1px solid ${activeTab === tab.key ? 'transparent' : 'var(--glass-border)'}`,
                  borderRadius: '12px',
                  color: activeTab === tab.key ? 'var(--dark-bg)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  background: activeTab === tab.key ? 'rgba(5, 5, 12, 0.2)' : 'rgba(162, 155, 254, 0.2)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty-state-modern">
              <div className="empty-icon">⏳</div>
              <h3>Loading your items...</h3>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-icon">📦</div>
              <h3>No items found</h3>
              <p>
                {activeTab === 'all'
                  ? "You haven't listed any items yet. Create your first listing!"
                  : `You don't have any ${activeTab.toLowerCase()} items.`}
              </p>
              {activeTab === 'all' && (
                <button
                  onClick={() => navigate('/items/create')}
                  className="btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Create Your First Item
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="products-grid-modern">
                {items.map((item) => (
                  <div key={item.id} style={{ position: 'relative' }}>
                    <ProductCard item={item} />
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      display: 'flex',
                      gap: '0.5rem',
                      zIndex: 10
                    }}>
                      <button
                        onClick={() => navigate(`/items/${item.id}/edit`)}
                        style={{
                          background: 'rgba(162, 155, 254, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          color: '#05050C',
                          fontSize: '1rem'
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: 'rgba(255, 107, 107, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          color: '#05050C',
                          fontSize: '1rem'
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              )}
            </>
          )}
        </div>
      </AnimatedSection>
    </ProtectedRoute>
  );
};

export default MyItems;

