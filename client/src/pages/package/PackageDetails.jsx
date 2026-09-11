import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Star,
  Share2,
  Check,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Hotel,
  Bus,
  Utensils,
  Compass,
  AlertCircle,
  MessageSquare,
  Download,
  Users,
  Layers,
  ChevronDown,
  CheckCircle2,
  Grid,
  Headphones,
  XCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import RatingCard from "../RatingCard";
import { getPackageById } from "../../services/packageService";
import { submitRating, getPackageRatings, checkRatingGiven as checkRatingGivenApi } from "../../services/ratingService";
import { PageTransition } from "../../components/animations/Motion";

const sampleFallbackPackages = {
  "sample-1": {
    _id: "sample-1",
    packageName: "Dubai Luxury Escape",
    packageDescription:
      "Experience the ultimate Dubai luxury tour with desert safari adventure, dhow dinner cruise, Burj Khalifa observation deck, and guided city excursions across iconic landmarks.",
    packageDestination: "Dubai, UAE",
    packageDays: 6,
    packageNights: 5,
    packageAccommodation: "5-Star Luxury Hotel",
    packageTransportation: "Private AC Luxury Vehicle",
    packageMeals: "Daily Breakfast & Buffet Dinners",
    packageActivities: "Desert Safari, Dhow Cruise, City Tour & Burj Khalifa",
    packagePrice: 1699,
    packageDiscountPrice: 1499,
    packageOffer: true,
    packageRating: 4.8,
    packageTotalRatings: 126,
    packageImages: [
      "/assets/images/dubai.png",
      "/assets/images/maldives.png",
      "/assets/images/bali.png",
      "/assets/images/thailand.png",
    ],
  },
  "sample-2": {
    _id: "sample-2",
    packageName: "Maldives Island Escape",
    packageDescription:
      "Escape to a tropical paradise in the Maldives with overwater villa stay, snorkeling in coral reefs, island hopping, sunset dolphin cruise, and private beach dining.",
    packageDestination: "Male, Maldives",
    packageDays: 5,
    packageNights: 4,
    packageAccommodation: "Overwater Ocean Villa",
    packageTransportation: "Speedboat & Seaplane Transfers",
    packageMeals: "All-Inclusive Dining & Drinks",
    packageActivities: "Snorkeling, Island Hopping & Sunset Cruise",
    packagePrice: 2499,
    packageDiscountPrice: 2199,
    packageOffer: true,
    packageRating: 4.9,
    packageTotalRatings: 84,
    packageImages: [
      "/assets/images/maldives.png",
      "/assets/images/bali.png",
      "/assets/images/dubai.png",
      "/assets/images/thailand.png",
    ],
  },
  "sample-3": {
    _id: "sample-3",
    packageName: "Bali Experience",
    packageDescription:
      "Tropical paradise tour with rice terraces, temple tours, beach club access, and cultural experiences. Experience the best of Bali with this carefully curated package.",
    packageDestination: "Ubud, Bali, Indonesia",
    packageDays: 6,
    packageNights: 5,
    packageAccommodation: "4-Star Resort & Spa",
    packageTransportation: "Private Airport & Island Transfers",
    packageMeals: "Daily Breakfast",
    packageActivities: "Temple Tours, Rice Terraces & Beach Clubs",
    packagePrice: 2199,
    packageDiscountPrice: 1899,
    packageOffer: true,
    packageRating: 4.8,
    packageTotalRatings: 126,
    packageImages: [
      "/assets/images/bali.png",
      "/assets/images/thailand.png",
      "/assets/images/dubai.png",
      "/assets/images/maldives.png",
    ],
  },
  "sample-4": {
    _id: "sample-4",
    packageName: "Thailand Getaway",
    packageDescription:
      "Discover Bangkok and Phuket with island tours, floating market visits, authentic Thai cultural shows, elephant sanctuary visits, and speedboat excursions.",
    packageDestination: "Bangkok & Phuket, Thailand",
    packageDays: 6,
    packageNights: 5,
    packageAccommodation: "4-Star Beachfront Hotel",
    packageTransportation: "Private Transfers & Island Speedboats",
    packageMeals: "Daily Breakfast & Island Lunches",
    packageActivities: "Phi Phi Island Tour, Floating Market & Cultural Shows",
    packagePrice: 1899,
    packageDiscountPrice: 1649,
    packageOffer: true,
    packageRating: 4.7,
    packageTotalRatings: 92,
    packageImages: [
      "/assets/images/thailand.png",
      "/assets/images/dubai.png",
      "/assets/images/maldives.png",
      "/assets/images/bali.png",
    ],
  },
};

const PackageDetails = () => {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState({
    _id: "",
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageRating: 0,
    packageTotalRatings: 0,
    packageImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Gallery Navigation State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Active Main Content Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Accordion state for FAQs
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Rating Submission State
  const [ratingsData, setRatingsData] = useState({
    rating: 5,
    review: "",
    packageId: params?.id,
    userRef: currentUser?._id,
    username: currentUser?.username,
    userProfileImg: currentUser?.avatar,
  });
  const [packageRatings, setPackageRatings] = useState([]);
  const [ratingGiven, setRatingGiven] = useState(false);

  const handleBookPackage = () => {
    const targetId = packageData?._id || packageData?.id || params?.id;
    if (!targetId || targetId === "undefined") {
      alert("Unable to process booking: Package ID is missing.");
      return;
    }
    navigate(`/booking/${targetId}`);
  };

  const getPackageData = async () => {
    try {
      setLoading(true);
      setError(false);

      // Check sample fallback first if sample ID passed
      if (params?.id && sampleFallbackPackages[params.id]) {
        setPackageData(sampleFallbackPackages[params.id]);
        setSelectedImageIndex(0);
        setLoading(false);
        return;
      }

      // Query Backend API
      const data = await getPackageById(params?.id);
      if (data?.success && data?.packageData) {
        setPackageData({
          _id: data?.packageData?._id || params?.id || "",
          packageName: data?.packageData?.packageName || "",
          packageDescription: data?.packageData?.packageDescription || "",
          packageDestination: data?.packageData?.packageDestination || "",
          packageDays: data?.packageData?.packageDays || 1,
          packageNights: data?.packageData?.packageNights || 1,
          packageAccommodation: data?.packageData?.packageAccommodation || "",
          packageTransportation: data?.packageData?.packageTransportation || "",
          packageMeals: data?.packageData?.packageMeals || "",
          packageActivities: data?.packageData?.packageActivities || "",
          packagePrice: data?.packageData?.packagePrice || 500,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice || 0,
          packageOffer: data?.packageData?.packageOffer || false,
          packageRating: data?.packageData?.packageRating || 4.8,
          packageTotalRatings: data?.packageData?.packageTotalRatings || 126,
          packageImages:
            data?.packageData?.packageImages && data?.packageData?.packageImages.length > 0
              ? data.packageData.packageImages
              : ["/assets/images/dubai.png"],
        });
        setSelectedImageIndex(0);
        setLoading(false);
      } else {
        setError(data?.message || "Package Unavailable");
        setLoading(false);
      }
    } catch (err) {
      if (params?.id && sampleFallbackPackages[params.id]) {
        setPackageData(sampleFallbackPackages[params.id]);
        setSelectedImageIndex(0);
        setLoading(false);
      } else {
        setError("Package Unavailable");
        setLoading(false);
      }
    }
  };

  const giveRating = async () => {
    await checkRatingGiven();
    if (ratingGiven) {
      alert("You have already submitted your review for this package!");
      return;
    }
    if (!ratingsData.rating || ratingsData.rating < 1 || ratingsData.rating > 5) {
      alert("Please select a rating score between 1 and 5 stars!");
      return;
    }
    try {
      setLoading(true);
      const data = await submitRating({
        ...ratingsData,
        packageId: params?.id,
        userRef: currentUser?._id,
      });
      if (data?.success) {
        setLoading(false);
        alert(data?.message || "Thank you for your feedback!");
        getPackageData();
        getRatings();
        checkRatingGiven();
      } else {
        setLoading(false);
        alert(data?.message || "Failed to submit rating.");
      }
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const getRatings = async () => {
    try {
      const data = await getPackageRatings(params.id, 10);
      if (Array.isArray(data)) {
        setPackageRatings(data);
      } else {
        setPackageRatings([]);
      }
    } catch {
      // Ignore rating error gracefully
    }
  };

  const checkRatingGiven = async () => {
    if (!currentUser?._id || !params?.id) return;
    try {
      const data = await checkRatingGivenApi(currentUser?._id, params?.id);
      setRatingGiven(!!data?.given);
    } catch {
      // Ignore rating error gracefully
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.id]);

  useEffect(() => {
    if (params.id) {
      getPackageData();
      getRatings();
    }
    if (currentUser) {
      checkRatingGiven();
    }
  }, [params.id, currentUser]);

  const hasOffer = packageData.packageOffer && packageData.packageDiscountPrice > 0;
  const discountPercentage = hasOffer
    ? Math.round(
        ((packageData.packagePrice - packageData.packageDiscountPrice) /
          packageData.packagePrice) *
          100
      )
    : 15;

  const imagesList =
    packageData.packageImages && packageData.packageImages.length > 0
      ? packageData.packageImages
      : ["/assets/images/dubai.png"];

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(
      (prev) => (prev - 1 + imagesList.length) % imagesList.length
    );
  };

  const handleDownloadBrochure = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to view and print the package brochure PDF.");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${packageData.packageName} - Wadi Al Zaitoon Tourism Brochure</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #fff; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0; }
            .subtitle { font-size: 13px; color: #2563eb; font-weight: 700; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.05em; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; background: #f8fafc; padding: 18px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e2e8f0; }
            .meta-item { text-align: center; }
            .meta-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .meta-val { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px; }
            .desc { font-size: 13px; line-height: 1.6; color: #334155; }
            .inclusions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .inc-item { font-size: 12px; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-weight: 600; color: #1e293b; }
            .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 18px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${packageData.packageName}</h1>
              <div class="subtitle">Wadi Al Zaitoon Tourism • ${packageData.packageDestination}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 24px; font-weight: 900; color: #0f172a;">$${hasOffer ? packageData.packageDiscountPrice : packageData.packagePrice}</div>
              <div style="font-size: 11px; color: #64748b;">Starting Price / Person</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-val">${packageData.packageNights} Nights / ${packageData.packageDays} Days</div></div>
            <div class="meta-item"><div class="meta-label">Destination</div><div class="meta-val">${packageData.packageDestination}</div></div>
            <div class="meta-item"><div class="meta-label">Tour Rating</div><div class="meta-val">★ ${packageData.packageRating ? packageData.packageRating.toFixed(1) : "4.8"} / 5.0</div></div>
          </div>

          <div class="section">
            <div class="section-title">About This Package</div>
            <div class="desc">${packageData.packageDescription}</div>
          </div>

          <div class="section">
            <div class="section-title">Package Inclusions</div>
            <div class="inclusions-grid">
              <div class="inc-item">✓ Accommodation: ${packageData.packageAccommodation || "Included"}</div>
              <div class="inc-item">✓ Transport: ${packageData.packageTransportation || "Included"}</div>
              <div class="inc-item">✓ Meals: ${packageData.packageMeals || "Included"}</div>
              <div class="inc-item">✓ Activities: ${packageData.packageActivities || "Included"}</div>
            </div>
          </div>

          <div class="footer">
            Book online at ${window.location.href} • Wadi Al Zaitoon Tourism & Travel Services
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "itinerary", label: "ITINERARY" },
    { id: "inclusions", label: "INCLUSIONS" },
    { id: "exclusions", label: "EXCLUSIONS" },
    { id: "hotels", label: "HOTELS" },
    { id: "reviews", label: "REVIEWS" },
    { id: "faqs", label: "FAQS" },
  ];

  const faqsList = [
    {
      q: "What is included in the package price?",
      a: `The package includes accommodation (${packageData.packageAccommodation || "Hotel stay"}), transfers (${packageData.packageTransportation || "Private bus"}), meal plan (${packageData.packageMeals || "Breakfast & Dinner"}), and sightseeing activities (${packageData.packageActivities || "Guided tours"}).`,
    },
    {
      q: "Can I customize the tour itinerary for private groups?",
      a: "Yes! Wadi Al Zaitoon Tourism offers tailored custom travel packages for couples, families, and private corporate groups. Contact our support team for customized arrangements.",
    },
    {
      q: "What is the cancellation and refund policy?",
      a: "Free cancellation is available up to 7 days prior to scheduled departure. Cancellations made within 7 days are subject to hotel & vendor terms.",
    },
    {
      q: "Are international flights included?",
      a: "Package prices cover ground transfers, stay, meals, and activities. Flight tickets can be added upon request during reservation confirmation.",
    },
  ];

  return (
    <PageTransition>
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 pt-24 sm:pt-28 pb-24">
        
        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading package details...</p>
          </div>
        )}

        {/* Error / Package Unavailable State */}
        {error && !loading && (
          <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-xl font-extrabold text-slate-900">Package Unavailable</h2>
            <p className="text-xs text-slate-500 font-normal">
              The selected tour package details could not be loaded. Please return to the package listing page.
            </p>
            <Link
              to="/packages"
              className="inline-block px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm"
            >
              BACK TO PACKAGES
            </Link>
          </div>
        )}

        {/* MAIN PACKAGE DETAILS CONTENT — MATCHING IMAGE 2 EXACTLY */}
        {packageData && !loading && !error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

            {/* TOP TWO-COLUMN LAYOUT (IMAGE 2 PROPORTIONS) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN (≈65%): LARGE IMAGE GALLERY */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                
                {/* Large Hero Image Container */}
                <div className="relative w-full h-[360px] sm:h-[460px] rounded-3xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200 group">
                  <img
                    src={imagesList[selectedImageIndex] || imagesList[0]}
                    alt={packageData.packageName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/images/dubai.png";
                    }}
                    className="w-full h-full object-cover transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent pointer-events-none" />

                  {/* Prev Arrow Button (<) */}
                  {imagesList.length > 1 && (
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 backdrop-blur-md flex items-center justify-center shadow-md transition-all border border-white/60"
                      title="Previous Image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Next Arrow Button (>) */}
                  {imagesList.length > 1 && (
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 backdrop-blur-md flex items-center justify-center shadow-md transition-all border border-white/60"
                      title="Next Image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Image Counter Badge (1 / 8) */}
                  <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-xl bg-slate-900/80 text-white backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-wider">
                    {selectedImageIndex + 1} / {imagesList.length}
                  </div>

                  {/* Share Floating Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2500);
                    }}
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 backdrop-blur-md flex items-center justify-center shadow-md transition-all border border-white/60"
                    title="Share Package"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {copied && (
                    <div className="absolute top-16 left-4 z-20 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700">
                      Link Copied!
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery Row */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`h-20 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all relative ${
                        selectedImageIndex === idx
                          ? "border-emerald-600 ring-2 ring-blue-600/30 scale-[1.02]"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt="Thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/assets/images/dubai.png";
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}

                  {/* View All Tile */}
                  <button
                    onClick={() => setSelectedImageIndex(0)}
                    className="h-20 sm:h-24 rounded-2xl border border-slate-200 bg-white flex flex-col items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-all p-2 space-y-1 shadow-sm"
                  >
                    <Grid className="w-5 h-5 text-slate-700" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">View All</span>
                  </button>
                </div>

              </div>

              {/* RIGHT COLUMN (≈35%): PACKAGE SUMMARY CARD */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-24">
                  
                  {/* Title & Rating */}
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      {packageData.packageName}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 font-extrabold text-slate-900">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{packageData.packageRating ? packageData.packageRating.toFixed(1) : "4.8"}</span>
                      </div>
                      <span className="text-slate-500 font-medium">
                        ({packageData.packageTotalRatings || 126} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{packageData.packageDestination}</span>
                    </div>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    {packageData.packageDescription}
                  </p>

                  {/* Package Metadata Grid (Duration | Group Size | Tour Type) */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                    <div className="space-y-0.5">
                      <div className="flex justify-center text-slate-600">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Duration</span>
                      <span className="text-[11px] font-black text-slate-900 block truncate">
                        {packageData.packageNights}N / {packageData.packageDays}D
                      </span>
                    </div>

                    <div className="space-y-0.5 border-x border-slate-200/80">
                      <div className="flex justify-center text-slate-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Group Size</span>
                      <span className="text-[11px] font-black text-slate-900 block truncate">
                        2 - 12 People
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-center text-slate-600">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Tour Type</span>
                      <span className="text-[11px] font-black text-slate-900 block truncate">
                        Couple / Family
                      </span>
                    </div>
                  </div>

                  {/* Pricing Section with Savings Badge */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Price Starting From
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">
                        ₹{hasOffer ? packageData.packageDiscountPrice : packageData.packagePrice}
                      </span>
                      {hasOffer && (
                        <span className="text-sm text-slate-400 line-through font-medium">
                          ${packageData.packagePrice}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">/ person</span>
                    </div>
                  </div>

                  {/* CTAs matching IMAGE 2 */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleBookPackage}
                      className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer"
                    >
                      <span>BOOK THIS PACKAGE</span>
                    </button>

                    <button
                      onClick={handleDownloadBrochure}
                      className="w-full py-3.5 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Download className="w-4 h-4 text-slate-700" />
                      <span>DOWNLOAD BROCHURE</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>

            {/* LOWER SECTION: TABS (LEFT) + INCLUSIONS CARD (RIGHT) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
              
              {/* LEFT SIDE (≈65%): TABS & TAB CONTENT */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                
                {/* Horizontal Tab Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm overflow-x-auto no-scrollbar flex items-center gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-3 rounded-xl text-xs font-extrabold tracking-wider transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Box */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm min-h-[360px]">
                  
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="font-extrabold text-xl text-slate-900">
                          About This Package
                        </h3>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed whitespace-pre-line">
                        {packageData.packageDescription}
                      </p>

                      {/* 4 Benefit Pills Matching IMAGE 2 */}
                      <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[11px] font-extrabold text-slate-900 block">
                              Best Price Guarantee
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                          <Headphones className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[11px] font-extrabold text-slate-900 block">
                              24/7 Customer Support
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                          <XCircle className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[11px] font-extrabold text-slate-900 block">
                              Free Cancellation
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium block">
                              Up to 7 days
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="text-[11px] font-extrabold text-slate-900 block">
                              Secure Booking
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ITINERARY */}
                  {activeTab === "itinerary" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="font-extrabold text-xl text-slate-900">
                          Day-by-Day Itinerary ({packageData.packageDays} Days)
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {Array.from({ length: packageData.packageDays || 1 }).map((_, i) => (
                          <div
                            key={i}
                            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase">
                                DAY {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                {i === 0
                                  ? "Arrival & Check-in"
                                  : i === packageData.packageDays - 1
                                  ? "Departure & Checkout"
                                  : "Guided Sightseeing"}
                              </span>
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {i === 0
                                ? `Welcome to ${packageData.packageDestination}`
                                : i === packageData.packageDays - 1
                                ? "Farewell & Airport Transfer"
                                : `Exploring ${packageData.packageDestination} Highlights`}
                            </h4>

                            <p className="text-xs text-slate-600 font-normal leading-relaxed">
                              {i === 0
                                ? `Arrive at the destination airport. Private luxury transfer to your accommodation (${packageData.packageAccommodation || "4-Star Hotel"}). Free evening to explore.`
                                : i === packageData.packageDays - 1
                                ? `Enjoy a hearty breakfast. Complete hotel checkout and transfer to airport for your onward journey.`
                                : `Full day guided excursion. ${packageData.packageActivities || "Enjoy curated sightseeing tours, cultural landmarks, and local dining experiences."}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: INCLUSIONS */}
                  {activeTab === "inclusions" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="font-extrabold text-xl text-slate-900">
                          Package Inclusions
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                            <Hotel className="w-4 h-4 text-blue-600" /> Accommodation
                          </div>
                          <p className="text-xs text-slate-600">
                            {packageData.packageAccommodation || "Premium hotel stay included"}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                            <Bus className="w-4 h-4 text-blue-600" /> Ground Transport
                          </div>
                          <p className="text-xs text-slate-600">
                            {packageData.packageTransportation || "Private AC vehicle transfers"}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                            <Utensils className="w-4 h-4 text-blue-600" /> Meal Plan
                          </div>
                          <p className="text-xs text-slate-600">
                            {packageData.packageMeals || "Daily breakfast & dinner included"}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                            <Compass className="w-4 h-4 text-blue-600" /> Sightseeing & Activities
                          </div>
                          <p className="text-xs text-slate-600">
                            {packageData.packageActivities || "Guided tours & attraction tickets"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: EXCLUSIONS */}
                  {activeTab === "exclusions" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="font-extrabold text-xl text-slate-900">
                          Package Exclusions
                        </h3>
                      </div>

                      <div className="space-y-3 text-xs text-slate-600">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>International and domestic airfare ticket charges</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>Personal expenses (laundry, telephone calls, tips)</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>Optional excursion charges and camera permits</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>Travel and medical insurance coverage</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: HOTELS */}
                  {activeTab === "hotels" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="font-extrabold text-xl text-slate-900">
                          Hotel & Stay Information
                        </h3>
                      </div>

                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">
                              Included Stay
                            </span>
                            <h4 className="font-extrabold text-lg text-slate-900">
                              {packageData.hotel?.hotelName || packageData.packageAccommodation || "Luxury 4-Star Resort Partner"}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {packageData.hotel?.location || packageData.packageDestination} • {packageData.packageNights} Nights
                            </p>
                            {packageData.hotel && (
                              <Link
                                to={`/hotel/${packageData.hotel._id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] hover:underline pt-1"
                              >
                                View Hotel Gallery & Details <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(4)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Enjoy comfortable rooms, complimentary Wi-Fi, swimming pool access, daily buffet breakfast, and 24-hour room service.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: REVIEWS */}
                  {activeTab === "reviews" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="font-extrabold text-xl text-slate-900">
                            Traveler Reviews
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Rating value={packageData.packageRating} precision={0.1} readOnly size="small" />
                            <span className="text-xs font-black text-slate-900">
                              {packageData.packageRating.toFixed(1)} / 5.0
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              ({packageData.packageTotalRatings} verified reviews)
                            </span>
                          </div>
                        </div>

                        <Link
                          to={`/package/ratings/${params.id}`}
                          className="text-xs font-extrabold text-blue-600 hover:underline"
                        >
                          View All
                        </Link>
                      </div>

                      {/* Write Review Form */}
                      {currentUser ? (
                        ratingGiven ? (
                          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Thank you! You have already submitted a review for this tour.
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-blue-600" /> Write a Review
                            </h4>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-700">Your Rating:</span>
                              <Rating
                                value={ratingsData.rating}
                                onChange={(e, newValue) =>
                                  setRatingsData({ ...ratingsData, rating: newValue })
                                }
                                precision={1}
                              />
                            </div>

                            <textarea
                              rows={3}
                              placeholder="Share your travel experience on this trip..."
                              value={ratingsData.review}
                              onChange={(e) =>
                                setRatingsData({ ...ratingsData, review: e.target.value })
                              }
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            />

                            <button
                              onClick={giveRating}
                              disabled={loading || !ratingsData.rating}
                              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Submit Review
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                          <span>Sign in to leave a rating and review for this trip.</span>
                          <Link to="/login" className="font-extrabold text-blue-600 hover:underline">
                            Sign In
                          </Link>
                        </div>
                      )}

                      {/* Review Cards Carousel */}
                      <RatingCard ratingData={packageRatings} packageRatings={packageRatings} />
                    </div>
                  )}

                  {/* TAB 7: FAQS */}
                  {activeTab === "faqs" && (
                    <div className="space-y-6">
                      <div className="border-b border-slate-100 pb-4">
                        <h3 className="font-extrabold text-xl text-slate-900">
                          Frequently Asked Questions
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {faqsList.map((faq, index) => {
                          const isOpen = openFaqIndex === index;
                          return (
                            <div
                              key={index}
                              className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50"
                            >
                              <button
                                onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                                className="w-full p-4 text-left font-extrabold text-xs text-slate-900 flex items-center justify-between gap-4 cursor-pointer"
                              >
                                <span>{faq.q}</span>
                                <ChevronDown
                                  className={`w-4 h-4 text-slate-500 transition-transform ${
                                    isOpen ? "rotate-180 text-blue-600" : ""
                                  }`}
                                />
                              </button>
                              {isOpen && (
                                <div className="px-4 pb-4 text-xs text-slate-600 font-normal leading-relaxed border-t border-slate-200/60 pt-3">
                                  {faq.a}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              {/* RIGHT SIDE (≈35%): PACKAGE INCLUSIONS CARD MATCHING IMAGE 2 */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-extrabold text-lg text-slate-900">
                      Package Inclusions
                    </h3>
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-700 font-semibold">
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{packageData.packageNights} Nights accommodation in 4-star hotel</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{packageData.packageMeals || "Daily breakfast"}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{packageData.packageTransportation || "Private airport transfers"}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{packageData.packageActivities || "All sightseeing on private basis"}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>English speaking guide</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Entrance fees to all attractions</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Welcome drink on arrival</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>All applicable taxes</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default PackageDetails;
