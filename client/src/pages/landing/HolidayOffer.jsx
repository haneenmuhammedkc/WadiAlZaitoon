import React from "react";
import { Link } from "react-router-dom";

const HolidayOffer = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs uppercase tracking-widest font-extrabold text-coral-400">
            SPECIAL HOLIDAY OFFER
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white uppercase leading-tight">
            PLAN YOUR NEXT JOURNEY WITH US
          </h2>
          <p className="text-slate-300 text-sm font-normal">
            Book your tour package today and experience authentic Middle Eastern hospitality with Wadi Al Zaitoon.
          </p>
          <div className="pt-2">
            <Link
              to="/packages"
              className="px-8 py-3.5 rounded-full bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg inline-block"
            >
              EXPLORE OFFERS NOW
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HolidayOffer;
