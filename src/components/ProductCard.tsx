'use client';

import React from 'react';
import { Product, StoreInfo } from '@/lib/types';
import { MessageCircle, Eye, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  storeInfo: StoreInfo;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, storeInfo, onSelect }) => {
  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const savings = product.mrp > product.price ? product.mrp - product.price : 0;

  const whatsappMessage = encodeURIComponent(
    `Hello Mayur Sports (Chembur), I am interested in:\n\n*${product.name}*\nPrice: ₹${product.price.toLocaleString('en-IN')}\nCategory: ${product.category}\nBrand: ${product.brand}\n\nIs this available in your Chembur shop right now?`
  );

  const whatsappUrl = `https://wa.me/${storeInfo.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-emerald-500/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top badges */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 items-start">
        {discount > 0 && (
          <span className="text-[11px] font-black text-white bg-rose-600 px-2.5 py-0.5 rounded-full shadow-md shadow-rose-600/30">
            {discount}% OFF
          </span>
        )}
        {product.badge && (
          <span className="text-[10px] font-extrabold text-white bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-white/10">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            {product.badge}
          </span>
        )}
      </div>

      {/* Stock status indicator on top right */}
      <div className="absolute top-3.5 right-3.5 z-10">
        {product.stockStatus === 'IN_STOCK' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-white/95 backdrop-blur-md border border-emerald-300 px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            In Stock
          </span>
        )}
        {product.stockStatus === 'LOW_STOCK' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-white/95 backdrop-blur-md border border-amber-300 px-2.5 py-1 rounded-full shadow-sm">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Limited Stock
          </span>
        )}
        {product.stockStatus === 'OUT_OF_STOCK' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-white/95 backdrop-blur-md border border-rose-300 px-2.5 py-1 rounded-full shadow-sm">
            <XCircle className="w-3 h-3 text-rose-600" />
            Out of Stock
          </span>
        )}
      </div>

      {/* Image Container with zoom */}
      <div 
        onClick={() => onSelect(product)}
        className="cursor-pointer relative w-full h-56 bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        {/* Quick View Hover Hint */}
        <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-950/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl border border-white/20">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category tags */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg text-[11px] border border-emerald-200/60">
              {product.category}
            </span>
            <span className="font-bold text-slate-500 uppercase text-[11px] tracking-wider">
              {product.brand}
            </span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onSelect(product)}
            className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
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
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3.5">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Store Price
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.price && (
                  <span className="text-xs font-bold text-slate-400 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {savings > 0 && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Save ₹{savings.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Specs</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
