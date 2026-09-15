import React from "react";
import { Link } from "react-router-dom";
import { Compass, Mail, Phone, MapPin, Globe, Share2, Send, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span>Wadi Al Zaitoon</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-normal">
              Official Wadi Al Zaitoon Tourism — Crafting extraordinary travel experiences, sacred landmark excursions, and luxury Middle Eastern holidays.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-emerald-600 transition-colors">
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-emerald-400 transition-colors">Tour Packages</Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-emerald-400 transition-colors">Hotels & Stays</Link>
              </li>
            </ul>
          </div>

          {/* Services & Reviews */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/terms-and-conditions" className="hover:text-emerald-400 transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-emerald-400 transition-colors">Traveler Reviews</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-emerald-400 transition-colors">Special Offers</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">Account Portal</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact Info</h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Al Fahidi District, Bur Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>+971 52 167 9632</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Wadialzaitoondxb@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} WADI AL ZAITOON TOURISM LLC. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms-and-conditions" className="hover:text-emerald-400 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
