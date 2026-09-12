import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Star,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Bed,
  Clock,
  Camera,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "../../components/animations/Motion";
import { fetchHotels } from "../../services/hotelService";

const Hotels = () => {
  const navigate = useNavigate();

  // Search & Filter state
  const [searchDestination, setSearchDestination] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("All Stays");
  const [sortOption, setSortOption] = useState("recommended");

  const [hotelsList, setHotelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHotels({
        destination: selectedDestination,
        searchTerm: searchDestination,
      });

      if (data?.success && Array.isArray(data.hotels)) {
        setHotelsList(data.hotels);
      } else {
        setError("Failed to load hotels. Please try again.");
        setHotelsList([]);
      }
    } catch (err) {
      setError("Failed to load hotel information. Please check your network connection.");
      setHotelsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, [searchDestination, selectedDestination]);

  // Filtered & Sorted Hotels list
  const filteredHotels = useMemo(() => {
    return [...hotelsList].sort((a, b) => {
      if (sortOption === "ratingHigh") return (b.rating || 0) - (a.rating || 0);
      return 0; // default
    });
  }, [hotelsList, sortOption]);

  const handleClearFilters = () => {
    setSearchDestination("");
    setSelectedDestination("All Stays");
    setSortOption("recommended");
  };

  // Helper to navigate to full page HotelDetails
  const handleViewHotel = (hotelId) => {
    navigate(`/hotel/${hotelId}`);
  };

  return (
    <PageTransition>
      <div className="pt-24 sm:pt-28 pb-24 bg-slate-50 min-h-screen text-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* HOTEL COLLECTION & RESULTS SECTION */}
          <section id="hotel-collection-section" className="space-y-8 scroll-mt-28">
            
            {/* Section Header */}
            <FadeIn>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block mb-1">
                    HOTEL COLLECTION ({filteredHotels.length})
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] uppercase tracking-tight">
                    Explore Your Stay
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    Explore comfortable stays for your next journey.
                  </p>
                </div>

                {/* Toolbar Sort Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-slate-500">Sort By:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-[#059669] shadow-sm"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="ratingHigh">Highest Rated</option>
                  </select>
                </div>
              </div>
            </FadeIn>

            {/* HOTEL GRID OR EMPTY / ERROR STATE */}
            {error ? (
              <div className="bg-white border border-emerald-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Unable to Load Hotels</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {error}
                  </p>
                </div>
                <button
                  onClick={loadHotels}
                  className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white font-extrabold text-xs uppercase tracking-wider hover:bg-[#059669] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>RETRY</span>
                </button>
              </div>
            ) : filteredHotels.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mx-auto">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">No Hotels Match Your Search</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Try adjusting your filters or destination keywords.
                  </p>
                </div>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white font-extrabold text-xs uppercase tracking-wider hover:bg-[#059669] transition-colors cursor-pointer"
                >
                  CLEAR ALL FILTERS
                </button>
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHotels.map((hotel) => {
                  const targetId = hotel._id || hotel.id;
                  const firstImg = hotel.images?.[0]?.url || hotel.images?.[0]?.src || "/assets/bg_jmg1.jpg";
                  const firstAlt = hotel.images?.[0]?.alt || hotel.hotelName;

                  return (
                    <StaggerItem key={targetId}>
                      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full">
                        
                        {/* Image Top Container */}
                        <div
                          onClick={() => handleViewHotel(targetId)}
                          className="relative h-60 overflow-hidden bg-slate-900 cursor-pointer"
                        >
                          <img
                            src={firstImg}
                            alt={firstAlt}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/assets/bg_jmg1.jpg";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                          />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent pointer-events-none" />

                        {/* Badge */}
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#0F172A]/90 text-white backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest border border-white/20">
                          {hotel.badge}
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-black text-[#0F172A] flex items-center gap-1 shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{hotel.rating}</span>
                          <span className="text-[10px] text-slate-400 font-bold">({hotel.reviewsCount})</span>
                        </div>

                        {/* Photos Count Tag */}
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 text-white backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <Camera className="w-3 h-3 text-[#059669]" />
                          <span>{hotel.images ? hotel.images.length : 5} PHOTOS</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          
                          {/* Location & Hotel Title */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#059669] flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                              <span>{hotel.location}</span>
                            </span>
                            <h3
                              onClick={() => handleViewHotel(targetId)}
                              className="text-xl font-black text-[#0F172A] tracking-tight group-hover:text-[#059669] transition-colors leading-snug cursor-pointer"
                            >
                              {hotel.hotelName}
                            </h3>
                            {hotel.usedByPackages && hotel.usedByPackages.length > 0 ? (
                              <span className="text-[11px] font-bold text-emerald-700 block truncate">
                                Available in: {hotel.usedByPackages.map((p) => p.packageName).join(", ")}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-400 block">
                                Standalone Accommodation
                              </span>
                            )}
                          </div>

                          {/* Stay Specs Strip */}
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                              <span>{hotel.stay}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                              <Bed className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                              <span className="truncate">{hotel.roomType}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2">
                            {hotel.description}
                          </p>

                          {/* Amenities Chips */}
                          <div className="pt-2 space-y-1.5 border-t border-slate-100">
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                              AMENITIES & HIGHLIGHTS
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                                  <span className="truncate">{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer CTA */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                          <button
                            onClick={() => handleViewHotel(targetId)}
                            className="text-xs font-extrabold text-slate-700 hover:text-[#059669] flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Photos & Details</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#059669]" />
                          </button>

                          <button
                            onClick={() => handleViewHotel(targetId)}
                            className="px-5 py-2.5 rounded-2xl bg-[#0F172A] group-hover:bg-[#059669] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
                          >
                            <span>VIEW HOTEL</span>
                            <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>

                      </div>

                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}

          </section>
        </div>
      </div>
    </PageTransition>
  );
};

export default Hotels;
