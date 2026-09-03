'use client';

import React from 'react';
import { Product, StoreInfo } from '@/lib/types';
import { X, MessageCircle, Phone, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Truck, Sparkles, MapPin } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  storeInfo: StoreInfo;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, storeInfo, onClose }) => {
  if (!product) return null;

  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const savings = product.mrp > product.price ? product.mrp - product.price : 0;

  const whatsappMessage = encodeURIComponent(
    `Hello Mayur Sports (Chembur), I saw this item on your website:\n\n*${product.name}*\nBrand: ${product.brand}\nCategory: ${product.category}\nShop Price: ₹${product.price.toLocaleString('en-IN')}\n\nCould you please hold/confirm availability at your Chembur store?`
  );

  const whatsappUrl = `https://wa.me/${storeInfo.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/95 shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:scale-105 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 bg-slate-100/70 relative flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100">
          <div className="w-full h-64 sm:h-80 md:h-full relative flex items-center justify-center overflow-hidden rounded-2xl">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain rounded-xl shadow-sm"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="text-xs font-black text-white bg-red-600 px-3 py-1 rounded-full shadow-md shadow-red-600/30">
                SAVE ₹{savings.toLocaleString('en-IN')} ({discount}% OFF)
              </span>
            )}
            {product.badge && (
              <span className="text-xs font-bold text-white bg-blue-950 px-3 py-1 rounded-full shadow-sm flex items-center gap-1 border border-blue-400/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* Right: Details & Action */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header info */}
            <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-wider mb-2">
              <span className="bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">{product.category}</span>
              <span>•</span>
              <span className="text-slate-500">{product.brand}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-950 leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="mt-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-baseline justify-between">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In-Shop Special Price</div>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl font-black text-slate-950 tracking-tight">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-sm font-bold text-slate-400 line-through">
                      MRP ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock status indicator */}
              <div>
                {product.stockStatus === 'IN_STOCK' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    In Stock
                  </span>
                )}
                {product.stockStatus === 'LOW_STOCK' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Limited Stock
                  </span>
                )}
                {product.stockStatus === 'OUT_OF_STOCK' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-full">
                    <XCircle className="w-4 h-4 text-red-600" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Key Features & Specs */}
            {product.features && product.features.length > 0 && (
              <div className="mt-4">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Specifications & Highlights</h4>
                <ul className="space-y-1.5">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Store Location note */}
            <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-950 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Available for immediate pickup at: <strong>{storeInfo.address}, Chembur</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Inquire / Hold on WhatsApp</span>
            </a>

            <a
              href={`tel:${storeInfo.phone}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Call Shop: {storeInfo.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
