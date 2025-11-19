import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedSection from '../components/AnimatedSection';
import { CartItem } from '../types';
import { authUtils } from '../utils/auth';
import { cartUtils, formatCurrency, getMailtoLink } from '../utils/cart';
import { showToast } from '../utils/toast';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!authUtils.isLoggedIn()) {
      alert('Please log in to view your cart.');
      navigate('/login', { state: { redirect: '/cart' } });
      return;
    }
    setCartItems(cartUtils.loadCart());
  }, [navigate]);

  const updateQuantity = (id: string, quantity: number) => {
    const updated = cartUtils.updateQuantity(id, quantity, cartItems);
    setCartItems(updated);
    cartUtils.saveCart(updated);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (id: string) => {
    const updated = cartUtils.removeFromCart(id, cartItems);
    setCartItems(updated);
    cartUtils.saveCart(updated);
    window.dispatchEvent(new Event('cartUpdated'));
    showToast('Item removed from cart');
  };

  const handleCheckout = () => {
    if (!authUtils.isLoggedIn()) {
      navigate('/login', { state: { redirect: '/cart' } });
      return;
    }

    if (!cartItems.length) {
      showToast('Your cart is empty.');
      return;
    }

    const uniqueSellers = [...new Set(cartItems.map(item => item.sellerEmail).filter(Boolean))];

    if (uniqueSellers.length === 1) {
      const sellerEmail = uniqueSellers[0];
      const sellerName = cartItems[0].seller;
      const lines = cartItems.map(item => `• ${item.name} (Qty: ${item.quantity}) – ${formatCurrency(item.price * item.quantity)}`).join('\n');
      const subject = 'KLU Marketplace • Checkout request';
      const body = `Hi ${sellerName},

I'd like to proceed with the following items:
${lines}

Let me know a convenient time for pickup on campus.

Thanks!`;
      window.location.href = `mailto:${encodeURIComponent(sellerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast('Opening email draft to the seller.');
    } else {
      showToast('Contact each seller using the buttons next to their items to finalise checkout.');
    }
  };

  const totalItems = cartUtils.getCartCount(cartItems);
  const total = cartUtils.calculateTotal(cartItems);

  return (
    <AnimatedSection className="cart-section products">
      <h2>Your Cart</h2>
      <div className="cart-layout">
        <div className="cart-list" id="cart-list">
          {cartItems.length === 0 ? (
            <div className="cart-empty" style={{ display: 'flex' }}>
              <div className="cart-empty-inner">
                <h3>Your cart is empty</h3>
                <p>Add items from the marketplace and contact sellers to complete your purchase.</p>
                <button className="btn-primary" type="button" onClick={() => navigate('/#products')}>
                  Browse Products
                </button>
              </div>
            </div>
          ) : (
            cartItems.map(item => (
              <article key={item.id} className="cart-item">
                <div className="cart-item-media">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-seller">Seller: {item.seller}</p>
                  <p className="cart-price">{formatCurrency(item.price)}</p>
                  <div className="cart-quantity-group" role="group" aria-label="Adjust quantity">
                    <button className="qty-btn" type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                    <span className="qty-value" aria-live="polite">{item.quantity}</span>
                    <button className="qty-btn" type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <a className="btn-primary btn-full contact-seller" href={getMailtoLink(item)}>Contact Seller</a>
                  <button className="btn-ghost btn-full remove-item" type="button" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </article>
            ))
          )}
        </div>
        <aside className="cart-summary">
          <h3>Checkout Summary</h3>
          <div className="cart-summary-row">
            <span>Total Items</span>
            <span id="cart-summary-count">{totalItems}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Estimated Total</span>
            <span id="cart-summary-total">{formatCurrency(total)}</span>
          </div>
          <p className="cart-summary-note">
            Contact the seller to confirm availability and agree on a pickup time on campus.
          </p>
          <button className="btn-primary btn-full" id="checkout-btn" type="button" disabled={cartItems.length === 0} onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </AnimatedSection>
  );
};

export default Cart;

