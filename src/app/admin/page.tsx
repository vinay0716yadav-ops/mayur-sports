'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  ExternalLink,
  PackageCheck,
  AlertTriangle,
  XCircle,
  IndianRupee,
  Megaphone,
  Check,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

const CATEGORIES: Category[] = [
  'Cricket',
  'Badminton',
  'Football',
  'Fitness & Gym',
  'Swimming',
  'Skating',
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

  // Load products & store info
  const loadData = async () => {
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
  };

  // Submit Add or Edit
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.name || !formData.price) {
      alert('Please fill in product name and price.');
      return;
    }

    try {
      setFormSubmitting(true);

      const featuresArray = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand || 'General',
        price: Number(formData.price),
        mrp: formData.mrp ? Number(formData.mrp) : Number(formData.price),
        stockStatus: formData.stockStatus,
        stockCount: Number(formData.stockCount || 0),
        description: formData.description,
        features: featuresArray,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
        badge: formData.badge,
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

        if (res.ok) {
          const data = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
          setEditingProduct(null);
          showToast('Product updated successfully!');
        } else {
          alert('Failed to update product');
        }
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

        if (res.ok) {
          const data = await res.json();
          setProducts((prev) => [data.product, ...prev]);
          setIsAddModalOpen(false);
          showToast('New product added to catalog!');
        } else {
          alert('Failed to add product');
        }
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
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ stockStatus: nextStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === product.id ? data.product : p)));
        showToast(`Stock updated to ${nextStatus.replace('_', ' ')}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deletingProductId || !token) return;

    try {
      const res = await fetch(`/api/products/${deletingProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deletingProductId));
        setDeletingProductId(null);
        showToast('Product removed from catalog');
      } else {
        alert('Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting product');
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Stats calculations
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.stockStatus === 'IN_STOCK').length;
    const lowStock = products.filter((p) => p.stockStatus === 'LOW_STOCK').length;
    const outOfStock = products.filter((p) => p.stockStatus === 'OUT_OF_STOCK').length;
    const totalInventoryValue = products.reduce((acc, p) => acc + p.price * (p.stockCount || 1), 0);

    return { total, inStock, lowStock, outOfStock, totalInventoryValue };
  }, [products]);

  // Filtered products inside admin
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (adminCategory !== 'All' && p.category !== adminCategory) {
        return false;
      }
      return true;
    });
  }, [products, adminSearch, adminCategory]);

  if (!authorized) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4" />
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">MAYUR SPORTS</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                  Admin Panel
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Live Inventory & Price Control</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition-colors border border-slate-700"
            >
              <span>View Customer Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3.5 py-2 rounded-xl border border-rose-500/30 transition-colors"
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
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              {stats.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Products in shop</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>In Stock</span>
              <PackageCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
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
            <div className="flex items-center justify-between text-rose-400 text-xs font-bold uppercase tracking-wider">
              <span>Out of Stock</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">
              {stats.outOfStock}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Unavailable</div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-teal-400 text-xs font-bold uppercase tracking-wider">
              <span>Inventory Value</span>
              <IndianRupee className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              ₹{(stats.totalInventoryValue / 1000).toFixed(1)}k
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Approx catalog stock</div>
          </div>
        </div>

        {/* Store Announcement Banner Editor */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Store Announcement Banner</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  This message is prominently displayed at the very top of the customer website.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 md:max-w-xl">
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g., 20% discount on Cricket equipment this week!"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleSaveAnnouncement}
                disabled={updatingAnnouncement}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
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
                Add new items, update prices, and change stock availability in real time
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              <button
                onClick={() => setAdminCategory('All')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  adminCategory === 'All' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({products.length})
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAdminCategory(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    adminCategory === cat ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
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
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category & Brand */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{product.category}</div>
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
                          <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> In Stock
                          </span>
                        )}
                        {product.stockStatus === 'LOW_STOCK' && (
                          <span className="text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" /> Limited Stock
                          </span>
                        )}
                        {product.stockStatus === 'OUT_OF_STOCK' && (
                          <span className="text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" /> Out of Stock
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeletingProductId(product.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
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

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>{editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., SS Master 5000 Cricket Bat"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    placeholder="e.g., SS, Yonex, SG, Nivia, Cosco"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    placeholder="e.g., 2499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g., 3499 (for discount calculation)"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Limited Stock (Few Units Left)</option>
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Image URL with preview */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Product Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or any public image URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {formData.imageUrl && (
                  <div className="mt-2 w-20 h-20 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Badge & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Special Badge (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller, Tournament Choice"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-800"
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
                  placeholder="Details about craftsmanship, material, weight, feel, and recommendations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Features Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Highlights / Specs (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., English Willow, 40mm Edges, 9-piece Cane Handle, Full Cover Included"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all"
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
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
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
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow"
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
