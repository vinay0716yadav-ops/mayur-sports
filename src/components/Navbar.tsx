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
    `Hello Mayur Sports! I am looking for sporting goods from your Chembur store and would like to check prices and availability.`
  )}`;

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* Top Announcement Bar */}
      {storeInfo.announcement && (
        <div className="bg-gradient-to-r from-slate-950 via-emerald-900 to-slate-950 text-emerald-200 text-xs py-2.5 px-4 text-center font-medium border-b border-emerald-800/40 shadow-inner flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-semibold tracking-wide text-white">{storeInfo.announcement}</span>
        </div>
      )}

      {/* Main Nav */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-all duration-300">
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  MAYUR <span className="text-emerald-600">SPORTS</span>
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider -mt-1">
                  Chembur, Mumbai • Genuine Sports Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation & Actions */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200/60">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="max-w-[200px] truncate" title={`${storeInfo.address}, Chembur, Mumbai`}>
                  Chembur, Mumbai
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/90 px-3 py-1.5 rounded-full border border-slate-200/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Nivia • Yonex • SS • Speedo</span>
              </div>

              {/* Call Store */}
              <a
                href={`tel:${storeInfo.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{storeInfo.phone}</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Order</span>
              </a>

              {/* Admin Portal Link */}
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs font-bold p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title="Admin Control Panel"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 md:hidden">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
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
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Store: {storeInfo.phone}</span>
              </a>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Shop Admin Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
