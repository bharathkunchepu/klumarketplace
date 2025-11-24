import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowLeft,
    faTag,
    faCertificate,
    faMapMarkerAlt,
    faEnvelope,
    faCalendar,
    faEdit,
    faTrash,
    faSpinner,
    faExclamationTriangle,
    faIdCard,
    faImage as faImageIcon
} from '@fortawesome/free-solid-svg-icons';
import itemService from '../services/itemService';
import { toastUtils } from '../utils/toast';
import type { Item } from '../types';
import { ItemCategory, ItemCondition, ItemStatus } from '../types';

const ItemDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const fetchItem = async () => {
            if (!id) {
                navigate('/products');
                return;
            }

            try {
                setLoading(true);
                const itemData = await itemService.getItemById(parseInt(id, 10));
                setItem(itemData);
            } catch (error: any) {
                console.error('Error fetching item:', error);
                if (error.response?.status === 404) {
                    toastUtils.error('Item not found');
                    navigate('/products');
                } else {
                    toastUtils.showApiError(error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id, navigate]);

    // Get current user ID from token (if available)
    useEffect(() => {
        // Try to get user ID from localStorage or token
        const userId = localStorage.getItem('userId');
        if (userId) {
            setCurrentUserId(parseInt(userId, 10));
        }
    }, []);

    const isOwner = item && currentUserId && item.seller.id === currentUserId;

    const handleDelete = async () => {
        if (!item || !id) return;

        setIsDeleting(true);
        try {
            await itemService.deleteItem(parseInt(id, 10));
            toastUtils.success('Item deleted successfully');
            navigate('/my-items');
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
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const getCategoryLabel = (category: ItemCategory): string => {
        return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const getConditionLabel = (condition: ItemCondition): string => {
        return condition.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    const getConditionColor = (condition: ItemCondition): string => {
        const colors: Record<ItemCondition, string> = {
            NEW: 'bg-green-100 text-green-800 border-green-200',
            LIKE_NEW: 'bg-teal-100 text-teal-800 border-teal-200',
            GOOD: 'bg-royal-blue-100 text-royal-blue-800 border-royal-blue-200',
            FAIR: 'bg-amber-100 text-amber-800 border-amber-200',
            POOR: 'bg-coral-100 text-coral-800 border-coral-200',
        };
        return colors[condition] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusColor = (status: ItemStatus): string => {
        const colors: Record<ItemStatus, string> = {
            ACTIVE: 'bg-green-100 text-green-800 border-green-200',
            SOLD: 'bg-gray-100 text-gray-800 border-gray-200',
            PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
            INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} spin className="text-royal-blue text-4xl" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-gray-400 mb-4" />
                    <h2 className="text-h2 font-heading font-bold text-gray-900 mb-2">Item Not Found</h2>
                    <p className="text-body text-gray-600 font-body mb-4">The item you're looking for doesn't exist.</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-colors"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back to Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-body font-body text-gray-600 hover:text-royal-blue transition-colors"
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Image */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Image */}
                            <div className="relative w-full h-96 bg-gray-100">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <div className="text-center">
                                            <FontAwesomeIcon icon={faImageIcon} className="text-6xl text-gray-300 mb-4" />
                                            <p className="text-body text-gray-500 font-body">No image available</p>
                                        </div>
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-4 py-2 rounded-full text-body-sm font-heading font-semibold border-2 ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            {/* Item Details */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h1 className="text-h1 font-heading font-bold text-gray-900 mb-2">
                                            {item.title}
                                        </h1>
                                        <div className="flex items-center gap-4 flex-wrap">
                                            <span className={`px-3 py-1 rounded-full text-body-sm font-heading font-semibold border ${getConditionColor(item.condition)}`}>
                                                <FontAwesomeIcon icon={faCertificate} className="mr-1" />
                                                {getConditionLabel(item.condition)}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-body-sm font-body text-gray-700 bg-gray-100 border border-gray-200">
                                                <FontAwesomeIcon icon={faTag} className="mr-1 text-royal-blue" />
                                                {getCategoryLabel(item.category)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-price font-heading font-bold text-royal-blue">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6 pt-6 border-t border-gray-200">
                                    <h2 className="text-h3 font-heading font-semibold text-gray-900 mb-3">Description</h2>
                                    <p className="text-body text-gray-700 font-body whitespace-pre-wrap leading-relaxed">
                                        {item.description || 'No description provided.'}
                                    </p>
                                </div>

                                {/* Additional Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                                    {item.location && (
                                        <div className="flex items-start gap-3">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-royal-blue mt-1" />
                                            <div>
                                                <p className="text-body-sm font-body font-medium text-gray-500 mb-1">Location</p>
                                                <p className="text-body font-body text-gray-900">{item.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    {item.contactInfo && (
                                        <div className="flex items-start gap-3">
                                            <FontAwesomeIcon icon={faEnvelope} className="text-royal-blue mt-1" />
                                            <div>
                                                <p className="text-body-sm font-body font-medium text-gray-500 mb-1">Contact</p>
                                                <a
                                                    href={`mailto:${item.contactInfo}`}
                                                    className="text-body font-body text-royal-blue hover:underline"
                                                >
                                                    {item.contactInfo}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {item.createdAt && (
                                        <div className="flex items-start gap-3">
                                            <FontAwesomeIcon icon={faCalendar} className="text-royal-blue mt-1" />
                                            <div>
                                                <p className="text-body-sm font-body font-medium text-gray-500 mb-1">Posted</p>
                                                <p className="text-body font-body text-gray-900">
                                                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Seller Info & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Seller Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-h3 font-heading font-semibold text-gray-900 mb-4">Seller Information</h2>
                            <div className="flex items-center gap-4 mb-4">
                                {item.seller.profileImageUrl ? (
                                    <img
                                        src={item.seller.profileImageUrl}
                                        alt={`${item.seller.firstName} ${item.seller.lastName}`}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-royal-blue-100"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            const firstName = item.seller.firstName || '';
                                            const lastName = item.seller.lastName || '';
                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=4169E1&color=fff&size=64`;
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent((item.seller.firstName || '') + ' ' + (item.seller.lastName || ''))}&background=4169E1&color=fff&size=64`}
                                        alt={`${item.seller.firstName} ${item.seller.lastName}`}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-royal-blue-100"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-h4 font-heading font-bold text-gray-900">
                                        {item.seller.firstName} {item.seller.lastName}
                                    </h3>
                                    {item.seller.role && (
                                        <p className="text-body-sm text-royal-blue font-body font-medium">
                                            {item.seller.role.replace(/_/g, ' ')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-gray-200">
                                {item.seller.universityId && (
                                    <div className="flex items-center gap-2 text-body-sm font-body text-gray-600">
                                        <FontAwesomeIcon icon={faIdCard} className="text-royal-blue w-4" />
                                        <span>{item.seller.universityId}</span>
                                    </div>
                                )}
                                {item.seller.email && (
                                    <div className="flex items-center gap-2 text-body-sm font-body text-gray-600">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-royal-blue w-4" />
                                        <a
                                            href={`mailto:${item.seller.email}`}
                                            className="hover:text-royal-blue hover:underline truncate"
                                        >
                                            {item.seller.email}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isOwner ? (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-h3 font-heading font-semibold text-gray-900 mb-4">Manage Item</h2>
                                <div className="space-y-3">
                                    <Link
                                        to={`/items/${item.id}/edit`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                        Edit Item
                                    </Link>
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={isDeleting}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-coral text-white rounded-md font-heading font-semibold text-button hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} spin />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faTrash} />
                                                Delete Item
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-h3 font-heading font-semibold text-gray-900 mb-4">Contact Seller</h2>
                                {item.seller.email ? (
                                    <a
                                        href={`mailto:${item.seller.email}?subject=Inquiry about ${item.title}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faEnvelope} />
                                        Send Message
                                    </a>
                                ) : (
                                    <p className="text-body-sm text-gray-600 font-body">Contact information not available</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
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
                            Are you sure you want to delete <span className="font-semibold">"{item.title}"</span>? This will permanently remove the item from the marketplace.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-heading font-semibold text-button hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-coral text-white rounded-md font-heading font-semibold text-button hover:bg-coral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetail;

