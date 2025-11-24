import { useState, useEffect, useCallback } from 'react';
import { authUtils } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faTimes,
  faSpinner,
  faBoxOpen,
  faPlus,
  faTag,
  faCertificate,
  faDollarSign,
  faXmark,
  faBook,
  faPencil,
  faCar,
  faLaptop,
  faCouch,
  faShirt,
  faFootball,
  faBox,
  faStar,
  faThumbsUp,
  faBalanceScale,
  faExclamationTriangle,
  faCalendar,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import itemService from '../services/itemService';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { toastUtils } from '../utils/toast';
import type { Item, ItemSearchParams } from '../types';
import { ItemCategory, ItemCondition, ItemStatus } from '../types';

const Products = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10, // Default page size (API max is 100)
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | ''>('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [userId, setUserId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authUtils.isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: ItemSearchParams = {
        page: pagination.page,
        size: Math.min(pagination.size, 100), // API max page size is 100
        status: ItemStatus.ACTIVE, // Only show active items (API default)
      };

      if (debouncedSearchQuery.trim()) {
        params.keyword = debouncedSearchQuery.trim();
      }
      if (selectedCategory) {
        params.category = selectedCategory as ItemCategory;
      }
      if (selectedCondition) {
        params.condition = selectedCondition as ItemCondition;
      }
      if (debouncedMinPrice) {
        const minPriceValue = parseFloat(debouncedMinPrice);
        if (!isNaN(minPriceValue) && minPriceValue >= 0) {
          params.minPrice = minPriceValue;
        }
      }
      if (debouncedMaxPrice) {
        const maxPriceValue = parseFloat(debouncedMaxPrice);
        if (!isNaN(maxPriceValue) && maxPriceValue >= 0) {
          params.maxPrice = maxPriceValue;
        }
      }
      if (userId.trim()) {
        const parsedUserId = parseInt(userId.trim(), 10);
        if (!isNaN(parsedUserId)) {
          params.userId = parsedUserId;
        }
      }
      if (fromDate) {
        // Convert date to ISO-8601 format with time set to 00:00:00 UTC
        try {
          const date = new Date(fromDate);
          if (!isNaN(date.getTime())) {
            // Set to start of day in UTC
            date.setUTCHours(0, 0, 0, 0);
            params.fromDate = date.toISOString();
          }
        } catch (error) {
          console.error('Invalid fromDate format:', error);
          // Don't add invalid date to params
        }
      }
      if (toDate) {
        // Convert date to ISO-8601 format with time set to 23:59:59 UTC
        try {
          const date = new Date(toDate);
          if (!isNaN(date.getTime())) {
            // Set to end of day in UTC
            date.setUTCHours(23, 59, 59, 999);
            params.toDate = date.toISOString();
          }
        } catch (error) {
          console.error('Invalid toDate format:', error);
          // Don't add invalid date to params
        }
      }

      const response = await itemService.getItems(params);
      // Ensure response structure matches API documentation
      setItems(response.items || []);
      setPagination(response.pagination || {
        page: pagination.page,
        size: pagination.size,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      });
    } catch (error: any) {
      console.error('Error fetching items:', error);
      // Show user-friendly error message
      if (error.response?.status === 400) {
        // Bad Request - likely invalid date format or parameter
        const errorMessage = error.response?.data?.message || 'Invalid search parameters. Please check your filters.';
        toastUtils.error(errorMessage);
      } else {
        toastUtils.showApiError(error);
      }
      setItems([]);
      // Reset pagination on error
      setPagination((prev) => ({
        ...prev,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, debouncedSearchQuery, selectedCategory, selectedCondition, debouncedMinPrice, debouncedMaxPrice, userId, fromDate, toDate]);

  // Debounce search query - wait 500ms after user stops typing before fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to first page when search changes
      setPagination((prev) => ({ ...prev, page: 0 }));
    }, 500); // 500ms delay for search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce price changes - wait 800ms after user stops sliding before fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
      // Reset to first page when price changes
      setPagination((prev) => ({ ...prev, page: 0 }));
    }, 800); // 800ms delay

    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Fetch items on mount and when filters change
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle search
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setUserId('');
    setFromDate('');
    setToDate('');
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const hasActiveFilters = selectedCategory || selectedCondition || debouncedMinPrice || debouncedMaxPrice || userId || fromDate || toDate;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-heading font-bold text-gray-900 mb-2">
              Marketplace
            </h1>
            <p className="text-body text-gray-600 font-body">
              Browse and discover items from fellow students
            </p>
          </div>
          <Link
            to="/products/create"
            className="inline-flex items-center justify-center px-6 py-3 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-all duration-300 hover:shadow-lg whitespace-nowrap"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Create Item
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-royal-blue to-royal-blue-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilter} className="text-white text-lg" />
                    <h2 className="text-h3 font-heading font-bold text-white">
                      Filters
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden text-white/80 hover:text-white transition-colors"
                    aria-label="Close filters"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
                {hasActiveFilters && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-body-sm text-white/90 font-body">
                      {[selectedCategory, selectedCondition, minPrice, maxPrice, userId, fromDate, toDate].filter(Boolean).length} active
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-body-sm text-white/90 hover:text-white font-body underline transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-4">
                {/* Search */}
                <div>
                  <label className="text-body-sm font-heading font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faSearch} className="text-royal-blue" />
                    Search Items
                  </label>
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type to search..."
                        className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-md font-body focus:ring-1 focus:ring-royal-blue focus:border-royal-blue transition-all"
                      />
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setPagination((prev) => ({ ...prev, page: 0 }));
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Clear search"
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Category Filter */}
                <div>
                  <label className="text-body-sm font-heading font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faTag} className="text-royal-blue text-sm" />
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value as ItemCategory | '');
                        setPagination((prev) => ({ ...prev, page: 0 }));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md font-body bg-white focus:ring-1 focus:ring-royal-blue focus:border-royal-blue transition-all appearance-none cursor-pointer hover:border-royal-blue-300"
                    >
                      <option value="">All Categories</option>
                      <option value={ItemCategory.BOOKS}>Books</option>
                      <option value={ItemCategory.STATIONERY}>Stationery</option>
                      <option value={ItemCategory.VEHICLES}>Vehicles</option>
                      <option value={ItemCategory.ELECTRONICS}>Electronics</option>
                      <option value={ItemCategory.FURNITURE}>Furniture</option>
                      <option value={ItemCategory.CLOTHING}>Clothing</option>
                      <option value={ItemCategory.SPORTS}>Sports</option>
                      <option value={ItemCategory.OTHER}>Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {selectedCategory && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-royal-blue-50 text-royal-blue-700 rounded-full text-body-sm font-body">
                        {selectedCategory === ItemCategory.BOOKS && <FontAwesomeIcon icon={faBook} className="text-xs" />}
                        {selectedCategory === ItemCategory.STATIONERY && <FontAwesomeIcon icon={faPencil} className="text-xs" />}
                        {selectedCategory === ItemCategory.VEHICLES && <FontAwesomeIcon icon={faCar} className="text-xs" />}
                        {selectedCategory === ItemCategory.ELECTRONICS && <FontAwesomeIcon icon={faLaptop} className="text-xs" />}
                        {selectedCategory === ItemCategory.FURNITURE && <FontAwesomeIcon icon={faCouch} className="text-xs" />}
                        {selectedCategory === ItemCategory.CLOTHING && <FontAwesomeIcon icon={faShirt} className="text-xs" />}
                        {selectedCategory === ItemCategory.SPORTS && <FontAwesomeIcon icon={faFootball} className="text-xs" />}
                        {selectedCategory === ItemCategory.OTHER && <FontAwesomeIcon icon={faBox} className="text-xs" />}
                        {selectedCategory.replace(/_/g, ' ')}
                        <button
                          onClick={() => {
                            setSelectedCategory('');
                            setPagination((prev) => ({ ...prev, page: 0 }));
                          }}
                          className="hover:bg-royal-blue-100 rounded-full p-0.5 transition-colors"
                          aria-label="Remove category filter"
                        >
                          <FontAwesomeIcon icon={faXmark} className="text-xs" />
                        </button>
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Condition Filter */}
                <div>
                  <label className="text-body-sm font-heading font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCertificate} className="text-royal-blue text-sm" />
                    Condition
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCondition}
                      onChange={(e) => {
                        setSelectedCondition(e.target.value as ItemCondition | '');
                        setPagination((prev) => ({ ...prev, page: 0 }));
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md font-body bg-white focus:ring-1 focus:ring-royal-blue focus:border-royal-blue transition-all appearance-none cursor-pointer hover:border-royal-blue-300"
                    >
                      <option value="">All Conditions</option>
                      <option value={ItemCondition.NEW}>New</option>
                      <option value={ItemCondition.LIKE_NEW}>Like New</option>
                      <option value={ItemCondition.GOOD}>Good</option>
                      <option value={ItemCondition.FAIR}>Fair</option>
                      <option value={ItemCondition.POOR}>Poor</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {selectedCondition && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-royal-blue-50 text-royal-blue-700 rounded-full text-body-sm font-body">
                        {selectedCondition === ItemCondition.NEW && <FontAwesomeIcon icon={faStar} className="text-xs" />}
                        {selectedCondition === ItemCondition.LIKE_NEW && <FontAwesomeIcon icon={faStar} className="text-xs" />}
                        {selectedCondition === ItemCondition.GOOD && <FontAwesomeIcon icon={faThumbsUp} className="text-xs" />}
                        {selectedCondition === ItemCondition.FAIR && <FontAwesomeIcon icon={faBalanceScale} className="text-xs" />}
                        {selectedCondition === ItemCondition.POOR && <FontAwesomeIcon icon={faExclamationTriangle} className="text-xs" />}
                        {selectedCondition.replace(/_/g, ' ')}
                        <button
                          onClick={() => {
                            setSelectedCondition('');
                            setPagination((prev) => ({ ...prev, page: 0 }));
                          }}
                          className="hover:bg-royal-blue-100 rounded-full p-0.5 transition-colors"
                          aria-label="Remove condition filter"
                        >
                          <FontAwesomeIcon icon={faXmark} className="text-xs" />
                        </button>
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200"></div>

                {/* Price Range */}
                <div>
                  <label className="text-body-sm font-heading font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faDollarSign} className="text-royal-blue text-sm" />
                    Price Range
                  </label>

                  {/* Range Slider Container */}
                  <div className="space-y-3">
                    {/* Value Display */}
                    <div className="flex items-center justify-between px-1">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 font-body">Min</div>
                        <div className="text-sm font-heading font-semibold text-royal-blue">
                          ₹{priceRange.min.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-gray-400 mx-2 text-xs">-</div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 font-body">Max</div>
                        <div className="text-sm font-heading font-semibold text-royal-blue">
                          ₹{priceRange.max.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Dual Range Slider */}
                    <div className="relative">
                      {/* Track */}
                      <div className="h-2 bg-gray-200 rounded-full relative">
                        {/* Active Range */}
                        <div
                          className="absolute h-2 bg-royal-blue rounded-full"
                          style={{
                            left: `${(priceRange.min / 100000) * 100}%`,
                            width: `${((priceRange.max - priceRange.min) / 100000) * 100}%`,
                          }}
                        ></div>
                      </div>

                      {/* Min Slider */}
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="100"
                        value={priceRange.min}
                        onChange={(e) => {
                          const newMin = Math.min(parseInt(e.target.value), priceRange.max - 1000);
                          setPriceRange({ ...priceRange, min: newMin });
                          setMinPrice(newMin.toString());
                          // Don't trigger API call immediately - debounce will handle it
                        }}
                        className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                        style={{
                          zIndex: priceRange.min > priceRange.max - 1000 ? 3 : 2,
                        }}
                      />

                      {/* Max Slider */}
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="100"
                        value={priceRange.max}
                        onChange={(e) => {
                          const newMax = Math.max(parseInt(e.target.value), priceRange.min + 1000);
                          setPriceRange({ ...priceRange, max: newMax });
                          setMaxPrice(newMax.toString());
                          // Don't trigger API call immediately - debounce will handle it
                        }}
                        className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                        style={{
                          zIndex: priceRange.max < priceRange.min + 1000 ? 3 : 2,
                        }}
                      />
                    </div>

                    {/* Quick Price Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPriceRange({ min: 0, max: 10000 });
                          setMinPrice('0');
                          setMaxPrice('10000');
                        }}
                        className="px-2 py-1 text-xs font-body bg-gray-100 text-gray-700 rounded-md hover:bg-royal-blue-50 hover:text-royal-blue transition-colors"
                      >
                        &lt;₹10k
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPriceRange({ min: 10000, max: 25000 });
                          setMinPrice('10000');
                          setMaxPrice('25000');
                        }}
                        className="px-2 py-1 text-xs font-body bg-gray-100 text-gray-700 rounded-md hover:bg-royal-blue-50 hover:text-royal-blue transition-colors"
                      >
                        ₹10-25k
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPriceRange({ min: 25000, max: 50000 });
                          setMinPrice('25000');
                          setMaxPrice('50000');
                        }}
                        className="px-2 py-1 text-xs font-body bg-gray-100 text-gray-700 rounded-md hover:bg-royal-blue-50 hover:text-royal-blue transition-colors"
                      >
                        ₹25-50k
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPriceRange({ min: 50000, max: 100000 });
                          setMinPrice('50000');
                          setMaxPrice('100000');
                        }}
                        className="px-2 py-1 text-xs font-body bg-gray-100 text-gray-700 rounded-md hover:bg-royal-blue-50 hover:text-royal-blue transition-colors"
                      >
                        &gt;₹50k
                      </button>
                    </div>
                  </div>

                  {/* Active Price Filter Badge */}
                  {(debouncedMinPrice || debouncedMaxPrice) && (parseFloat(debouncedMinPrice || '0') > 0 || parseFloat(debouncedMaxPrice || '100000') < 100000) && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-royal-blue-50 text-royal-blue-700 rounded-full text-xs font-body">
                        ₹{parseFloat(debouncedMinPrice || '0').toLocaleString()} - ₹{parseFloat(debouncedMaxPrice || '100000').toLocaleString()}
                        <button
                          onClick={() => {
                            setPriceRange({ min: 0, max: 100000 });
                            setMinPrice('');
                            setMaxPrice('');
                          }}
                          className="hover:bg-royal-blue-100 rounded-full p-0.5 transition-colors ml-0.5"
                          aria-label="Remove price filter"
                        >
                          <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                        </button>
                      </span>
                    </div>
                  )}
                </div>

                {/* Date Range & User Filter - Grouped */}
                <div className="space-y-3">
                  <div>
                    <label className="text-body-sm font-heading font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCalendar} className="text-royal-blue text-sm" />
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => {
                            setFromDate(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 0 }));
                          }}
                          max={toDate || undefined}
                          className="w-full pl-7 pr-2 py-2 text-xs border border-gray-200 rounded-md font-body focus:ring-1 focus:ring-royal-blue focus:border-royal-blue transition-all"
                        />
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => {
                            setToDate(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 0 }));
                          }}
                          min={fromDate || undefined}
                          className="w-full pl-7 pr-2 py-2 text-xs border border-gray-200 rounded-md font-body focus:ring-1 focus:ring-royal-blue focus:border-royal-blue transition-all"
                        />
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs"
                        />
                      </div>
                    </div>
                    {(fromDate || toDate) && (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-royal-blue-50 text-royal-blue-700 rounded-full text-xs font-body">
                          {fromDate && toDate ? (
                            <>
                              {new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </>
                          ) : fromDate ? (
                            <>From {new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</>
                          ) : (
                            <>Until {new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</>
                          )}
                          <button
                            onClick={() => {
                              setFromDate('');
                              setToDate('');
                              setPagination((prev) => ({ ...prev, page: 0 }));
                            }}
                            className="hover:bg-royal-blue-100 rounded-full p-0.5 transition-colors ml-0.5"
                            aria-label="Remove date filter"
                          >
                            <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                          </button>
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-body-sm font-heading font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faUser} className="text-royal-blue text-sm" />
                      Seller ID
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={userId}
                        onChange={(e) => {
                          setUserId(e.target.value);
                          setPagination((prev) => ({ ...prev, page: 0 }));
                        }}
                        placeholder="User ID"
                        min="1"
                        className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-md font-body focus:ring-1 focus:ring-royal-blue focus:border-royal-blue transition-all"
                      />
                      <FontAwesomeIcon
                        icon={faUser}
                        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                      />
                      {userId && (
                        <button
                          type="button"
                          onClick={() => {
                            setUserId('');
                            setPagination((prev) => ({ ...prev, page: 0 }));
                          }}
                          className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label="Clear user filter"
                        >
                          <FontAwesomeIcon icon={faXmark} className="text-xs" />
                        </button>
                      )}
                    </div>
                    {userId && (
                      <div className="mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-royal-blue-50 text-royal-blue-700 rounded-full text-xs font-body">
                          ID: {userId}
                          <button
                            onClick={() => {
                              setUserId('');
                              setPagination((prev) => ({ ...prev, page: 0 }));
                            }}
                            className="hover:bg-royal-blue-100 rounded-full p-0.5 transition-colors ml-0.5"
                            aria-label="Remove user filter"
                          >
                            <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                          </button>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <style>{`
                  .slider-thumb::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #4169E1;
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s;
                  }
                  .slider-thumb::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 8px rgba(65, 105, 225, 0.4);
                  }
                  .slider-thumb::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #4169E1;
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s;
                  }
                  .slider-thumb::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 8px rgba(65, 105, 225, 0.4);
                  }
                `}</style>
              </div>
            </div>
          </aside>

          {/* Right Content - Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md font-heading font-semibold text-button flex items-center justify-center gap-2 hover:bg-gray-50"
              >
                <FontAwesomeIcon icon={faFilter} />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Results Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-body font-body text-gray-600">
                  {loading ? (
                    'Loading...'
                  ) : (
                    <>
                      Showing <span className="font-semibold text-gray-900">{items.length}</span> of{' '}
                      <span className="font-semibold text-gray-900">{pagination.totalElements}</span> items
                    </>
                  )}
                </p>
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
                  No items found
                </h3>
                <p className="text-body text-gray-600 font-body mb-4">
                  {hasActiveFilters || searchQuery
                    ? 'Try adjusting your filters or search query'
                    : 'No items are currently available'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-royal-blue text-white rounded-md font-heading font-semibold text-button hover:bg-royal-blue-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Products Grid */}
            {!loading && items.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
