import { CartItem, Product } from '../types';

const CART_STORAGE_KEY = 'klu-marketplace-cart';

export const cartUtils = {
  loadCart: (): CartItem[] => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  saveCart: (items: CartItem[]): void => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  },

  getCartCount: (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  },

  addToCart: (product: Product, items: CartItem[]): CartItem[] => {
    const existing = items.find(item => item.id === product.id);
    
    if (existing) {
      return items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [...items, {
      id: product.id,
      name: product.name,
      price: product.price,
      seller: product.seller,
      sellerEmail: product.sellerEmail,
      image: product.image,
      quantity: 1
    }];
  },

  updateQuantity: (id: string, quantity: number, items: CartItem[]): CartItem[] => {
    if (quantity <= 0) {
      return items.filter(item => item.id !== id);
    }
    return items.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
  },

  removeFromCart: (id: string, items: CartItem[]): CartItem[] => {
    return items.filter(item => item.id !== id);
  },

  calculateTotal: (items: CartItem[]): number => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const getMailtoLink = (item: CartItem): string => {
  if (!item.sellerEmail) return '#';
  const subject = `KLU Marketplace • Interested in ${item.name}`;
  const body = `Hi ${item.seller},

I found your listing for "${item.name}" on KLU Marketplace and would like to purchase it.

Quantity: ${item.quantity}
Offered price: ${formatCurrency(item.price)}

Please let me know a convenient time and place to meet on campus.

Thanks!`;
  return `mailto:${encodeURIComponent(item.sellerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

