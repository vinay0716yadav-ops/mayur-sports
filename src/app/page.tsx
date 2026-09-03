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
  Flame, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  RefreshCw,
  ShoppingBag,
  ArrowUpDown,
  Navigation,
  Waves,
  Award,
  Zap,
  Tag
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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [prodRes, storeRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/store')
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }

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
      if (p.brand) brands.add(p.brand);
    });
    return ['All', ...Array.from(brands)];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const priceRange = PRICE_RANGES[selectedPriceRangeIndex];

    return products
      .filter((p) => {
        // Search
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchBrand = p.brand.toLowerCase().includes(query);
          const matchCategory = p.category.toLowerCase().includes(query);
          const matchDescription = p.description.toLowerCase().includes(query);
          if (!matchName && !matchBrand && !matchCategory && !matchDescription) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Brand
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
          return false;
        }

        // Price Range
        if (p.price < priceRange.min || p.price > priceRange.max) {
          return false;
        }

        // Stock
        if (selectedStockFilter === 'IN_STOCK' && p.stockStatus === 'OUT_OF_STOCK') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedPriceRangeIndex, selectedStockFilter, sortBy]);

  const defaultStore: StoreInfo = storeInfo || {
    name: "Mayur Sports",
    tagline: "Your Premier Destination for Authentic Sporting Goods & Equipment",
    phone: "+91 98220 12345",
    whatsapp: "919822012345",
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar storeInfo={defaultStore} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white pt-12 pb-16 sm:pb-24 overflow-hidden border-b border-emerald-900/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="absolute -top-24 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chembur, Mumbai • Direct Shop Catalog & Pricing</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Authentic Sporting Gear at <span className="text-emerald-400">Mayur Sports</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Explore real-time in-store prices and availability for <strong>Nivia footballs, Speedo swimming goggles, Cosco skates, SS cricket bats, and Yonex badminton rackets</strong>. Reserve your gear with 1-click on WhatsApp for instant shop pickup in Chembur!
              </p>

              {/* Quick Action CTAs */}
              <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Available Equipment</span>
                </a>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-6 py-3.5 rounded-xl backdrop-blur-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-emerald-400" />
                  <span>Message on WhatsApp</span>
                </a>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-bold text-xs px-4 py-3.5 rounded-xl transition-colors"
                >
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span>Directions to Store</span>
                </a>
              </div>
            </div>

            {/* Right Highlights Cards */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">Nivia</div>
                <div className="text-xs font-bold text-slate-200 mt-1">Official Dealer</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Footballs, Studs, Guards</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-teal-400">Swim & Skate</div>
                <div className="text-xs font-bold text-slate-200 mt-1">Full Range In Stock</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Goggles, Caps, Skates</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-amber-400">Direct Rates</div>
                <div className="text-xs font-bold text-slate-200 mt-1">Best Shop Pricing</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Discounts up to 35%</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">Instant Hold</div>
                <div className="text-xs font-bold text-slate-200 mt-1">WhatsApp Reserve</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Chembur Shop Pickup</div>
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
                    ? 'bg-emerald-600 text-white font-black shadow-lg shadow-emerald-600/30'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-800'
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
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Nivia footballs, goggles, skates, bats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 placeholder-slate-400 transition-all bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
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
                  className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${selectedStockFilter === 'IN_STOCK' ? 'text-emerald-600' : 'text-slate-400'}`} />
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
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
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
                    ? 'bg-slate-900 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedCategory === 'All' ? 'All In-Shop Sporting Goods' : selectedCategory}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items available at Mayur Sports (Chembur)
            </p>
          </div>

          {(searchQuery || selectedCategory !== 'All' || selectedBrand !== 'All' || selectedStockFilter !== 'ALL' || selectedPriceRangeIndex !== 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedBrand('All');
                setSelectedStockFilter('ALL');
                setSelectedPriceRangeIndex(0);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-colors"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
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

        {/* Empty Search / Filter State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No items match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We couldn't find any products with your current search or filters. We might have it in our store warehouse! Message us directly on WhatsApp.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedBrand('All');
                  setSelectedStockFilter('ALL');
                  setSelectedPriceRangeIndex(0);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
              >
                Reset Filters
              </button>
              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>
        )}

        {/* Chembur Store Location & Landmark Card */}
        <section className="mt-16 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-emerald-900/40">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-emerald-800">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Chembur Store Location
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
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>

                <a
                  href={`tel:${defaultStore.phone}`}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-100 shadow transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Call Store: {defaultStore.phone}</span>
                </a>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs px-5 py-3 rounded-xl backdrop-blur-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-emerald-400" />
                  <span>WhatsApp Reservation</span>
                </a>
              </div>
            </div>

            {/* Landmark Quick Highlight Box */}
            <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Prominent Landmarks</h4>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Below Hotel Vaishali</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Opposite Canara Bank</strong> (Chembur Main Branch)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Navketan Building, M D, S Marg</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
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
