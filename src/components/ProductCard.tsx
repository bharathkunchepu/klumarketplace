import { Item, ItemCategory, ItemCondition } from '../types';
import { formatCurrency } from '../utils/cart';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  item: Item;
}

const ProductCard = ({ item }: ProductCardProps) => {
  const navigate = useNavigate();

  const categoryIcons: Record<ItemCategory, string> = {
    [ItemCategory.ELECTRONICS]: '💻',
    [ItemCategory.BOOKS]: '📚',
    [ItemCategory.CLOTHING]: '👕',
    [ItemCategory.FURNITURE]: '🪑',
    [ItemCategory.SPORTS]: '⚽',
    [ItemCategory.OTHER]: '📦'
  };

  const conditionColors: Record<ItemCondition, string> = {
    [ItemCondition.NEW]: '#4ad295',
    [ItemCondition.EXCELLENT]: '#22D3EE',
    [ItemCondition.GOOD]: '#A29BFE',
    [ItemCondition.FAIR]: '#FFD93D',
    [ItemCondition.POOR]: '#FF6B6B'
  };

  const handleClick = () => {
    navigate(`/items/${item.id}`);
  };

  const sellerName = `${item.seller.firstName} ${item.seller.lastName}`;
  const imageUrl = item.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';

  return (
    <div className="product-card-modern" data-id={item.id} data-category={item.category} onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="product-card-badge">
        <span className="category-icon">{categoryIcons[item.category] || '📦'}</span>
        <span className="category-label">{item.category}</span>
      </div>
      
      <div className="product-image-modern">
        <div className="image-overlay">
          <span 
            className="condition-badge"
            style={{
              background: conditionColors[item.condition],
              color: '#05050C',
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {item.condition}
          </span>
        </div>
        <img src={imageUrl} alt={item.title} onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
        }} />
      </div>
      
      <div className="product-info-modern">
        <h3 className="product-title">{item.title}</h3>
        <div className="product-seller-info">
          <span className="seller-icon">👤</span>
          <span className="seller-name">{sellerName}</span>
        </div>
        {item.description && (
          <p className="product-description">{item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}</p>
        )}
        {item.location && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            📍 {item.location}
          </div>
        )}
        
        <div className="product-footer-modern">
          <div className="price-section">
            <span className="price-label">Price</span>
            <span className="price-modern">{formatCurrency(item.price)}</span>
          </div>
          <button 
            className="btn-add-cart" 
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            aria-label={`View ${item.title}`}
          >
            <span className="cart-icon">👁️</span>
            <span>View</span>
          </button>
        </div>
      </div>
      
      <div className="product-card-glow"></div>
    </div>
  );
};

export default ProductCard;

