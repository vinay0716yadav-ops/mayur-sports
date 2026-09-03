'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, MessageCircle, Phone, ShieldCheck, Lock, Menu, X, MapPin, Sparkles } from 'lucide-react';
import { StoreInfo } from '@/lib/types';

interface NavbarProps {
  storeInfo: StoreInfo;
}

export const Navbar: React.FC<NavbarProps> = ({ storeInfo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(
    `Hello Mayur Sports (Chembur)! I am visiting your website and would like to inquire about sports gear availability.`
  )}`;

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Top Announcement Bar - Dynamic Red & Navy Banner */}
      {storeInfo.announcement && (
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-red-950 text-slate-100 text-xs py-2 px-4 text-center font-medium border-b border-red-500/20 shadow-inner flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-red-400 shrink-0 animate-pulse" />
          <span className="font-semibold tracking-wide text-white">{storeInfo.announcement}</span>
        </div>
      )}

      {/* Main Nav */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo with Red & Blue Athletic Flame */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-105 transition-all duration-300">
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 group-hover:text-red-600 transition-colors">
                  MAYUR <span className="text-red-600">SPORTS</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-blue-800 uppercase tracking-wider -mt-1">
                  Chembur, Mumbai • Authentic Sports Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation & Actions */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-100">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="max-w-[200px] truncate font-bold text-slate-800" title={`${storeInfo.address}, Chembur, Mumbai`}>
                  Chembur, Mumbai
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-100">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-700">Nivia • Yonex • SS • Speedo</span>
              </div>

              {/* Call Store */}
              <a
                href={`tel:${storeInfo.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>{storeInfo.phone}</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-black px-4 py-2.5 rounded-xl shadow-md shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Order</span>
              </a>

              {/* Admin Portal Link */}
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-blue-700 text-xs font-bold p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title="Admin Control Panel"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 md:hidden">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-sm"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="text-xs text-slate-600 font-medium">
              📍 <strong className="text-slate-900">Address:</strong> {storeInfo.address}, Chembur, Mumbai - 400071
            </div>
            <div className="text-xs text-slate-600 font-medium">
              ⏱ <strong className="text-slate-900">Hours:</strong> {storeInfo.openingHours}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${storeInfo.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-50"
              >
                <Phone className="w-4 h-4 text-red-600" />
                <span>Call Store: {storeInfo.phone}</span>
              </a>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-950 text-white font-bold text-xs hover:bg-blue-900"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Shop Admin Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
