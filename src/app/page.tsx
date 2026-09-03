'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Product, StoreInfo, Category, StockStatus } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  RefreshCw,
  ShoppingBag,
  ArrowUpDown
} from 'lucide-react';

const CATEGORIES: ('All' | Category)[] = [
  'All',
  'Cricket',
  'Badminton',
  'Football',
  'Fitness & Gym',
  'Shoes & Wear',
  'Accessories',
  'Tennis & TT',
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');
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

  // Extract all unique brands for filtering
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return ['All', ...Array.from(brands)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search filter
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

        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Brand filter
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) {
          return false;
        }

        // Stock filter
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
        // Default: featured first, then in-stock
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedStockFilter, sortBy]);

  const defaultStore: StoreInfo = storeInfo || {
    name: "Mayur Sports",
    tagline: "Authentic Sporting Goods & Tournament Gear",
    phone: "+91 98220 12345",
    whatsapp: "919822012345",
    address: "Shop No 4, Navketan Building, M D, S Marg, below Hotel Vaishali, opp. CANARA BANK - MUMBAI CHEMBUR MAIN, Chembur",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400071",
    openingHours: "Mon - Sat: 9:30 AM to 9:30 PM",
    announcement: "Special tournament season discount on all sports gear!",
  };

  const whatsappInquiryUrl = `https://wa.me/${defaultStore.whatsapp}?text=${encodeURIComponent(
    "Hello Mayur Sports! I would like to check prices and availability for sports equipment in your shop."
  )}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar storeInfo={defaultStore} />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white pt-12 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live In-Store Inventory & Prices</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Gear Up Like A Champion with <span className="text-emerald-400">Mayur Sports</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Browse our real-time stock of premium Cricket bats, Yonex badminton rackets, footballs, fitness weights, and genuine sports equipment. Check exact shop prices and reserve instantly via WhatsApp!
              </p>

              <div className="pt-2 flex flex-wrap gap-3 justify-center lg:justify-start">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Available Gear</span>
                </a>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm px-6 py-3.5 rounded-xl backdrop-blur-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-emerald-400" />
                  <span>Chat With Shop Expert</span>
                </a>
              </div>
            </div>

            {/* Right Highlights Cards */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Genuine Brands</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Yonex, SS, SG, Cosco</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">Best</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Direct Shop Rates</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Special Discounts</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">Instant</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">WhatsApp Hold</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Zero booking hassle</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center backdrop-blur-md">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">Services</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">Bat & Racket Care</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Knocking & Stringing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Search & Filters Controls */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm mb-8 space-y-4">
          {/* Row 1: Search Input & Fast Sort */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search bats, rackets, footballs, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-slate-800 placeholder-slate-400 transition-all"
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

            {/* Filter pills & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              {/* Brand select */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Brand:</span>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
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
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Latest Arrivals</option>
                </select>
              </div>

              {/* In Stock Only Checkbox Button */}
              <button
                type="button"
                onClick={() => setSelectedStockFilter(selectedStockFilter === 'ALL' ? 'IN_STOCK' : 'ALL')}
                className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                  selectedStockFilter === 'IN_STOCK'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${selectedStockFilter === 'IN_STOCK' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>In Stock Only</span>
              </button>
            </div>
          </div>

          {/* Row 2: Category Scroll Pills */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedCategory === 'All' ? 'All Sporting Equipment' : selectedCategory}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> items available at Mayur Sports
            </p>
          </div>

          {(searchQuery || selectedCategory !== 'All' || selectedBrand !== 'All' || selectedStockFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedBrand('All');
                setSelectedStockFilter('ALL');
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading live inventory from Mayur Sports...</p>
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
            <h3 className="text-lg font-bold text-slate-900">No items match your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              We couldn't find any products matching your current filters. Try changing your search query or reset the filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedBrand('All');
                setSelectedStockFilter('ALL');
              }}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              Show All Products
            </button>
          </div>
        )}

        {/* Shop Visit & Assistance Banner */}
        <section className="mt-16 bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" /> Visit Our Chembur, Mumbai Store
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Looking for something specific or custom stringing?
            </h3>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Drop by our shop at <strong className="text-white">{defaultStore.address}, {defaultStore.city}</strong>. We provide professional bat knocking, oiling, grip replacement, and electronic racket restringing on the spot.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`tel:${defaultStore.phone}`}
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-100 shadow transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Call {defaultStore.phone}</span>
              </a>

              <a
                href={whatsappInquiryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Message on WhatsApp</span>
              </a>
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
