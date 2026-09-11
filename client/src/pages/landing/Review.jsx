import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Star,
  ShieldCheck,
  Users,
  Pencil,
  Sparkles,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const ServicesSection = () => {
  const reviewsData = [
    {
      id: 1,
      reviewerName: "Aarav Mehta",
      location: "Mumbai, India",
      rating: 5,
      date: "May 12, 2024",
      title: "An Unforgettable Bali Experience!",
      comment:
        "The Bali tour was beyond amazing! From the beautiful temples to the breathtaking beaches, everything was perfectly planned. The hotel, transfers, and local guide were excellent. Highly recommended!",
      gallery: [
        "/assets/images/bali.png",
        "/assets/images/dubai.png",
        "/assets/images/maldives.png",
        "/assets/images/thailand.png",
      ],
      verified: true,
      travelType: "Travelled as Couple",
    },
    {
      id: 2,
      reviewerName: "Priya Nair",
      location: "Bengaluru, India",
      rating: 5,
      date: "May 02, 2024",
      title: "Perfect Trip with Great Memories",
      comment:
        "Everything was well organized and hassle-free. The itinerary covered the best places in Bali. Our kids enjoyed a lot, especially the water activities. Thank you Wadi Al Zaitoon Tourism!",
      gallery: [
        "/assets/images/dubai.png",
        "/assets/images/bali.png",
        "/assets/images/thailand.png",
        "/assets/images/maldives.png",
      ],
      verified: true,
      travelType: "Travelled as Family",
    },
    {
      id: 3,
      reviewerName: "Rohan Kapoor",
      location: "Delhi, India",
      rating: 4,
      date: "Apr 28, 2024",
      title: "Great Service & Amazing Destination",
      comment:
        "The trip was fantastic! The hotels and sightseeing were top-notch. Only suggestion is to include more free time in the itinerary. Overall, a wonderful experience!",
      gallery: [
        "/assets/images/maldives.png",
        "/assets/images/thailand.png",
        "/assets/images/bali.png",
        "/assets/images/dubai.png",
      ],
      verified: true,
      travelType: "Travelled as Friends",
    },
  ];

  const ratingDistribution = [
    { stars: "5 Star", count: 98, pct: 78 },
    { stars: "4 Star", count: 22, pct: 17 },
    { stars: "3 Star", count: 4, pct: 3 },
    { stars: "2 Star", count: 1, pct: 1 },
    { stars: "1 Star", count: 1, pct: 1 },
  ];

  return (
    <section className="bg-slate-50/70 py-16 sm:py-24 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Header Area with Rating Summary Card */}
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Header Text */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-xs uppercase tracking-widest text-blue-600 font-extrabold inline-block">
                TRAVELER REVIEWS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                What Our Travelers Say
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-lg">
                Real experiences from our happy travelers
              </p>
            </div>

            {/* Rating Summary Card */}
            <div className="lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Left Side: Score & Overall Rating */}
                <div className="text-center sm:text-left shrink-0 space-y-1 sm:pr-6 sm:border-r sm:border-slate-100">
                  <div className="text-4xl sm:text-5xl font-black text-slate-900">
                    4.8
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    Excellent
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Based on 126 reviews
                  </div>
                </div>

                {/* Right Side: Rating Distribution Progress Bars */}
                <div className="w-full space-y-2">
                  {ratingDistribution.map((item) => (
                    <div
                      key={item.stars}
                      className="flex items-center gap-3 text-xs font-semibold text-slate-600"
                    >
                      <span className="w-12 shrink-0 text-slate-700">
                        {item.stars}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                      <span className="w-14 text-right shrink-0 text-slate-500 font-medium">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 3 Review Cards Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewsData.map((review) => (
            <StaggerItem key={review.id}>
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full justify-between space-y-4">
                <div className="space-y-4">
                  {/* Reviewer Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                          {review.reviewerName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{review.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center justify-end gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200 fill-slate-100"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium block mt-1">
                        {review.date}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight pt-1">
                    {review.title}
                  </h3>

                  {/* Review Body Text */}
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    "{review.comment}"
                  </p>

                  {/* 4-Image Horizontal Gallery */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {review.gallery.map((img, i) => (
                      <div
                        key={i}
                        className="h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100"
                      >
                        <img
                          src={img}
                          alt="Travel memory"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Verified Booking</span>
                  </div>
                  <div className="text-slate-300 font-light">|</div>
                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{review.travelType}</span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default ServicesSection;
