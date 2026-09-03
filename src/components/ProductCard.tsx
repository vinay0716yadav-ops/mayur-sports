'use client';

import React from 'react';
import { Product, StoreInfo } from '@/lib/types';
import { MessageCircle, Eye, CheckCircle2, AlertTriangle, XCircle, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  storeInfo: StoreInfo;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, storeInfo, onSelect }) => {
  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const whatsappMessage = encodeURIComponent(
    `Hi Mayur Sports, I am interested in purchasing:\n\n*${product.name}*\nPrice: ₹${product.price.toLocaleString('en-IN')}\nCategory: ${product.category}\nBrand: ${product.brand}\n\nIs this available in your shop right now?`
  );

  const whatsappUrl = `https://wa.me/${storeInfo.whatsapp}?text=${whatsappMessage}`;

  const renderStockBadge = () => {
    switch (product.stockStatus) {
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            In Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Limited Stock
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-600" />
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {product.badge && (
          <span className="text-[11px] font-bold text-white bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="text-[11px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-md shadow-sm">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Stock status badge on top right */}
      <div className="absolute top-3 right-3 z-10">
        {renderStockBadge()}
      </div>

      {/* Image Container */}
      <div 
        onClick={() => onSelect(product)}
        className="cursor-pointer relative w-full h-52 bg-slate-100 overflow-hidden flex items-center justify-center group-hover:opacity-95 transition-opacity"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <Eye className="w-3.5 h-3.5" /> View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand tags */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
              {product.category}
            </span>
            <span className="font-medium text-slate-400">
              {product.brand}
            </span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onSelect(product)}
            className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xl font-black text-slate-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs font-semibold text-slate-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Details</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Inquire</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
