import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Star, ArrowRight, Sparkles } from "lucide-react";

const PackageCard = ({ packageData, badgeText, badgeBg, variant = "default" }) => {
  if (!packageData) return null;

  const isFeatured = variant === "featured";
  const targetId = packageData._id || packageData.id;
  const hasOffer = packageData.packageOffer && packageData.packageDiscountPrice > 0;
  const currentPrice = hasOffer ? packageData.packageDiscountPrice : packageData.packagePrice;

  const getPackageImage = (pack) => {
    if (pack.packageImages && pack.packageImages.length > 0 && pack.packageImages[0] && !pack.packageImages[0].includes("bg_jmg1")) {
      return pack.packageImages[0];
    }
    const title = (pack.packageName || "").toLowerCase();
    if (title.includes("dubai")) return "/assets/images/dubai.png";
    if (title.includes("maldives")) return "/assets/images/maldives.png";
    if (title.includes("bali")) return "/assets/images/bali.png";
    if (title.includes("thailand")) return "/assets/images/thailand.png";
    return "/assets/images/dubai.png";
  };

  const imageSrc = getPackageImage(packageData);

  const formattedPrice =
    typeof currentPrice === "number"
      ? `₹${currentPrice.toLocaleString()}`
      : currentPrice;

  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full justify-between relative ${
        isFeatured ? "hover:border-emerald-400" : "hover:border-coral-400"
      }`}
    >
      {/* Image Header */}
      <div className="relative h-52 overflow-hidden bg-slate-100 shrink-0">
        <img
          src={imageSrc}
          alt={packageData.packageName}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/assets/images/dubai.png";
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Rating Pill in top-right */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-extrabold text-slate-900 flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{Number(packageData.packageRating || 4.8).toFixed(1)}</span>
        </div>

        {/* Category / Offer Badge */}
        {badgeText ? (
          <div
            className={`absolute bottom-3 left-3 ${badgeBg || "bg-coral-600"} text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm tracking-wider`}
          >
            {badgeText}
          </div>
        ) : hasOffer ? (
          <div className="absolute bottom-3 left-3 bg-coral-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Special Offer
          </div>
        ) : null}
      </div>

      {/* Card Content Area - Fixed Equal Height Layout */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-3">
        <div className="space-y-2.5">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-semibold truncate max-w-[60%]">
              <MapPin className="w-3.5 h-3.5 text-coral-600 shrink-0" />
              <span className="truncate">{packageData.packageDestination}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-coral-600 shrink-0" />
              <span>
                {typeof packageData.packageDays === "number"
                  ? `${packageData.packageDays} Days`
                  : packageData.packageDays}
              </span>
            </span>
          </div>

          {/* Reserved Height Title */}
          <div className="min-h-[48px] flex items-center">
            <Link
              to={`/package/${targetId}`}
              className="font-extrabold text-base text-slate-900 hover:text-coral-600 transition-colors line-clamp-2 leading-snug"
            >
              <h3>{packageData.packageName}</h3>
            </Link>
          </div>

          {/* Reserved Height Description */}
          <div className="min-h-[36px] flex items-start">
            <p className="text-xs text-slate-600 line-clamp-2 font-normal leading-relaxed">
              {packageData.packageDescription}
            </p>
          </div>
        </div>

        {/* Locked Footer Price & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto shrink-0 bg-white">
          <div>
            <span
              className={`text-[10px] uppercase font-bold block tracking-wider ${
                isFeatured ? "text-emerald-600 font-extrabold" : "text-slate-400"
              }`}
            >
              STARTING FROM
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-md text-slate-900">{formattedPrice}</span>
              <span className="text-[11px] text-slate-400 font-medium">/ person</span>
            </div>
          </div>

          <Link
            to={`/package/${targetId}`}
            className={
              isFeatured
                ? "px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer relative z-10"
                : "px-4 py-2.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm shrink-0 transform active:scale-95 cursor-pointer relative z-10"
            }
          >
            VIEW DETAILS {!isFeatured && <ArrowRight className="w-3.5 h-3.5" />}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
