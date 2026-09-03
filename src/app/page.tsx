'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, StoreInfo, Category, StockStatus } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  MapPin, 
  RefreshCw, 
  ShoppingBag, 
  ArrowUpDown, 
  Navigation,
  X,
  SlidersHorizontal,
  Info
} from 'lucide-react';

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Cricket',
  'Badminton',
  'Football',
  'Swimming',
  'Skating',
  'Fitness & Gym',
  'Tennis & TT',
  'Shoes & Wear',
  'Accessories',
];

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1,500', min: 500, max: 1500 },
  { label: '₹1,500 - ₹3,000', min: 1500, max: 3000 },
  { label: '₹3,000+', min: 3000, max: Infinity },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState(0);
  const [selectedStockFilter, setSelectedStockFilter] = useState<'ALL' | 'IN_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');

  // Load products with dual-sync (API + LocalStorage for guaranteed persistence of newly added items)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, storeRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/store')
        ]);

        let apiProducts: Product[] = [];
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          apiProducts = prodData.products || [];
        }

        // Check if there are any locally added products in localStorage (for client persistence)
        let mergedProducts = [...apiProducts];
        if (typeof window !== 'undefined') {
          try {
            const localSaved = localStorage.getItem('mayur_custom_products');
            if (localSaved) {
              const localList: Product[] = JSON.parse(localSaved);
              if (Array.isArray(localList) && localList.length > 0) {
                // Merge local products: replace existing by id or prepend new ones
                const apiMap = new Map(apiProducts.map(p => [p.id, p]));
                localList.forEach(lp => apiMap.set(lp.id, lp));
                mergedProducts = Array.from(apiMap.values());
              }
            }
          } catch (e) {
            console.error('Local storage merge error:', e);
          }
        }

        setProducts(mergedProducts);

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setStoreInfo(storeData.storeInfo);
        }
      } catch (err) {
        console.error('Error loading storefront data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Unique brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand.trim());
    });
    return ['All', ...Array.from(brands)];
  }, [products]);

  // Smart helper to normalize singular/plural terms (e.g. 'balls' -> 'ball', 'bats' -> 'bat', 'skates' -> 'skate')
  const getStem = (w: string) => {
    if (w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
    if (w.endsWith('s') && w.length > 3) return w.slice(0, -1);
    return w;
  };

  // Check if a single product matches the search query terms
  const productMatchesSearch = (p: Product, terms: string[]) => {
    if (terms.length === 0) return true;

    const searchableText = [
      p.name,
      p.brand,
      p.category,
      p.description,
      p.badge || '',
      ...(p.features || [])
    ].join(' ').toLowerCase();

    // Every search term must match in some way
    return terms.every(term => {
      if (searchableText.includes(term)) return true;
      const stem = getStem(term);
      if (stem !== term && searchableText.includes(stem)) return true;
      return false;
    });
  };

  // Filtered & Sorted products
  const { filteredProducts, autoExpandedCategory } = useMemo(() => {
    const priceRange = PRICE_RANGES[selectedPriceRangeIndex];
    const terms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);

    // Step 1: Filter with current category
    let list = products.filter((p) => {
      // 1. Search match
      if (!productMatchesSearch(p, terms)) return false;

      // 2. Category match
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // 3. Brand match
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
        return false;
      }

      // 4. Price range match
      if (p.price < priceRange.min || p.price > priceRange.max) {
        return false;
      }

      // 5. Stock filter
      if (selectedStockFilter === 'IN_STOCK' && p.stockStatus === 'OUT_OF_STOCK') {
        return false;
      }

      return true;
    });

    let autoExpanded = false;

    // Step 2: Intelligent Fallback: If user searched something and got 0 results because of selectedCategory,
    // automatically search across all categories so they get what they are looking for!
    if (list.length === 0 && terms.length > 0 && selectedCategory !== 'All') {
      const globalMatches = products.filter((p) => {
        if (!productMatchesSearch(p, terms)) return false;
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
        if (p.price < priceRange.min || p.price > priceRange.max) return false;
        if (selectedStockFilter === 'IN_STOCK' && p.stockStatus === 'OUT_OF_STOCK') return false;
        return true;
      });

      if (globalMatches.length > 0) {
        list = globalMatches;
        autoExpanded = true;
      }
    }

    // Step 3: Sort
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    return { filteredProducts: sorted, autoExpandedCategory: autoExpanded };
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedPriceRangeIndex, selectedStockFilter, sortBy]);

  const defaultStore: StoreInfo = storeInfo || {
    name: "Mayur Sports",
    tagline: "Your Premier Destination for Authentic Sporting Goods & Equipment",
    phone: "+91 98195 88573",
    whatsapp: "919819588573",
    address: "Shop No 4, Navketan Building, M D, S Marg, below Hotel Vaishali, opp. CANARA BANK - MUMBAI CHEMBUR MAIN, Chembur",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400071",
    openingHours: "Mon - Sat: 9:30 AM to 9:30 PM | Sun: 10:00 AM to 6:00 PM",
    announcement: "🔥 Special Tournament Season: Flat 20% to 35% OFF on Cricket, Badminton, Football & Swimming Gear!",
  };

  const whatsappInquiryUrl = `https://wa.me/${defaultStore.whatsapp}?text=${encodeURIComponent(
    "Hello Mayur Sports Chembur! I am interested in checking available sports gear and prices at your store."
  )}`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${defaultStore.name}, ${defaultStore.address}, ${defaultStore.city} ${defaultStore.pincode}`
  )}`;

  const hasActiveFilters = searchQuery.trim() !== '' || 
    selectedCategory !== 'All' || 
    selectedBrand !== 'All' || 
    selectedStockFilter !== 'ALL' || 
    selectedPriceRangeIndex !== 0;

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSelectedStockFilter('ALL');
    setSelectedPriceRangeIndex(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar storeInfo={defaultStore} />

      {/* Hero Section with Athletic Red & Royal Blue Aesthetics */}
      <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white pt-12 pb-16 sm:pb-24 overflow-hidden border-b border-blue-900/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-red-600/15 border border-red-500/40 text-red-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Chembur, Mumbai • Live In-Store Catalog & Pricing</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Gear Up for Victory with <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-blue-400">Mayur Sports</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Explore real-time in-store prices and availability for <strong>Nivia footballs & studs, Speedo swimming gear, Cosco skates, SS English Willow cricket bats, and Yonex badminton rackets</strong>. Reserve with 1-click on WhatsApp for immediate pickup at our Chembur store!
              </p>

              {/* Quick Action CTAs */}
              <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Available Gear</span>
                </a>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/30 font-bold text-sm px-6 py-3.5 rounded-xl backdrop-blur-sm transition-all hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-white" />
                  <span>Message on WhatsApp</span>
                </a>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-bold text-xs px-4 py-3.5 rounded-xl transition-colors"
                >
                  <Navigation className="w-4 h-4 text-red-400" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>

            {/* Right Highlights Cards */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md hover:border-red-500/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-red-500">Nivia</div>
                <div className="text-xs font-bold text-slate-200 mt-1">Official Dealer</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Balls, Studs, Guards</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md hover:border-blue-500/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-blue-400">Swim & Skate</div>
                <div className="text-xs font-bold text-slate-200 mt-1">Full Equipment</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Goggles, Caps, Skates</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md hover:border-red-500/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-red-400">Direct Rates</div>
                <div className="text-xs font-bold text-slate-200 mt-1">Best Shop Pricing</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Discounts up to 35%</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md hover:border-blue-500/50 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-blue-400">Instant Hold</div>
                <div className="text-xs font-bold text-slate-200 mt-1">WhatsApp Hold</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Chembur Store Pickup</div>
              </div>
            </div>
          </div>

          {/* Quick Category Icons Strip */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
            {[
              { label: 'Cricket', icon: '🏏' },
              { label: 'Badminton', icon: '🏸' },
              { label: 'Football', icon: '⚽' },
              { label: 'Swimming', icon: '🏊' },
              { label: 'Skating', icon: '🛼' },
              { label: 'Fitness & Gym', icon: '🏋️' },
              { label: 'Tennis & TT', icon: '🏓' },
              { label: 'Shoes & Wear', icon: '👟' },
              { label: 'Accessories', icon: '🎒' },
            ].map((cat) => (
              <button
                key={cat.label}
                onClick={() => {
                  setSelectedCategory(cat.label as Category);
                  const el = document.getElementById('catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedCategory === cat.label
                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/40 scale-105 border border-blue-400'
                    : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-[11px] truncate max-w-[80px]">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Search & Comprehensive Filters Panel */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
          {/* Row 1: Search & Controls */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input with instant clear */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              <input
                type="text"
                placeholder="Search football, nivia, bat, skates, goggles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm text-slate-900 placeholder-slate-400 transition-all bg-slate-50/70 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Brand Filter & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              {/* Brand select */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Latest Arrivals</option>
                </select>
              </div>

              {/* In Stock Only Toggle */}
              <button
                type="button"
                onClick={() => setSelectedStockFilter(selectedStockFilter === 'ALL' ? 'IN_STOCK' : 'ALL')}
                className={`text-xs font-bold px-3 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                  selectedStockFilter === 'IN_STOCK'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${selectedStockFilter === 'IN_STOCK' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>In Stock Only</span>
              </button>
            </div>
          </div>

          {/* Row 2: Category Tabs Scroll */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Quick Budget / Price Range Filters */}
          <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Budget:</span>
            {PRICE_RANGES.map((range, idx) => (
              <button
                key={range.label}
                onClick={() => setSelectedPriceRangeIndex(idx)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedPriceRangeIndex === idx
                    ? 'bg-red-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Active Filter Chips Bar */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Active filters:</span>

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-bold">
                  <span>Search: "{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-600">✕</button>
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-bold">
                  <span>Category: {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('All')} className="hover:text-red-600">✕</button>
                </span>
              )}

              {selectedBrand !== 'All' && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-bold">
                  <span>Brand: {selectedBrand}</span>
                  <button onClick={() => setSelectedBrand('All')} className="hover:text-red-600">✕</button>
                </span>
              )}

              {selectedPriceRangeIndex !== 0 && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 font-bold">
                  <span>Price: {PRICE_RANGES[selectedPriceRangeIndex].label}</span>
                  <button onClick={() => setSelectedPriceRangeIndex(0)} className="hover:text-red-600">✕</button>
                </span>
              )}

              {selectedStockFilter === 'IN_STOCK' && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-bold">
                  <span>In Stock Only</span>
                  <button onClick={() => setSelectedStockFilter('ALL')} className="hover:text-red-600">✕</button>
                </span>
              )}

              <button
                onClick={resetAllFilters}
                className="text-xs font-bold text-red-600 hover:text-red-700 ml-auto underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Intelligent Auto-Expand Category Notice */}
        {autoExpandedCategory && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900 font-medium">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                No items matched "{searchQuery}" inside <strong>{selectedCategory}</strong>, so we searched across <strong>All Sports</strong> for you!
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory('All')}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold shrink-0 hover:bg-blue-700"
            >
              Switch to All Sports
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {searchQuery.trim() 
                ? `Results for "${searchQuery}"` 
                : selectedCategory === 'All' 
                  ? 'All In-Shop Sporting Goods' 
                  : selectedCategory}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items available at Mayur Sports (Chembur)
            </p>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl border border-blue-200 transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading live inventory from Mayur Sports Chembur...</p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                storeInfo={defaultStore}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Empty Search / Filter State with Smart Suggestions */}
        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              No exact match for "{searchQuery || 'selected filters'}"
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We might have this product in our Chembur store warehouse or stockroom! You can ask us directly on WhatsApp or try resetting your filters.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={resetAllFilters}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow"
              >
                Clear Search & Filters
              </button>
              <a
                href={`https://wa.me/${defaultStore.whatsapp}?text=${encodeURIComponent(
                  `Hello Mayur Sports Chembur, do you have "${searchQuery || 'sports equipment'}" in stock right now?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Ask Store on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Chembur Store Location & Landmark Card with Red & Blue Gradients */}
        <section className="mt-16 bg-gradient-to-br from-slate-950 via-blue-950 to-red-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-blue-900/40">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300 bg-red-950/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-red-800">
                <MapPin className="w-3.5 h-3.5 text-red-400" /> Chembur Store Location
              </span>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Visit Mayur Sports in Chembur, Mumbai
              </h3>

              <div className="text-sm text-slate-300 space-y-2 leading-relaxed">
                <p>
                  📍 <strong className="text-white">Shop No 4, Navketan Building, M D, S Marg, below Hotel Vaishali, opp. CANARA BANK - MUMBAI CHEMBUR MAIN, Chembur, Mumbai, Maharashtra 400071</strong>
                </p>
                <p className="text-xs text-slate-400">
                  ⏱ <strong>Store Hours:</strong> {defaultStore.openingHours}
                </p>
                <p className="text-xs text-slate-400">
                  ⚡ <strong>In-Store Services:</strong> Computerized badminton racket restringing, cricket bat knocking & oiling, grip replacements, and trial fittings for skates & swimming goggles.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap gap-3">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>

                <a
                  href={`tel:${defaultStore.phone}`}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-100 shadow transition-colors"
                >
                  <Phone className="w-4 h-4 text-red-600" />
                  <span>Call Store: {defaultStore.phone}</span>
                </a>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30 font-bold text-xs px-5 py-3 rounded-xl backdrop-blur-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-white" />
                  <span>WhatsApp Reservation</span>
                </a>
              </div>
            </div>

            {/* Landmark Quick Highlight Box */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Prominent Landmarks</h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Below Hotel Vaishali</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span><strong>Opposite Canara Bank</strong> (Chembur Main Branch)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Navketan Building, M D, S Marg</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>Easy parking & close to Chembur Station</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          storeInfo={defaultStore}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Footer storeInfo={defaultStore} />
    </div>
  );
}
