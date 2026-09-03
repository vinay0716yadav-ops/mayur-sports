import React from 'react';
import Link from 'next/link';
import { StoreInfo } from '@/lib/types';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Award, Truck, Lock } from 'lucide-react';

interface FooterProps {
  storeInfo: StoreInfo;
}

export const Footer: React.FC<FooterProps> = ({ storeInfo }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 mt-20">
      {/* Brand Trust Badges */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-red-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Genuine Brands</h4>
              <p className="text-xs text-slate-400 mt-0.5">Authorized retailer for Nivia, Yonex, SS Sunridges, Speedo & Cosco</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Expert Consultation</h4>
              <p className="text-xs text-slate-400 mt-0.5">Professional bat knocking, oiling & electronic racket restringing</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-red-500/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Instant Shop Hold & Pickup</h4>
              <p className="text-xs text-slate-400 mt-0.5">WhatsApp booking with immediate reserve at our Chembur store</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Store Bio */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-2xl font-black text-white tracking-tight">
              MAYUR <span className="text-red-500">SPORTS</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Chembur's premier sports equipment specialist. Serving athletes, academies, school champions, fitness enthusiasts, and tournament players with top-tier equipment at competitive direct-shop prices.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Cricket</span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Badminton</span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Football</span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Swimming</span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Skating</span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Gym Equipment</span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700">Table Tennis</span>
            </div>
          </div>

          {/* Col 2: Store Location & Timings */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase text-blue-400">Chembur Shop Location</h4>
            <div className="flex items-start gap-3 text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-white">Mayur Sports</span><br />
                {storeInfo.address},<br />
                {storeInfo.city}, {storeInfo.state} - {storeInfo.pincode}
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs text-slate-400 pt-1">
              <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{storeInfo.openingHours}</span>
            </div>
          </div>

          {/* Col 3: Quick Contact & Admin */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs tracking-wider uppercase text-blue-400">Contact & Inquiries</h4>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Phone className="w-4 h-4 text-red-500" />
              <a href={`tel:${storeInfo.phone}`} className="hover:text-red-400 transition-colors font-semibold">
                {storeInfo.phone}
              </a>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <MessageCircle className="w-4 h-4 text-red-500" />
              <a
                href={`https://wa.me/${storeInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400 transition-colors font-semibold"
              >
                WhatsApp Order Line
              </a>
            </div>

            <div className="pt-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Shop Admin Login</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Mayur Sports (Chembur, Mumbai). All rights reserved.</p>
          <p>Authorized Retailer: Nivia, Yonex, SS Sunridges, Speedo, Cosco, MRF, SG.</p>
        </div>
      </div>
    </footer>
  );
};
