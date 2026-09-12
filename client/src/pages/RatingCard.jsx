import { Rating } from "@mui/material";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Quote, User } from "lucide-react";

const RatingCard = ({ ratingData }) => {
  if (!ratingData || ratingData.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-500">
        No traveler reviews submitted yet.
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Autoplay, Pagination]}
      spaceBetween={24}
      slidesPerView={1}
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      className="pb-12"
    >
      {ratingData.map((rate, i) => (
        <SwiperSlide key={rate._id || i}>
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full space-y-4 relative">
            <Quote className="w-8 h-8 text-coral-100 absolute top-6 right-6 pointer-events-none" />

            <div className="space-y-3">
              <Rating
                value={Number(rate.rating || 5)}
                precision={0.5}
                readOnly
                size="small"
              />
              <p className="text-xs text-slate-700 font-normal leading-relaxed line-clamp-4">
                "{rate.review || "Wonderful tour experience with Wadi Al Zaitoon Tourism!"}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {rate.username || rate.user?.username || "Guest Traveler"}
                </h4>
                <span className="text-[10px] text-slate-400 font-medium block">Verified Customer</span>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default RatingCard;
