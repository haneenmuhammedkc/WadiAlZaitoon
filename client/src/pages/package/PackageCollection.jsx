import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FadeIn } from "../../components/animations/Motion";

// Structured constants stored for reference and future expansion
export const TOP_OFFERS = [
  {
    packageName: "Dubai Luxury Escape",
    destination: "Dubai, UAE",
    duration: "5 Nights / 6 Days",
    originalPrice: 44999,
    price: 39999,
    savings: "Save 11%",
  },
  {
    packageName: "Maldives Island Escape",
    destination: "Maldives",
    duration: "4 Nights / 5 Days",
    originalPrice: 62999,
    price: 54999,
    savings: "Save 13%",
  },
  {
    packageName: "Bali Tropical Experience",
    destination: "Bali, Indonesia",
    duration: "5 Nights / 6 Days",
    originalPrice: 49999,
    price: 44999,
    savings: "Save 10%",
  },
  {
    packageName: "Thailand Island Getaway",
    destination: "Bangkok & Phuket",
    duration: "5 Nights / 6 Days",
    originalPrice: 42999,
    price: 37999,
    savings: "Save 12%",
  },
];

export const HONEYMOON_PACKAGES = [
  {
    name: "Maldives Romantic Escape",
    duration: "5 Nights / 6 Days",
    price: "₹69,999 / couple",
  },
  {
    name: "Bali Honeymoon Retreat",
    duration: "6 Nights / 7 Days",
    price: "₹74,999 / couple",
  },
  {
    name: "Dubai Honeymoon Escape",
    duration: "5 Nights / 6 Days",
    price: "₹59,999 / couple",
  },
  {
    name: "Switzerland Romantic Journey",
    duration: "7 Nights / 8 Days",
    price: "₹1,29,999 / couple",
  },
];

export const COMMON_PACKAGE_INFO = {
  accommodation: "3★ / 4★ / 5★ hotels with Standard, Deluxe, or Premium options.",
  mealPlan: "Daily Breakfast included; Half Board and Full Board available.",
  transportation: "Private/Shared airport transfers, hotel transfers, and sightseeing.",
  inclusions: [
    "Hotel accommodation",
    "Daily breakfast",
    "Airport transfers",
    "Local transportation",
    "Sightseeing & entrance tickets",
    "Applicable hotel taxes",
  ],
  exclusions: [
    "International and domestic airfare",
    "Visa charges",
    "Personal expenses",
    "Travel & medical insurance",
    "Tips & gratuities",
  ],
};

export const COMMON_FAQS = [
  {
    q: "Are flights included in the package?",
    a: "International flights are generally excluded unless specifically mentioned in inclusions.",
  },
  {
    q: "Is hotel accommodation included?",
    a: "Yes, specified hotel nights and selected star categories are included.",
  },
  {
    q: "Are airport transfers included?",
    a: "Yes, roundtrip airport transfers are included in all standard packages.",
  },
  {
    q: "Can I customize the travel itinerary?",
    a: "Yes, custom night extensions, activity add-ons, and hotel upgrades are available.",
  },
];

const categoryCollections = [
  {
    id: "family-holidays",
    badge: "FAMILY SPECIAL",
    categoryLabel: "FAMILY HOLIDAYS",
    title: "Memories for the Whole Family",
    description:
      "Create unforgettable family memories with carefully planned holidays that combine comfortable stays, exciting attractions and family-friendly experiences. Perfect for parents, children and groups looking for a stress-free getaway.",
    startingPrice: "₹34,999",
    image: "/assets/images/packagecollections/family.jpg",
    featuredPackages: [
      { name: "Dubai Family Adventure", duration: "4N / 5D", price: "₹34,999" },
      { name: "Singapore Family Getaway", duration: "4N / 5D", price: "₹49,999" },
      { name: "Thailand Family Escape", duration: "5N / 6D", price: "₹42,999" },
      { name: "Malaysia Family Holiday", duration: "5N / 6D", price: "₹39,999" },
    ],
    highlights: [
      "Family-friendly destinations",
      "Comfortable accommodation",
      "Child-friendly activities",
      "Sightseeing",
      "Airport transfers",
      "Flexible itinerary options",
    ],
    cta: "VIEW FAMILY PACKAGES",
  },
  {
    id: "beach-island",
    badge: "TROPICAL ESCAPES",
    categoryLabel: "BEACH & ISLAND GETAWAYS",
    title: "Sun, Sand & Crystal-Clear Waters",
    description:
      "Escape to tropical beaches, turquoise lagoons and beautiful island resorts. Enjoy relaxing stays, exciting water activities and unforgettable moments surrounded by nature.",
    startingPrice: "₹54,999",
    image: "/assets/images/packagecollections/beach.jpg",
    featuredPackages: [
      { name: "Maldives Island Escape", duration: "4N / 5D", price: "₹54,999" },
      { name: "Bali Tropical Experience", duration: "5N / 6D", price: "₹44,999" },
      { name: "Thailand Island Getaway", duration: "5N / 6D", price: "₹37,999" },
      { name: "Mauritius Tropical Escape", duration: "5N / 6D", price: "₹59,999" },
    ],
    highlights: [
      "Exotic beach destinations",
      "Luxury island resorts",
      "Water activities",
      "Island excursions",
      "Sunset experiences",
      "Beach relaxation",
    ],
    cta: "EXPLORE BEACH PACKAGES",
  },
  {
    id: "international-holidays",
    badge: "GLOBAL EXPEDITIONS",
    categoryLabel: "INTERNATIONAL HOLIDAYS",
    title: "Discover the World",
    description:
      "Explore some of the world's most exciting destinations with professionally planned international holiday packages. From iconic landmarks and rich cultures to breathtaking landscapes, make every journey memorable.",
    startingPrice: "₹49,999",
    image: "/assets/images/packagecollections/international.jpg",
    featuredPackages: [
      { name: "Switzerland Explorer (Europe)", duration: "7N / 8D", price: "₹1,19,999" },
      { name: "Italy Discovery Tour (Europe)", duration: "6N / 7D", price: "₹89,999" },
      { name: "Bali Tropical Experience (Asia)", duration: "5N / 6D", price: "₹44,999" },
      { name: "Georgia Discovery (Caucasus)", duration: "4N / 5D", price: "₹34,999" },
    ],
    highlights: [
      "Iconic landmarks",
      "Cultural experiences",
      "Curated itineraries",
      "International accommodation",
      "Airport transfers",
      "Guided sightseeing",
    ],
    cta: "EXPLORE INTERNATIONAL PACKAGES",
  },
  {
    id: "uae-packages",
    badge: "LUXURY & ADVENTURE",
    categoryLabel: "UAE HOLIDAY PACKAGES",
    title: "Experience the Extraordinary",
    description:
      "Discover the luxury, adventure and modern attractions of the United Arab Emirates. Experience Dubai's iconic skyline, desert landscapes, world-class entertainment and unforgettable city experiences.",
    startingPrice: "₹29,999",
    image: "/assets/images/packagecollections/uae.jpg",
    featuredPackages: [
      { name: "Dubai Express Getaway", duration: "4N / 5D", price: "₹29,999" },
      { name: "Dubai Family Adventure", duration: "4N / 5D", price: "₹34,999" },
      { name: "Dubai Luxury Escape", duration: "5N / 6D", price: "₹39,999" },
      { name: "UAE Grand Experience", duration: "6N / 7D", price: "₹49,999" },
    ],
    highlights: [
      "Dubai city sightseeing",
      "Burj Khalifa",
      "Desert Safari",
      "Dubai Marina",
      "Palm Jumeirah",
      "Private/shared transfers",
    ],
    cta: "EXPLORE UAE PACKAGES",
  },
  {
    id: "adventure-packages",
    badge: "OUTDOOR EXPEDITIONS",
    categoryLabel: "ADVENTURE PACKAGES",
    title: "For Those Who Love to Explore",
    description:
      "Go beyond the ordinary with thrilling adventures, mountain escapes, outdoor activities and breathtaking natural landscapes. Designed for travellers who want excitement, discovery and unforgettable experiences.",
    startingPrice: "₹37,999",
    image: "/assets/images/packagecollections/adventure.jpg",
    featuredPackages: [
      { name: "Georgia Mountain Adventure", duration: "4N / 5D", price: "₹37,999" },
      { name: "Bali Adventure Escape", duration: "5N / 6D", price: "₹44,999" },
      { name: "Thailand Island Adventure", duration: "5N / 6D", price: "₹39,999" },
      { name: "Turkey Discovery Adventure", duration: "6N / 7D", price: "₹59,999" },
    ],
    highlights: [
      "Mountain experiences",
      "Nature excursions",
      "Hiking & exploration",
      "Water activities",
      "Scenic viewpoints",
      "Outdoor adventures",
    ],
    cta: "EXPLORE ADVENTURE PACKAGES",
  },
];

const PackageCollection = () => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (e) e.preventDefault();
    navigate("/packages/all");
  };

  return (
    <section className="w-full space-y-10 my-4">
      {/* Header Area */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block mb-1">
              CURATED CATEGORIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] uppercase tracking-tight">
              POPULAR PACKAGE COLLECTIONS
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Explore Your Perfect Escape
            </p>
          </div>
          <button
            onClick={handleCardClick}
            className="text-xs font-bold text-[#0F172A] hover:text-[#059669] flex items-center gap-1.5 uppercase tracking-wider transition-colors shrink-0 cursor-pointer"
          >
            <span>VIEW ALL PACKAGES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </FadeIn>

      {/* STRICT REQUIREMENT: EXACTLY ONE FULL-WIDTH CARD PER ROW (VERTICAL STACK) */}
      <div className="space-y-8 sm:space-y-10 lg:space-y-12">
        {categoryCollections.map((cat) => (
          <FadeIn key={cat.id}>
            <div
              onClick={handleCardClick}
              className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-900 transition-all duration-300 group cursor-pointer w-full flex flex-col justify-between"
            >
              {/* TOP ROW: IMAGE SECTION (Full Width, Compact Height) */}
              <div className="relative w-full h-44 sm:h-52 md:h-56 overflow-hidden bg-[#0F172A] shrink-0">
                <img
                  src={cat.image}
                  alt={cat.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/images/dubai.png";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent pointer-events-none" />

                {/* Badge (Top-Left) */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0F172A]/90 text-white backdrop-blur-md text-[9px] font-extrabold uppercase tracking-widest border border-white/20 shadow-sm">
                  {cat.badge}
                </div>
              </div>

              {/* BOTTOM ROW: CONTENT SECTION (Full Width, Compact Padding) */}
              <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  
                  {/* Category Label & Main Title */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#059669] block">
                      {cat.categoryLabel}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight  transition-colors leading-snug">
                      {cat.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 font-normal leading-relaxed max-w-4xl">
                    {cat.description}
                  </p>

                  {/* Starting Price & Featured Packages Sub-List */}
                  <div className="pt-1 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
                    
                    {/* Price Tag Box */}
                    <div className="md:col-span-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                      <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">
                        STARTING FROM
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                          {cat.startingPrice}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">/ person</span>
                      </div>
                    </div>

                    {/* Featured Packages Compact Grid */}
                    <div className="md:col-span-8 space-y-1.5">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                        FEATURED PACKAGES
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {cat.featuredPackages.map((fp, i) => (
                          <div
                            key={i}
                            className="text-[10px] font-semibold text-slate-700 bg-slate-50 border border-slate-200/70 px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-1"
                          >
                            <span className="truncate font-bold">{fp.name}</span>
                            <span className="text-[9px] font-extrabold shrink-0">
                              {fp.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Highlights Chips */}
                  <div className="pt-2 space-y-1.5 border-t border-slate-100">
                    <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      HIGHLIGHTS
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60"
                        >
                          <CheckCircle2 className="w-3 h-3 text-black shrink-0" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Card Bottom Footer CTA Button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={handleCardClick}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-900 group-hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>{cat.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

export default PackageCollection;
