import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Item } from '../types';
import { ItemCategory, ItemCondition } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faCalendar, faEnvelope, faIdCard, faBriefcase } from '@fortawesome/free-solid-svg-icons';

interface ProductCardProps {
  item: Item;
}

const ProductCard = ({ item }: ProductCardProps) => {
  const [showSellerTooltip, setShowSellerTooltip] = useState(false);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getRoleLabel = (role?: string): string => {
    if (!role) return '';
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryLabel = (category: ItemCategory): string => {
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConditionLabel = (condition: ItemCondition): string => {
    return condition.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConditionColor = (condition: ItemCondition): string => {
    const colors: Record<ItemCondition, string> = {
      NEW: 'bg-green-100 text-green-800',
      LIKE_NEW: 'bg-teal-100 text-teal-800',
      GOOD: 'bg-royal-blue-100 text-royal-blue-800',
      FAIR: 'bg-amber-100 text-amber-800',
      POOR: 'bg-coral-100 text-coral-800',
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  // Handle imageUrl - check if it exists and is not empty
  const primaryImage = item.imageUrl && item.imageUrl.trim() !== ''
    ? item.imageUrl
    : 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <Link
      to={`/items/${item.id}`}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-body-sm font-heading font-semibold ${getConditionColor(item.condition)}`}>
            {getConditionLabel(item.condition)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <div className="mb-2">
          <span className="text-body-sm text-gray-500 font-body">
            <FontAwesomeIcon icon={faTag} className="mr-1" />
            {getCategoryLabel(item.category)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-h3 font-heading font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-royal-blue transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-body-sm text-gray-600 font-body mb-4 line-clamp-2">
          {item.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-price font-heading font-bold text-royal-blue">
            {formatPrice(item.price)}
          </span>
        </div>

        {/* Seller Info */}
        <div 
          className="relative flex items-center justify-between pt-3 border-t border-gray-200"
          onMouseEnter={() => setShowSellerTooltip(true)}
          onMouseLeave={() => setShowSellerTooltip(false)}
        >
          <div className="flex items-center gap-2 cursor-pointer">
            {item.seller.profileImageUrl ? (
              <img
                src={item.seller.profileImageUrl}
                alt={`${item.seller.firstName || ''} ${item.seller.lastName || ''}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-royal-blue-100 flex-shrink-0 transition-transform duration-200 hover:scale-110"
                onError={(e) => {
                  // Fallback to UI Avatars if image fails to load
                  const target = e.target as HTMLImageElement;
                  const firstName = item.seller.firstName || '';
                  const lastName = item.seller.lastName || '';
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=4169E1&color=fff&size=40`;
                }}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent((item.seller.firstName || '') + ' ' + (item.seller.lastName || ''))}&background=4169E1&color=fff&size=40`}
                alt={`${item.seller.firstName || ''} ${item.seller.lastName || ''}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-royal-blue-100 flex-shrink-0 transition-transform duration-200 hover:scale-110"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-body font-medium text-gray-900 truncate">
                {item.seller.firstName || ''} {item.seller.lastName || ''}
              </p>
              {item.seller.universityId && (
                <p className="text-body-sm text-gray-500 font-body truncate">
                  {item.seller.universityId}
                </p>
              )}
            </div>
          </div>

          {/* Seller Details Tooltip */}
          {showSellerTooltip && (
            <div 
              className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[100] animate-in fade-in slide-in-from-bottom-2 duration-200"
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setShowSellerTooltip(true)}
              onMouseLeave={() => setShowSellerTooltip(false)}
            >
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                {item.seller.profileImageUrl ? (
                  <img
                    src={item.seller.profileImageUrl}
                    alt={`${item.seller.firstName || ''} ${item.seller.lastName || ''}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-royal-blue-100 flex-shrink-0"
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
                    alt={`${item.seller.firstName || ''} ${item.seller.lastName || ''}`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-royal-blue-100 flex-shrink-0"
                  />
                )}
                <div>
                  <h4 className="text-h4 font-heading font-bold text-gray-900">
                    {item.seller.firstName || ''} {item.seller.lastName || ''}
                  </h4>
                  {item.seller.role && (
                    <p className="text-body-sm text-royal-blue font-body font-medium">
                      {getRoleLabel(item.seller.role)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {item.seller.universityId && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faIdCard} className="text-royal-blue w-4 h-4" />
                    <span className="text-body-sm text-gray-700 font-body">
                      {item.seller.universityId}
                    </span>
                  </div>
                )}
                {item.seller.email && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-royal-blue w-4 h-4" />
                    <span className="text-body-sm text-gray-700 font-body truncate">
                      {item.seller.email}
                    </span>
                  </div>
                )}
                {item.seller.role && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faBriefcase} className="text-royal-blue w-4 h-4" />
                    <span className="text-body-sm text-gray-700 font-body">
                      {getRoleLabel(item.seller.role)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        {item.createdAt && (
          <div className="mt-2 text-body-sm text-gray-400 font-body">
            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

