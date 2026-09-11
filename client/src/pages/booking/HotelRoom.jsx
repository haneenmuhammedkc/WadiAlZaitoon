import React from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "./BookingContext";
import { ROOM_TYPES } from "../../constants/booking.constants";
import { Hotel as HotelIcon, Star, CheckCircle, ArrowRight, ArrowLeft, Coffee, Wifi, Waves, ShieldCheck } from "lucide-react";

const HotelRoom = () => {
  const navigate = useNavigate();
  const { packageId, packageData, bookingState, updateSelectedRoom } = useBooking();

  const hotel = packageData?.hotel || null;
  const hotelName = hotel?.hotelName || packageData?.packageAccommodation || "Partner Luxury Hotel Stay";
  const location = hotel?.location || packageData?.packageDestination || "Destination Resort Area";
  const rating = hotel?.rating || 4.8;
  const images = hotel?.hotelImages && hotel.hotelImages.length > 0
    ? hotel.hotelImages
    : packageData?.packageImages && packageData.packageImages.length > 0
    ? packageData.packageImages
    : ["/assets/bg_jmg1.jpg"];

  const handleContinue = (e) => {
    e.preventDefault();
    if (!bookingState.selectedRoom) {
      alert("Please select a room option to proceed.");
      return;
    }
    navigate(`/booking/${packageId}/add-ons`);
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Choose Your Stay
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review accommodation inclusions and select your preferred room category.
        </p>
      </div>

      {/* Hotel Overview Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <HotelIcon className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">{hotelName}</h3>
                <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-1" /> {rating}
                </span>
              </div>
              <p className="text-xs text-slate-500">{location} • {packageData?.packageNights} Nights Stay</p>
            </div>
          </div>
        </div>

        {/* Gallery Snippet */}
        <div className="grid grid-cols-3 gap-3">
          {images.slice(0, 3).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={hotelName}
              className="w-full h-24 sm:h-32 rounded-xl object-cover border border-slate-200"
            />
          ))}
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700 pt-1">
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <Coffee className="w-3.5 h-3.5 text-emerald-600" /> Breakfast Included
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" /> Free High-Speed Wi-Fi
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <Waves className="w-3.5 h-3.5 text-emerald-600" /> Swimming Pool & Spa
          </span>
        </div>
      </div>

      {/* Room Category Selection */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Available Room Categories
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {ROOM_TYPES.map((room) => {
            const isSelected = bookingState.selectedRoom?.id === room.id;

            return (
              <div
                key={room.id}
                onClick={() => updateSelectedRoom(room)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/20 shadow-md"
                    : "border-slate-200/80 bg-white hover:border-slate-300"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{room.name}</h4>
                    <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-white px-2 py-0.5 rounded-full">
                      {room.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    {room.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 pt-1">
                    {room.features.map((feat, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 font-medium block">Room Status</span>
                    <span className="text-xs font-bold text-emerald-600">Available</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateSelectedRoom(room)}
                    className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm flex items-center gap-1"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Selected
                      </>
                    ) : (
                      "Select Room"
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Selected State Notice */}
      {bookingState.selectedRoom && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">Current Selection</span>
            <span className="font-bold text-sm">{bookingState.selectedRoom.name}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-300 font-medium">{packageData?.packageNights} Nights • {bookingState.rooms} Room</span>
          </div>
        </div>
      )}

      {/* Navigation CTAs */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(`/booking/${packageId}/travel`)}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>Continue to Add-ons</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};

export default HotelRoom;
