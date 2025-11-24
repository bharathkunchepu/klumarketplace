import { useState, useEffect, useCallback } from 'react';
import { authUtils } from '../utils/auth';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faBoxOpen,
  faPlus,
  faTrash,
  faEdit,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import itemService from '../services/itemService';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { toastUtils } from '../utils/toast';
import type { Item, ItemSearchParams } from '../types';
import { ItemStatus } from '../types';

const MyItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authUtils.isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch user's items
  const fetchMyItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: ItemSearchParams = {
        page: pagination.page,
        size: pagination.size,
        // Don't filter by status - show all user's items (active, sold, etc.)
      };

      const response = await itemService.getMyItems(params);
      setItems(response.items);
      setPagination(response.pagination);
    } catch (error: any) {
      toastUtils.showApiError(error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  // Fetch items on mount and when pagination changes
  useEffect(() => {
    fetchMyItems();
  }, [fetchMyItems]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle delete item
  const handleDelete = async (itemId: number) => {
    setDeletingItemId(itemId);
    try {
      await itemService.deleteItem(itemId);
      toastUtils.success('Item deleted successfully');
      // Refresh the list
      fetchMyItems();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      if (error.response?.status === 403) {
        toastUtils.error('You can only delete your own items');
      } else if (error.response?.status === 404) {
        toastUtils.error('Item not found');
      } else {
        toastUtils.showApiError(error);
      }
    } finally {
      setDeletingItemId(null);
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-heading font-bold text-gray-900 mb-2">
              My Items
            </h1>
            <p className="text-body text-gray-600 font-body">
              Manage all your posted items
            </p>
          </div>
          <Link
            to="/products/create"
            className="inline-flex items-center justify-center px-6 py-3 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-all duration-300 hover:shadow-lg whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create New Item
          </Link>
        </div>

        {/* Results Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-body text-gray-600">
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    You have <span className="font-semibold text-gray-900">{pagination.totalElements}</span> item{pagination.totalElements !== 1 ? 's' : ''}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-4xl text-royal-blue animate-spin"
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FontAwesomeIcon
              icon={faBoxOpen}
              className="text-6xl text-gray-300 mb-4"
            />
            <h3 className="text-h3 font-heading font-semibold text-gray-900 mb-2">
              No items yet
            </h3>
            <p className="text-body text-gray-600 font-body mb-6">
              Start selling by creating your first item listing
            </p>
            <Link
              to="/products/create"
              className="inline-flex items-center justify-center px-6 py-3 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-all duration-300 hover:shadow-lg"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Create Your First Item
            </Link>
          </div>
        )}

        {/* Items Grid */}
        {!loading && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {items.map((item) => (
                <div key={item.id} className="relative group">
                  <Link to={`/items/${item.id}`} className="block">
                    <ProductCard item={item} />
                  </Link>
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`px-3 py-1 rounded-full text-body-sm font-heading font-semibold ${
                      item.status === ItemStatus.ACTIVE
                        ? 'bg-green-100 text-green-800'
                        : item.status === ItemStatus.SOLD
                        ? 'bg-gray-100 text-gray-800'
                        : item.status === ItemStatus.PENDING
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/items/${item.id}/edit`}
                      className="w-10 h-10 bg-royal-blue text-white rounded-full flex items-center justify-center hover:bg-royal-blue-600 transition-colors shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                      title="Edit item"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-sm" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowDeleteConfirm(item.id);
                      }}
                      className="w-10 h-10 bg-coral text-white rounded-full flex items-center justify-center hover:bg-coral-600 transition-colors shadow-lg"
                      title="Delete item"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-coral text-xl" />
                    </div>
                    <div>
                      <h3 className="text-h3 font-heading font-bold text-gray-900">Delete Item</h3>
                      <p className="text-body-sm text-gray-600 font-body">This action cannot be undone.</p>
                    </div>
                  </div>
                  <p className="text-body text-gray-700 font-body mb-6">
                    Are you sure you want to delete this item? This will permanently remove it from the marketplace.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      disabled={deletingItemId !== null}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-heading font-semibold text-button hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(showDeleteConfirm)}
                      disabled={deletingItemId !== null}
                      className="flex-1 px-4 py-2 bg-coral text-white rounded-md font-heading font-semibold text-button hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deletingItemId === showDeleteConfirm ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faTrash} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyItems;

