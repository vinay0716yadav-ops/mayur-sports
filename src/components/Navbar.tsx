'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, MessageCircle, Phone, ShieldCheck, Lock, Menu, X, MapPin } from 'lucide-react';
import { StoreInfo } from '@/lib/types';

interface NavbarProps {
  storeInfo: StoreInfo;
}

export const Navbar: React.FC<NavbarProps> = ({ storeInfo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(
    `Hello Mayur Sports! I am visiting your website and would like to inquire about sports gear availability.`
  )}`;

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* Top Announcement Bar */}
      {storeInfo.announcement && (
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
          <span>{storeInfo.announcement}</span>
        </div>
      )}

      {/* Main Nav */}
      <div className="glass-nav border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-current" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  MAYUR <span className="text-emerald-600">SPORTS</span>
                </span>
                <span className="hidden sm:block text-[11px] font-semibold text-slate-500 uppercase tracking-widest -mt-1">
                  100% Authentic Sports Gear
                </span>
              </div>
            </Link>

            {/* Desktop Navigation & Actions */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{storeInfo.city}, {storeInfo.state}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Authorized Dealer</span>
              </div>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp Order</span>
              </a>

              {/* Admin Portal Link */}
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                title="Admin Control Panel"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-3 md:hidden">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center p-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-sm"
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
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
            <div className="text-xs text-slate-500 font-medium">
              📍 {storeInfo.address}, {storeInfo.city}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              ⏱ {storeInfo.openingHours}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${storeInfo.phone}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Call Store: {storeInfo.phone}</span>
              </a>

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800"
              >
                <Lock className="w-4 h-4" />
                <span>Admin Login & Control</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
