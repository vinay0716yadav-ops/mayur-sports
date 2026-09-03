'use client';

import React from 'react';
import { Product, StoreInfo } from '@/lib/types';
import { X, MessageCircle, Phone, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Truck, Sparkles } from 'lucide-react';

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
    `Hello Mayur Sports! I saw *${product.name}* on your website for ₹${product.price.toLocaleString('en-IN')}.\n\nBrand: ${product.brand}\nCategory: ${product.category}\n\nCould you please confirm if it's currently available in your shop? I'd like to visit or reserve it.`
  );

  const whatsappUrl = `https://wa.me/${storeInfo.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 bg-slate-50 relative flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100">
          <div className="w-full h-64 sm:h-80 md:h-full relative flex items-center justify-center overflow-hidden rounded-2xl">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain rounded-xl shadow-sm"
            />
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.badge && (
              <span className="text-xs font-bold text-white bg-slate-900 px-3 py-1 rounded-lg shadow-sm">
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-black text-white bg-rose-500 px-2.5 py-0.5 rounded-md shadow-sm">
                SAVE ₹{savings.toLocaleString('en-IN')} ({discount}%)
              </span>
            )}
          </div>
        </div>

        {/* Right: Details & Action */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header info */}
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-slate-500">{product.brand}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500">Shop Special Price</div>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      MRP ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock status indicator */}
              <div>
                {product.stockStatus === 'IN_STOCK' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    In Stock
                  </span>
                )}
                {product.stockStatus === 'LOW_STOCK' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Low Stock
                  </span>
                )}
                {product.stockStatus === 'OUT_OF_STOCK' && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100/70 px-3 py-1 rounded-full">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Key Features & Specs */}
            {product.features && product.features.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Highlights</h4>
                <ul className="space-y-1.5">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Store guarantee info */}
            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Genuine Brand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Instant In-Store Pickup</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Inquire / Reserve on WhatsApp</span>
            </a>

            <a
              href={`tel:${storeInfo.phone}`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>Call Shop: {storeInfo.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
