import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AnimatedSection from '../components/AnimatedSection';
import Pagination from '../components/Pagination';
import { Item, ItemCategory, ItemStatus, Pagination as PaginationType } from '../types';
import itemService from '../services/itemService';
import { handleApiError } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

const Home = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<ItemCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        keyword: searchQuery || undefined,
        category: activeFilter !== 'all' ? activeFilter : undefined,
        status: ItemStatus.ACTIVE,
        page: currentPage,
        size: 20
      };

      const response = await itemService.searchItems(params);
      setItems(response.items);
      setPagination(response.pagination);
    } catch (err) {
      setError(handleApiError(err));
      showToast('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter, currentPage]);

  // Debounce search query
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      setCurrentPage(0); // Reset to first page on search
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery]);

  // Fetch items when filters or page change
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput?.value) {
      showToast('Thanks for subscribing! Please check your inbox.');
      form.reset();
    }
  };

  return (
    <>
      <AnimatedSection className="hero" id="home">
        <div className="hero-content">
          <h1>Welcome to KLU Marketplace</h1>
          <p>Buy and Sell Items Within Your College Community — safe, simple, and student-first.</p>
          <button className="btn-primary" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
            Start Shopping
          </button>
        </div>
      </AnimatedSection>

      <AnimatedSection id="products" className="products">
        <div className="products-header">
          <div className="products-header-content">
            <h2>Featured Items</h2>
            <p className="products-subtitle">
              Discover amazing deals from fellow students on campus
            </p>
          </div>
          <div className="products-stats-badge">
            <span className="stats-number">{pagination?.totalElements || 0}</span>
            <span className="stats-label">Items Available</span>
          </div>
        </div>

        <div className="products-toolbar-modern">
          <div className="search-wrapper">
            <div className="search-icon">🔍</div>
            <input
              type="search"
              id="product-search"
              className="search-input-modern"
              placeholder="Search items, sellers or keywords…"
              aria-label="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search" 
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(0);
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="filter-section">
            <div className="filter-label">Filter by category:</div>
            <div className="filter-tabs-modern" role="tablist" aria-label="Product categories">
              {[
                { key: 'all' as const, label: 'All', icon: '🌟' },
                { key: ItemCategory.ELECTRONICS, label: 'Electronics', icon: '💻' },
                { key: ItemCategory.BOOKS, label: 'Books', icon: '📚' },
                { key: ItemCategory.CLOTHING, label: 'Clothing', icon: '👕' },
                { key: ItemCategory.FURNITURE, label: 'Furniture', icon: '🪑' },
                { key: ItemCategory.SPORTS, label: 'Sports', icon: '⚽' },
                { key: ItemCategory.OTHER, label: 'Other', icon: '📦' }
              ].map(category => (
                <button
                  key={category.key}
                  className={`filter-tab-modern ${activeFilter === category.key ? 'active' : ''}`}
                  data-filter={category.key}
                  type="button"
                  onClick={() => {
                    setActiveFilter(category.key);
                    setCurrentPage(0);
                  }}
                >
                  <span className="filter-icon">{category.icon}</span>
                  <span className="filter-text">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="empty-state-modern">
            <div className="empty-icon">⏳</div>
            <h3>Loading items...</h3>
          </div>
        ) : error ? (
          <div className="empty-state-modern">
            <div className="empty-icon">⚠️</div>
            <h3>Error loading items</h3>
            <p>{error}</p>
            <button 
              className="btn-primary" 
              onClick={fetchItems}
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state-modern">
            <div className="empty-icon">🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your filters or searching with a different keyword.</p>
            <button 
              className="btn-primary" 
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setCurrentPage(0);
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="products-grid-modern" id="product-grid">
              {items.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </AnimatedSection>

      {/* Combined About & Mottos Section - Side by Side */}
      <AnimatedSection id="about" className="products compact-section">
        <div className="about-mottos-combined">
          <div className="about-compact">
            <h2>About KLU Marketplace</h2>
            <p className="about-intro">
              A student-run platform connecting buyers and sellers within your college community. 
              Trade textbooks, gadgets, furniture, and more — safely, simply, and sustainably.
            </p>
            
            <div className="about-features-compact">
              <div className="about-feature-mini">
                <div className="about-icon-mini">🎓</div>
                <div>
                  <h4>Student-First</h4>
                  <p>Built by students, for students</p>
                </div>
              </div>
              <div className="about-feature-mini">
                <div className="about-icon-mini">🛡️</div>
                <div>
                  <h4>Safe & Secure</h4>
                  <p>Verified profiles, campus transactions</p>
                </div>
              </div>
              <div className="about-feature-mini">
                <div className="about-icon-mini">🌱</div>
                <div>
                  <h4>Sustainable</h4>
                  <p>Give items a second life</p>
                </div>
              </div>
            </div>

            <div className="about-stats-compact">
              <div className="stat-mini">
                <div className="stat-number-mini">1000+</div>
                <div className="stat-label-mini">Users</div>
              </div>
              <div className="stat-mini">
                <div className="stat-number-mini">500+</div>
                <div className="stat-label-mini">Items</div>
              </div>
              <div className="stat-mini">
                <div className="stat-number-mini">₹2L+</div>
                <div className="stat-label-mini">Saved</div>
              </div>
              <div className="stat-mini">
                <div className="stat-number-mini">98%</div>
                <div className="stat-label-mini">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="mottos-compact">
            <h2>Our Core Values</h2>
            <div className="mottos-grid-compact">
              {[
                { 
                  icon: '🌱', 
                  title: 'Sustainability', 
                  desc: 'Reduce campus waste by buying and selling used goods.',
                  gradient: 'linear-gradient(135deg, #22D3EE, #0EA5E9)'
                },
                { 
                  icon: '💰', 
                  title: 'Affordability', 
                  desc: 'Save money while getting quality items.',
                  gradient: 'linear-gradient(135deg, #A29BFE, #6C5CE7)'
                },
                { 
                  icon: '🛡️', 
                  title: 'Trust', 
                  desc: 'Simple, transparent listings and clear seller details.',
                  gradient: 'linear-gradient(135deg, #FF6B6B, #FF8787)'
                },
                { 
                  icon: '🤝', 
                  title: 'Community', 
                  desc: 'Build stronger campus connections.',
                  gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)'
                }
              ].map((motto, idx) => (
                <div key={idx} className="motto-mini-card">
                  <div className="motto-icon-mini" style={{ background: motto.gradient }}>
                    {motto.icon}
                  </div>
                  <div className="motto-content-mini">
                    <h4>{motto.title}</h4>
                    <p>{motto.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* How It Works - Horizontal Layout */}
      <AnimatedSection id="how" className="products compact-section">
        <div className="how-header-compact">
          <h2>How It Works</h2>
          <p>Get started in three simple steps</p>
        </div>

        <div className="how-steps-horizontal">
          {[
            { 
              icon: '📝', 
              number: '01',
              title: 'List Item', 
              desc: 'Create a listing with photos and details in under 2 minutes.',
              gradient: 'linear-gradient(135deg, #A29BFE, #6C5CE7)'
            },
            { 
              icon: '💬', 
              number: '02',
              title: 'Chat & Meet', 
              desc: 'Message sellers and arrange safe pickup on campus.',
              gradient: 'linear-gradient(135deg, #22D3EE, #0EA5E9)'
            },
            { 
              icon: '✅', 
              number: '03',
              title: 'Complete Trade', 
              desc: 'Meet on campus and close the sale — simple and safe.',
              gradient: 'linear-gradient(135deg, #FF6B6B, #FF8787)'
            }
          ].map((step, idx) => (
            <div key={idx} className="how-step-horizontal">
              <div className="step-number-horizontal">{step.number}</div>
              <div className="step-icon-horizontal" style={{ background: step.gradient }}>
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Testimonials - Compact 2 Cards */}
      <AnimatedSection id="testimonials" className="products compact-section">
        <div className="testimonials-header-compact">
          <h2>What Students Say</h2>
          <p>Real experiences from our community</p>
        </div>

        <div className="testimonials-compact">
          {[
            { 
              quote: 'Found all my semester books here — saved a ton! The sellers were super friendly.',
              author: 'Priya',
              branch: 'CSE',
              rating: 5,
              avatar: '👩‍💻'
            },
            { 
              quote: 'Easy to list and quick responses. Sold my old laptop in just 2 days!',
              author: 'Arjun',
              branch: 'ECE',
              rating: 5,
              avatar: '👨‍💻'
            }
          ].map((testimonial, idx) => (
            <div key={idx} className="testimonial-compact-card">
              <div className="testimonial-compact-header">
                <div className="testimonial-avatar-compact">{testimonial.avatar}</div>
                <div className="testimonial-info-compact">
                  <div className="testimonial-author-compact">{testimonial.author}</div>
                  <div className="testimonial-branch-compact">{testimonial.branch}</div>
                </div>
                <div className="testimonial-rating-compact">{'⭐'.repeat(testimonial.rating)}</div>
              </div>
              <p className="testimonial-quote-compact">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Newsletter - Compact */}
      <AnimatedSection id="contact" className="products compact-section">
        <div className="newsletter-compact">
          <div className="newsletter-compact-content">
            <h2>Stay Updated</h2>
            <p>Join our newsletter for listings, events and safety tips</p>
            <form className="newsletter-form-compact" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                id="newsletter-email"
                placeholder="Enter your email"
                required
                className="newsletter-input-compact"
              />
              <button className="newsletter-button-compact" type="submit">
                Subscribe →
              </button>
            </form>
            <div className="newsletter-benefits-compact">
              <span>✨ Weekly highlights</span>
              <span>🔥 Top deals</span>
              <span>🛡️ Safety tips</span>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
};

export default Home;

