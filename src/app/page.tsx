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
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Nivia footballs, Speedo goggles, skates, bats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 placeholder-slate-400 transition-all bg-slate-50/50"
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
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Ask on WhatsApp</span>
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
