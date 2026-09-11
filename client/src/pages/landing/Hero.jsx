import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

const Hero = ({ search, setSearch }) => {
  return (
    <section className="relative bg-slate-900 text-white min-h-screen h-screen h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Hero Video Background from Cloudinary */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/bg_jmg1.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-100 transform scale-105"
      >
        <source
          src="https://res.cloudinary.com/mjqklz7x/video/upload/v1789137145/herowadi.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 z-10 py-12 md:py-16">
        <span className="px-8 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 font-extrabold text-xs uppercase tracking-wider backdrop-blur-md transition-all">
          Wadi Al Zaitoon Tourism
        </span>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight uppercase leading-tight drop-shadow-md">
          DISCOVER THE WORLD, YOUR WAY
        </h1>

        <p className="text-white text-sm md:text-lg max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
          Explore unforgettable holiday packages, iconic destinations, luxury stays, exciting tours and seamless travel experiences all in one place.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/packages"
            className="px-8 py-4 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg transform hover:scale-105 active:scale-95"
          >
            EXPLORE PACKAGES
          </Link>
          <Link
            to="/about"
            className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 font-extrabold text-xs uppercase tracking-wider backdrop-blur-md transition-all"
          >
            DISCOVER DESTINATIONS
          </Link>
        </div>
      </div>

      {/* Quick Search Floating Card */}
      <div className="absolute bottom-4 left-4 right-4 max-w-4xl mx-auto hidden md:block z-20">
        <div className="bg-white p-2 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search packages by destination, city or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <Link
            to={`/packages?searchTerm=${encodeURIComponent(search)}`}
            className="px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shrink-0 transition-colors"
          >
            SEARCH TOURS
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
