import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  Star,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Clock,
  Bed,
  Camera,
  ArrowLeft,
  Coffee,
  Check,
  Sparkles,
} from "lucide-react";
import { PageTransition, FadeIn } from "../../components/animations/Motion";
import { fetchHotelById } from "../../services/hotelService";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchHotelById(id);
        if (data?.success && data?.hotel) {
          setHotel(data.hotel);
        } else {
          setHotel(null);
        }
      } catch (err) {
        setHotel(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Loading Skeleton State
  if (loading) {
    return (
      <PageTransition>
        <div className="pt-28 pb-24 bg-slate-50 min-h-screen text-[#0F172A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
            <div className="h-6 w-36 bg-slate-200 rounded-lg" />
            <div className="h-12 w-3/4 bg-slate-200 rounded-xl" />
            <div className="h-96 w-full bg-slate-200 rounded-3xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  // Not Found / Invalid ID State
  if (!hotel) {
    return (
      <PageTransition>
        <div className="pt-32 pb-24 bg-slate-50 min-h-screen text-[#0F172A] flex items-center justify-center">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block mb-1">
                HOTEL NOT AVAILABLE
              </span>
              <h2 className="text-2xl font-black text-[#0F172A]">
                Hotel Not Found
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-2">
                We couldn't find the requested hotel details. Please return to our hotel collection to explore available stays.
              </p>
            </div>
            <button
              onClick={() => navigate("/hotels")}
              className="w-full py-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#059669] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO HOTELS</span>
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const primaryPkg = hotel.usedByPackages && hotel.usedByPackages.length > 0 ? hotel.usedByPackages[0] : null;
  const targetPackageId = primaryPkg?._id;

  return (
    <PageTransition>
      <div className="pt-24 sm:pt-28 pb-24 bg-slate-50 min-h-screen text-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* 1. BREADCRUMB / BACK NAVIGATION */}
          <FadeIn>
            <button
              onClick={() => navigate("/hotels")}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-600 hover:text-[#059669] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 text-[#059669] group-hover:-translate-x-1 transition-transform" />
              <span>BACK TO HOTELS</span>
            </button>
          </FadeIn>

          {/* 2. HOTEL HEADER SECTION */}
          <FadeIn>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block">
                  {hotel.badge} • {hotel.stay}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight">
                  {hotel.hotelName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold text-slate-600 pt-1">
                  <span className="flex items-center gap-1 text-[#059669]">
                    <MapPin className="w-4 h-4" />
                    <span>{hotel.location}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm text-[#0F172A]">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-extrabold">{hotel.rating}</span>
                    <span className="text-slate-400 font-semibold">({hotel.reviewsCount} reviews)</span>
                  </span>
                </div>
              </div>

              {primaryPkg ? (
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-6 shrink-0">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      FEATURED IN
                    </span>
                    <span className="text-sm font-extrabold text-[#0F172A]">
                      {primaryPkg.packageName}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/package/${primaryPkg._id}`)}
                    className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#059669] text-white text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>VIEW TOUR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-6 shrink-0">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      ACCOMMODATION
                    </span>
                    <span className="text-sm font-extrabold text-[#0F172A]">
                      Independent Hotel Stay
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/packages")}
                    className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#059669] text-white text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <span>EXPLORE TOURS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </FadeIn>

          {/* 3. 5-IMAGE GALLERY SECTION */}
          <FadeIn>
            <div className="space-y-4">
              {/* Large Main Display Image */}
              <div className="relative h-80 sm:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden bg-slate-900 shadow-lg border border-slate-200/80">
                <img
                  src={hotel.images[activeImageIndex]?.src || hotel.images[activeImageIndex]?.url}
                  alt={hotel.images[activeImageIndex]?.alt || hotel.images[activeImageIndex]?.label || hotel.hotelName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/bg_jmg1.jpg";
                  }}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-4 py-2 rounded-2xl bg-slate-950/80 text-white backdrop-blur-md text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 border border-white/10 shadow-md">
                  <Camera className="w-4 h-4 text-[#059669]" />
                  <span>IMAGE {activeImageIndex + 1} OF {hotel.images.length}: {hotel.images[activeImageIndex]?.label}</span>
                </div>
              </div>

              {/* Dynamic Thumbnails Grid Selector */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                {hotel.images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 sm:w-36 h-18 sm:h-24 md:h-28 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? "border-[#059669] ring-4 ring-[#059669]/20 scale-[0.98] shadow-md"
                        : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.src || img.url}
                      alt={img.alt || img.label}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/bg_jmg1.jpg";
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-950/85 py-1 text-[9px] sm:text-[10px] font-extrabold text-white text-center truncate px-1 uppercase tracking-wider">
                      {img.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* 4. HOTEL INFORMATION & DETAILS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            
            {/* LEFT COLUMN: OVERVIEW, STAY SPECS & ROOM FEATURES */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Overview Box */}
              <FadeIn>
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block mb-1">
                      HOTEL OVERVIEW
                    </span>
                    <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">
                      About Your Stay
                    </h2>
                  </div>

                  <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                    {hotel.description}
                  </p>

                  {/* Stay Details Grid */}
                  <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-white text-[#059669] shadow-sm shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                          DURATION
                        </span>
                        <span className="text-sm font-black text-[#0F172A]">
                          {hotel.stay}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-white text-[#059669] shadow-sm shrink-0">
                        <Bed className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                          ROOM CATEGORY
                        </span>
                        <span className="text-sm font-black text-[#0F172A]">
                          {hotel.roomType}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-white text-[#059669] shadow-sm shrink-0">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                          MEAL PLAN
                        </span>
                        <span className="text-sm font-black text-[#0F172A]">
                          {hotel.mealPlan}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-white text-[#059669] shadow-sm shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                          LOCATION
                        </span>
                        <span className="text-sm font-black text-[#0F172A]">
                          {hotel.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Room Features Box */}
              {hotel.roomFeatures && hotel.roomFeatures.length > 0 && (
                <FadeIn>
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block mb-1">
                        IN-ROOM COMFORT
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                        Room Features
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {hotel.roomFeatures.map((feature, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-[#0F172A]"
                        >
                          <Check className="w-4 h-4 text-[#059669] shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

            </div>

            {/* RIGHT COLUMN: AMENITIES & PACKAGE CONNECTION CTA */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Amenities Box */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <FadeIn>
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block mb-1">
                        FACILITIES
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                        Hotel Amenities
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {hotel.amenities.map((amenity, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-[#0F172A]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Package Relationship CTA Box */}
              <FadeIn>
                <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-7 sm:p-9 rounded-3xl space-y-6 shadow-xl relative overflow-hidden group border border-slate-800">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#059669]/10 rounded-full blur-3xl group-hover:bg-[#059669]/20 transition-all duration-700 pointer-events-none" />
                  
                  <div className="space-y-2 relative z-10">
                    <span className="text-[11px] uppercase tracking-widest text-[#059669] font-extrabold block">
                      {primaryPkg ? "FEATURED TOUR PACKAGE" : "EXPLORE PACKAGES"}
                    </span>
                    <h3 className="text-2xl font-black tracking-tight text-white">
                      {primaryPkg ? primaryPkg.packageName : "Wadi Al Zaitoon Curated Tours"}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed pt-1">
                      Explore the complete tour package, full day-by-day itinerary, inclusions and exclusive travel experiences.
                    </p>
                  </div>

                  <div className="pt-2 relative z-10">
                    <button
                      onClick={() => navigate(targetPackageId ? `/package/${targetPackageId}` : "/packages")}
                      className="w-full py-4 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
                    >
                      <span>{targetPackageId ? "VIEW TOUR PACKAGE" : "BROWSE ALL PACKAGES"}</span>
                      <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </FadeIn>

            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default HotelDetails;
