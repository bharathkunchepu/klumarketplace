document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const filterTabs = document.querySelectorAll('.filter-tab');
    const productGrid = document.getElementById('product-grid');
    const productCards = productGrid ? Array.from(productGrid.querySelectorAll('.product-card')) : [];
    const searchInput = document.getElementById('product-search');
    const resultsCountEl = document.getElementById('results-count');
    const cartCountEl = document.getElementById('cart-count');
    const buyButtons = document.querySelectorAll('.btn-buy');
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterFeedback = document.getElementById('newsletter-feedback');
    const cartListEl = document.getElementById('cart-list');
    const cartEmptyEl = document.getElementById('cart-empty');
    const cartSummaryTotalEl = document.getElementById('cart-summary-total');
    const cartSummaryCountEl = document.getElementById('cart-summary-count');
    const checkoutButton = document.getElementById('checkout-btn');

    const CART_STORAGE_KEY = 'klu-marketplace-cart';
    const CURRENT_USER_KEY = 'klu-marketplace-current-user';
    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });

    let activeFilter = 'all';
    let cartItems = loadCart();
    let cartCount = getCartCount();

    updateCartCount();
    renderCartPage();

    const NAV_SCROLL_THRESHOLD = 40;

    const updateNavbarState = () => {
        if (!navbar) return;
        if (window.scrollY > NAV_SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    updateNavbarState();
    window.addEventListener('scroll', updateNavbarState, { passive: true });

    // Mobile navigation toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.classList.toggle('open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                    navToggle.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Intersection Observer for reveal animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('[data-animate]').forEach(section => observer.observe(section));

    // Product filtering helpers
    const normalize = (value) => value.toLowerCase().trim();

    const getCardKeywords = (card) => {
        const datasetName = card.dataset.name || '';
        const title = card.querySelector('h3')?.textContent || '';
        const seller = card.querySelector('.seller')?.textContent || '';
        const description = card.querySelector('.description')?.textContent || '';
        return normalize([datasetName, title, seller, description].join(' '));
    };

    const cardIndex = new Map(productCards.map(card => [card, {
        category: card.dataset.category || 'all',
        keywords: getCardKeywords(card)
    }]));

    const updateResultsCount = (visibleCards) => {
        if (resultsCountEl) {
            resultsCountEl.textContent = String(visibleCards);
        }
    };

    const refreshProducts = () => {
        if (!productGrid) return;
        const query = normalize(searchInput?.value || '');
        let visibleCount = 0;

        productCards.forEach(card => {
            const { category, keywords } = cardIndex.get(card);
            const matchesCategory = activeFilter === 'all' || category === activeFilter;
            const matchesSearch = !query || keywords.includes(query);
            const shouldShow = matchesCategory && matchesSearch;
            card.classList.toggle('hidden', !shouldShow);
            if (shouldShow) visibleCount += 1;
        });

        updateResultsCount(visibleCount);

        if (!document.getElementById('no-results')) {
            const emptyState = document.createElement('div');
            emptyState.id = 'no-results';
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <h3>No items found</h3>
                <p>Try adjusting your filters or searching with a different keyword.</p>
            `;
            productGrid.appendChild(emptyState);
        }

        const emptyState = document.getElementById('no-results');
        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
        }
    };

    // Filter tab logic
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.filter === activeFilter) return;
            filterTabs.forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');
            activeFilter = tab.dataset.filter || 'all';
            refreshProducts();
        });
    });

    // Search input logic
    if (searchInput) {
        const debouncedSearch = debounce(() => refreshProducts(), 200);
        searchInput.addEventListener('input', debouncedSearch);
    }

    // Cart interactions
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            if (!card) return;
            addToCart(card);
        });
    });

    if (checkoutButton) {
        checkoutButton.addEventListener('click', handleCheckout);
    }

    // Newsletter form feedback
    if (newsletterForm && newsletterFeedback) {
        newsletterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (!emailInput?.value) return;

            newsletterFeedback.dataset.state = 'success';
            newsletterFeedback.textContent = 'Thanks for subscribing! Please check your inbox.';
            newsletterForm.reset();
            setTimeout(() => {
                newsletterFeedback.textContent = '';
            }, 4000);
        });
    }

    // Utility helpers
    function debounce(fn, wait = 150) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 2200);
    }

    function loadCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
        } catch (error) {
            console.warn('Unable to load cart from storage', error);
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }

    function getCartCount() {
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }

    function formatCurrency(amount) {
        return currencyFormatter.format(amount);
    }

    function updateCartCount() {
        if (cartCountEl) {
            cartCountEl.textContent = String(cartCount);
        }
    }

    function isLoggedIn() {
        // Prefer auth.js helper if available, fall back to checking localStorage key
        if (window.kluAuth && typeof window.kluAuth.isLoggedIn === 'function') {
            return window.kluAuth.isLoggedIn();
        }
        return !!localStorage.getItem(CURRENT_USER_KEY);
    }

    function requireLogin(redirectTarget) {
        if (isLoggedIn()) return true;

        alert('Please log in to add items to your cart.');
        const loginUrl = new URL('login.html', window.location.href);
        if (redirectTarget) {
            loginUrl.searchParams.set('redirect', redirectTarget);
        }
        window.location.href = loginUrl.toString();
        return false;
    }

    function addToCart(card) {
        // Block adding to cart if the user is not logged in
        if (!isLoggedIn()) {
            // If we're on the products page, send them back here after login
            const redirectTarget = 'index.html#products';
            requireLogin(redirectTarget);
            return;
        }

        const id = card.dataset.id;
        if (!id) return;
        const price = Number(card.dataset.price) || 0;
        const existing = cartItems.find(item => item.id === id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cartItems.push({
                id,
                name: card.querySelector('h3')?.textContent || 'Item',
                price,
                seller: card.dataset.seller || 'Seller',
                sellerEmail: card.dataset.sellerEmail || '',
                image: card.dataset.image || card.querySelector('img')?.src || '',
                quantity: 1
            });
        }

        saveCart();
        cartCount = getCartCount();
        updateCartCount();
        renderCartPage();
        showToast(`${card.querySelector('h3')?.textContent || 'Item'} added to cart`);
    }

    function updateQuantity(id, quantity) {
        const item = cartItems.find(entry => entry.id === id);
        if (!item) return;
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        item.quantity = quantity;
        saveCart();
        cartCount = getCartCount();
        updateCartCount();
        renderCartPage();
    }

    function removeFromCart(id) {
        cartItems = cartItems.filter(item => item.id !== id);
        saveCart();
        cartCount = getCartCount();
        updateCartCount();
        renderCartPage();
        showToast('Item removed from cart');
    }

    function calculateCartTotal() {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    function getMailtoLink(item) {
        if (!item.sellerEmail) return '#';
        const subject = `KLU Marketplace • Interested in ${item.name}`;
        const body = `Hi ${item.seller},

I found your listing for "${item.name}" on KLU Marketplace and would like to purchase it.

Quantity: ${item.quantity}
Offered price: ${formatCurrency(item.price)}

Please let me know a convenient time and place to meet on campus.

Thanks!`;
        return `mailto:${encodeURIComponent(item.sellerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    function renderCartPage() {
        if (!cartListEl || !cartEmptyEl || !cartSummaryTotalEl) return;

        cartListEl.innerHTML = '';

        if (!cartItems.length) {
            cartEmptyEl.style.display = 'flex';
            cartListEl.style.display = 'none';
            cartSummaryTotalEl.textContent = formatCurrency(0);
            if (checkoutButton) checkoutButton.disabled = true;
            if (cartSummaryCountEl) cartSummaryCountEl.textContent = '0';
            return;
        }

        cartEmptyEl.style.display = 'none';
        cartListEl.style.display = 'grid';

        cartItems.forEach(item => {
            const card = document.createElement('article');
            card.className = 'cart-item';
            card.innerHTML = `
                <div class="cart-item-media">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-seller">Seller: ${item.seller}</p>
                    <p class="cart-price">${formatCurrency(item.price)}</p>
                    <div class="cart-quantity-group" role="group" aria-label="Adjust quantity">
                        <button class="qty-btn" type="button" data-action="decrease" aria-label="Decrease quantity">−</button>
                        <span class="qty-value" aria-live="polite">${item.quantity}</span>
                        <button class="qty-btn" type="button" data-action="increase" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <a class="btn-primary btn-full contact-seller" href="${getMailtoLink(item)}">Contact Seller</a>
                    <button class="btn-ghost btn-full remove-item" type="button">Remove</button>
                </div>
            `;

            cartListEl.appendChild(card);

            const decreaseBtn = card.querySelector('[data-action="decrease"]');
            const increaseBtn = card.querySelector('[data-action="increase"]');
            const removeBtn = card.querySelector('.remove-item');
            const contactBtn = card.querySelector('.contact-seller');

            decreaseBtn?.addEventListener('click', () => updateQuantity(item.id, item.quantity - 1));
            increaseBtn?.addEventListener('click', () => updateQuantity(item.id, item.quantity + 1));
            removeBtn?.addEventListener('click', () => removeFromCart(item.id));

            if (contactBtn) {
                contactBtn.href = getMailtoLink(item);
            }
        });

        const totalItems = getCartCount();
        cartSummaryTotalEl.textContent = formatCurrency(calculateCartTotal());
        if (cartSummaryCountEl) {
            cartSummaryCountEl.textContent = String(totalItems);
        }
        if (checkoutButton) checkoutButton.disabled = false;
    }

    function handleCheckout() {
        if (!isLoggedIn()) {
            requireLogin('cart.html');
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
    }

    // If user tries to open cart page directly without login, force login first
    const onCartPage = window.location.pathname.endsWith('cart.html');
    if (onCartPage && !isLoggedIn()) {
        requireLogin('cart.html');
        return;
    }

    // Initialize view state
    refreshProducts();
});
