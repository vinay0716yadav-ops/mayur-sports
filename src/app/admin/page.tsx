'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, StoreInfo, Category, StockStatus } from '@/lib/types';
import {
  Flame,
  Plus,
  Edit2,
  Trash2,
  Search,
  LogOut,
  ExternalLink,
  PackageCheck,
  AlertTriangle,
  XCircle,
  IndianRupee,
  Megaphone,
  Check,
  X,
  Sparkles,
  Layers,
  Camera,
  Image as ImageIcon,
  Upload,
  Link2,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const CATEGORIES: Category[] = [
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategory, setAdminCategory] = useState<'All' | Category>('All');

  // Announcement edit state
  const [announcementText, setAnnouncementText] = useState('');
  const [updatingAnnouncement, setUpdatingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Image upload states
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [imageSizeNote, setImageSizeNote] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cricket' as Category,
    brand: '',
    price: '',
    mrp: '',
    stockStatus: 'IN_STOCK' as StockStatus,
    stockCount: '10',
    description: '',
    features: '',
    imageUrl: '',
    badge: '',
    featured: false,
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Auth verification
  useEffect(() => {
    const savedToken = localStorage.getItem('mayur_admin_token');
    if (!savedToken) {
      router.push('/admin/login');
    } else {
      setToken(savedToken);
      setAuthorized(true);
    }
  }, [router]);

  // Load products with dual-sync
  const loadData = async () => {
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

      // Check local storage for custom additions
      let merged = [...apiProducts];
      if (typeof window !== 'undefined') {
        try {
          const localSaved = localStorage.getItem('mayur_custom_products');
          if (localSaved) {
            const localList: Product[] = JSON.parse(localSaved);
            if (Array.isArray(localList) && localList.length > 0) {
              const map = new Map(apiProducts.map(p => [p.id, p]));
              localList.forEach(lp => map.set(lp.id, lp));
              merged = Array.from(map.values());
            }
          }
        } catch (e) {}
      }

      setProducts(merged);

      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setStoreInfo(storeData.storeInfo);
        setAnnouncementText(storeData.storeInfo.announcement || '');
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized]);

  // Client-side image compression: converts any photo to a lightweight ~50KB base64 DataURL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP, etc.)');
      return;
    }

    setIsCompressingImage(true);
    setImageSizeNote('Compressing photo...');

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        setIsCompressingImage(false);
        return;
      }

      // Attempt high quality Canvas compression
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_DIMENSION = 800;
            let width = img.width;
            let height = img.height;

            if (width > height && width > MAX_DIMENSION) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else if (height > MAX_DIMENSION) {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.82);
              const approxKb = Math.round((compressed.length * 3) / 4 / 1024);
              setFormData(prev => ({ ...prev, imageUrl: compressed }));
              setImageSizeNote(`Optimized (${approxKb} KB)`);
            } else {
              setFormData(prev => ({ ...prev, imageUrl: rawDataUrl }));
              setImageSizeNote('Ready');
            }
          } catch {
            setFormData(prev => ({ ...prev, imageUrl: rawDataUrl }));
            setImageSizeNote('Ready');
          } finally {
            setIsCompressingImage(false);
          }
        };

        img.onerror = () => {
          // Fallback if image failed canvas decode
          setFormData(prev => ({ ...prev, imageUrl: rawDataUrl }));
          setImageSizeNote('Ready');
          setIsCompressingImage(false);
        };

        img.src = rawDataUrl;
      } catch {
        setFormData(prev => ({ ...prev, imageUrl: rawDataUrl }));
        setImageSizeNote('Ready');
        setIsCompressingImage(false);
      }
    };

    reader.onerror = () => {
      setIsCompressingImage(false);
      alert('Could not read the selected image.');
    };
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Always reset input value so re-selecting same file fires onChange!
    e.target.value = '';
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('mayur_admin_token');
    router.push('/admin/login');
  };

  // Update Announcement
  const handleSaveAnnouncement = async () => {
    if (!token) return;
    try {
      setUpdatingAnnouncement(true);
      const res = await fetch('/api/store', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ announcement: announcementText }),
      });

      if (res.ok) {
        setAnnouncementSuccess(true);
        setTimeout(() => setAnnouncementSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingAnnouncement(false);
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      category: 'Cricket',
      brand: '',
      price: '',
      mrp: '',
      stockStatus: 'IN_STOCK',
      stockCount: '10',
      description: '',
      features: '',
      imageUrl: '',
      badge: '',
      featured: false,
    });
    setImageSizeNote('');
    setShowUrlInput(false);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: String(product.price),
      mrp: String(product.mrp),
      stockStatus: product.stockStatus,
      stockCount: String(product.stockCount || 0),
      description: product.description,
      features: product.features ? product.features.join(', ') : '',
      imageUrl: product.imageUrl,
      badge: product.badge || '',
      featured: Boolean(product.featured),
    });
    setImageSizeNote('Current image');
    setShowUrlInput(false);
  };

  // Helper to persist custom product changes to localStorage
  const syncLocalProductStorage = (updatedList: Product[]) => {
    try {
      localStorage.setItem('mayur_custom_products', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to sync localStorage:', e);
    }
  };

  // Submit Add or Edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.name.trim() || !formData.price) {
      alert('Please fill in product name and selling price.');
      return;
    }

    try {
      setFormSubmitting(true);

      const featuresArray = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        brand: formData.brand.trim() || 'Mayur Sports',
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : Number(formData.price),
        stockStatus: formData.stockStatus,
        stockCount: Number(formData.stockCount || 0),
        description: formData.description.trim() || `${formData.name} - Quality athletic gear available at Mayur Sports Chembur.`,
        features: featuresArray,
        imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
        badge: formData.badge.trim(),
        featured: formData.featured,
      };

      if (editingProduct) {
        // Edit PUT
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const savedProduct = res.ok 
          ? (await res.json()).product 
          : { ...editingProduct, ...payload, updatedAt: new Date().toISOString() };

        setProducts((prev) => {
          const nextList = prev.map((p) => (p.id === editingProduct.id ? savedProduct : p));
          syncLocalProductStorage(nextList);
          return nextList;
        });

        setEditingProduct(null);
        showToast('Product updated successfully!');
      } else {
        // Add POST
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        let newProd: Product;
        if (res.ok) {
          const data = await res.json();
          newProd = data.product;
        } else {
          // Client fallback in case of serverless file error
          newProd = {
            ...payload,
            id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        setProducts((prev) => {
          const nextList = [newProd, ...prev];
          syncLocalProductStorage(nextList);
          return nextList;
        });

        setIsAddModalOpen(false);
        showToast('New product added to catalog!');
      }
    } catch (err) {
      console.error(err);
      alert('Network or server error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick Stock Status Toggle
  const handleQuickStockToggle = async (product: Product) => {
    if (!token) return;
    let nextStatus: StockStatus = 'IN_STOCK';
    if (product.stockStatus === 'IN_STOCK') nextStatus = 'LOW_STOCK';
    else if (product.stockStatus === 'LOW_STOCK') nextStatus = 'OUT_OF_STOCK';
    else if (product.stockStatus === 'OUT_OF_STOCK') nextStatus = 'IN_STOCK';

    try {
      fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ stockStatus: nextStatus }),
      }).catch(() => {});

      setProducts((prev) => {
        const nextList = prev.map((p) => (p.id === product.id ? { ...p, stockStatus: nextStatus } : p));
        syncLocalProductStorage(nextList);
        return nextList;
      });

      showToast(`Stock updated to ${nextStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deletingProductId || !token) return;

    try {
      fetch(`/api/products/${deletingProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }).catch(() => {});

      setProducts((prev) => {
        const nextList = prev.filter((p) => p.id !== deletingProductId);
        syncLocalProductStorage(nextList);
        return nextList;
      });

      setDeletingProductId(null);
      showToast('Product removed from catalog');
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Stats
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stockStatus === 'IN_STOCK').length;
    const lowStock = products.filter((p) => p.stockStatus === 'LOW_STOCK').length;
    const outOfStock = products.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length;
    const totalInventoryValue = products.reduce((acc, p) => acc + p.price * (p.stockCount || 1), 0);

    return { total, inStock, lowStock, outOfStock, totalInventoryValue };
  }, [products]);

  // Smart multi-word search in Admin
  const filteredProducts = useMemo(() => {
    const terms = adminSearch.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return products.filter((p) => {
      if (terms.length > 0) {
        const searchable = `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase();
        const matchesAll = terms.every(t => searchable.includes(t));
        if (!matchesAll) return false;
      }
      if (adminCategory !== 'All' && p.category !== adminCategory) {
        return false;
      }
      return true;
    });
  }, [products, adminSearch, adminCategory]);

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">MAYUR SPORTS</span>
                <span className="bg-red-600/20 text-red-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-500/30 uppercase">
                  Admin Panel
                </span>
              </div>
              <span className="text-[11px] text-blue-300 font-medium">Chembur Store • Live Inventory & Price Control</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-900/60 hover:bg-blue-800 text-blue-100 px-3.5 py-2 rounded-xl transition-colors border border-blue-700/50"
            >
              <span>View Customer Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3.5 py-2 rounded-xl border border-red-500/30 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Items</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Products in catalog</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span>In Stock</span>
              <PackageCheck className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">
              {stats.inStock}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Ready for pickup</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span>Limited Stock</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              {stats.lowStock}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Re-order soon</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-red-400 text-xs font-bold uppercase tracking-wider">
              <span>Out of Stock</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-red-400 mt-2">
              {stats.outOfStock}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Unavailable</div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-red-400 text-xs font-bold uppercase tracking-wider">
              <span>Inventory Value</span>
              <IndianRupee className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              ₹{(stats.totalInventoryValue / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Estimated total stock</div>
          </div>
        </div>

        {/* Store Announcement Banner Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Store Announcement Banner</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Displays at the very top of the live customer website in Chembur.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 md:max-w-xl">
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g., 25% discount on Cricket & Football equipment!"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={updatingAnnouncement}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-red-600/20"
              >
                {announcementSuccess ? <Check className="w-4 h-4" /> : null}
                <span>{updatingAnnouncement ? 'Saving...' : announcementSuccess ? 'Saved!' : 'Update Banner'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Management Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Products Management</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Add new items with camera or gallery photos, update prices, and control stock availability
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search products in admin..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              <button
                onClick={() => setAdminCategory('All')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  adminCategory === 'All' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({products.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAdminCategory(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    adminCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table of Products */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category / Brand</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Stock Status (Click to toggle)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Image & Title */}
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="max-w-xs">
                        <div className="font-bold text-white line-clamp-1">{product.name}</div>
                        {product.badge && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td className="p-4">
                      <div className="font-semibold text-blue-300">{product.category}</div>
                      <div className="text-[11px] text-slate-500">{product.brand}</div>
                    </td>

                    {/* Price & MRP */}
                    <td className="p-4">
                      <div className="font-black text-white text-sm">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                      {product.mrp > product.price && (
                        <div className="text-[11px] text-slate-500 line-through">
                          MRP ₹{product.mrp.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>

                    {/* Stock status with quick toggle button */}
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleQuickStockToggle(product)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold"
                        title="Click to cycle: In Stock -> Low Stock -> Out of Stock"
                      >
                        {product.stockStatus === 'IN_STOCK' && (
                          <span className="text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> In Stock
                          </span>
                        )}
                        {product.stockStatus === 'LOW_STOCK' && (
                          <span className="text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" /> Limited Stock
                          </span>
                        )}
                        {product.stockStatus === 'OUT_OF_STOCK' && (
                          <span className="text-red-400 bg-red-950/60 border border-red-800/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-blue-900/40 text-slate-300 hover:text-blue-400 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingProductId(product.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Product Modal with Robust Camera & Gallery Upload */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <span>{editingProduct ? 'Edit Product Details' : 'Add New Product to Shop'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Product Photo Upload Section (Camera & Gallery directly inside the card) */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`p-4 sm:p-5 rounded-2xl bg-slate-950 border transition-all ${
                  dragOver ? 'border-red-500 bg-red-950/20' : 'border-slate-800'
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Product Photo (Camera or Gallery) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Link2 className="w-3 h-3" />
                    <span>{showUrlInput ? 'Hide link field' : 'Use web link instead'}</span>
                  </button>
                </div>

                {/* Live Image Preview or Direct Upload Triggers */}
                {formData.imageUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <div className="w-28 h-28 rounded-2xl bg-slate-950 border border-slate-700 overflow-hidden shrink-0 relative">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="text-xs text-blue-400 font-bold flex items-center justify-center sm:justify-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Photo Ready {imageSizeNote ? `• ${imageSizeNote}` : ''}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        This photo will display on your customer storefront immediately.
                      </p>
                      
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                        {/* Native inputs for re-selection */}
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                          <Camera className="w-3.5 h-3.5 text-red-400" />
                          <span>Retake with Camera</span>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileInputChange}
                          />
                        </label>

                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>Choose from Gallery</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileInputChange}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, imageUrl: '' }));
                            setImageSizeNote('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Direct Camera Button (Opens phone camera on mobile) */}
                    <label className="cursor-pointer p-4 rounded-xl border-2 border-dashed border-red-500/50 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-300 flex flex-col items-center justify-center gap-2 transition-all group">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-black text-white">📸 Take Photo (Camera)</div>
                        <div className="text-[10px] text-slate-400">Click to snap photo inside shop</div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                    </label>

                    {/* Direct Gallery / File Button (Opens photo library on mobile & files on PC) */}
                    <label className="cursor-pointer p-4 rounded-xl border-2 border-dashed border-blue-500/50 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-300 flex flex-col items-center justify-center gap-2 transition-all group">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-black text-white">🖼️ Upload from Gallery / Files</div>
                        <div className="text-[10px] text-slate-400">Choose from phone library or computer</div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                    </label>
                  </div>
                )}

                {/* Optional Web URL input */}
                {showUrlInput && (
                  <div className="pt-2 border-t border-slate-800">
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Or Paste Image URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {isCompressingImage && (
                  <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 animate-pulse pt-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing and optimizing photo for instant loading...</span>
                  </div>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nivia Storm Football Size 5"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Sport Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Nivia, Speedo, Yonex, Cosco, SS"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price & MRP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g., 899"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g., 1250 (for discount display)"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Stock Status & Stock Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Stock Availability
                  </label>
                  <select
                    value={formData.stockStatus}
                    onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value as StockStatus })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Limited Stock (Few Left)</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Badge & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Special Badge (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller, Match Grade, Hot Deal"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600 focus:ring-blue-500 bg-slate-950 border-slate-800"
                    />
                    <span className="text-xs font-bold text-slate-300">Feature on Homepage</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Material, feel, size, match standard, recommendations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Features Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Specifications / Features (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Size 5 Match Ball, 32-Panel, High Air Retention Butyl Bladder"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || isCompressingImage}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-white">Delete this product?</h4>
              <p className="text-xs text-slate-400 mt-1">
                This item will be permanently removed from Mayur Sports public catalog.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="py-2.5 px-4 rounded-xl border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
