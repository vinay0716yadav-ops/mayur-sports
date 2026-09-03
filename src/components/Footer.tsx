import React from 'react';
import Link from 'next/link';
import { StoreInfo } from '@/lib/types';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Award, Truck, Lock } from 'lucide-react';

interface FooterProps {
  storeInfo: StoreInfo;
}

export const Footer: React.FC<FooterProps> = ({ storeInfo }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Brand Trust Badges */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">100% Genuine Gear</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sourced directly from authorized manufacturers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Expert Consultation</h4>
              <p className="text-xs text-slate-400 mt-0.5">Guidance on bat knocking, racket stringing & fit</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Quick Store Pickup & Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">WhatsApp booking with instant shop reservation</p>
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
              MAYUR <span className="text-emerald-400">SPORTS</span>
            </h3>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {storeInfo.tagline}. Serving athletes, school champions, fitness enthusiasts, and tournament players with top-tier equipment at competitive prices.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
              <span className="px-3 py-1 rounded-full bg-slate-800">Cricket</span>
              <span className="px-3 py-1 rounded-full bg-slate-800">Badminton</span>
              <span className="px-3 py-1 rounded-full bg-slate-800">Football</span>
              <span className="px-3 py-1 rounded-full bg-slate-800">Gym Equipment</span>
              <span className="px-3 py-1 rounded-full bg-slate-800">Table Tennis</span>
              <span className="px-3 py-1 rounded-full bg-slate-800">Athletic Shoes</span>
            </div>
          </div>

          {/* Col 2: Store Location & Timings */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Store Location</h4>
            <div className="flex items-start gap-3 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                {storeInfo.address},<br />
                {storeInfo.city}, {storeInfo.state} - {storeInfo.pincode}
              </span>
            </div>

            <div className="flex items-start gap-3 text-xs text-slate-400 pt-1">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{storeInfo.openingHours}</span>
            </div>
          </div>

          {/* Col 3: Quick Contact & Admin */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Contact Us</h4>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-emerald-400" />
              <a href={`tel:${storeInfo.phone}`} className="hover:text-emerald-300 transition-colors">
                {storeInfo.phone}
              </a>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <a
                href={`https://wa.me/${storeInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 transition-colors"
              >
                Chat on WhatsApp
              </a>
            </div>

            <div className="pt-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Shop Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Mayur Sports. All rights reserved.</p>
          <p>Built for direct shop sales and customer inquiries.</p>
        </div>
      </div>
    </footer>
  );
};
