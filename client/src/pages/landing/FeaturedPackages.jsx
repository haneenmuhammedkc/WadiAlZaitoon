import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "../../components/animations/Motion";
import PackageCard from "../package/PackageCard";

const FeaturedPackages = ({ displayPackages = [], loading = false, error = null }) => {
  const badges = [
    { text: "BEST SELLER", bg: "bg-coral-600" },
    { text: "POPULAR CHOICE", bg: "bg-slate-900" },
    { text: "TOP RATED", bg: "bg-amber-500" },
    { text: "GREAT VALUE", bg: "bg-emerald-600" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Top Heading Area */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold block mb-1">
              HOLIDAY EXPERIENCES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
              FEATURED TOUR PACKAGES
            </h2>
          </div>
          <Link
            to="/packages"
            className="text-xs font-bold text-slate-900 hover:text-coral-600 flex items-center gap-1.5 uppercase tracking-wider transition-colors shrink-0"
          >
            VIEW ALL PACKAGES →
          </Link>
        </div>
      </FadeIn>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-[440px] bg-slate-200/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center font-medium flex items-center justify-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      ) : displayPackages.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs font-semibold">
          No featured packages available at the moment.
        </div>
      ) : (
        /* 4-Card Grid reusing PackageCard with variant="featured" */
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPackages.map((pack, idx) => {
            const badge = badges[idx % badges.length];
            const targetId = pack._id || pack.id;

            return (
              <StaggerItem key={targetId || idx}>
                <PackageCard
                  packageData={pack}
                  badgeText={badge.text}
                  badgeBg={badge.bg}
                  variant="featured"
                />
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}
    </section>
  );
};

export default FeaturedPackages;
