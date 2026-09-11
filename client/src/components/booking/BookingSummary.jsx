import React from "react";
import { useBooking } from "../../pages/booking/BookingContext";
import { MapPin, Clock, Calendar, Users, Hotel as HotelIcon, ShieldCheck, CheckCircle2 } from "lucide-react";

const BookingSummary = () => {
  const { packageData, bookingState, calculateTotals } = useBooking();
  const totals = calculateTotals();

  const formattedDeparture = bookingState.departureDate
    ? new Date(bookingState.departureDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not selected";

  const formattedReturn = bookingState.returnDate
    ? new Date(bookingState.returnDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not selected";

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 sticky top-20 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Your Trip Summary</h3>
        <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
          Step Summary
        </span>
      </div>

      {/* Package Header */}
      <div className="flex gap-3">
        <img
          src={packageData?.packageImages?.[0] || "/assets/bg_jmg1.jpg"}
          alt={packageData?.packageName}
          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
        />
        <div className="space-y-1">
          <h4 className="font-bold text-xs text-slate-900 line-clamp-2">
            {packageData?.packageName}
          </h4>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" /> {packageData?.packageDestination}
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" /> {packageData?.packageDays} Days / {packageData?.packageNights} Nights
          </p>
        </div>
      </div>

      {/* Travel Logistics Snapshot */}
      <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Travel Dates
          </span>
          <span className="font-semibold text-slate-900 text-[11px]">
            {formattedDeparture} - {formattedReturn}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1 text-[11px]">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Guests
          </span>
          <span className="font-semibold text-slate-900 text-[11px]">
            {bookingState.adults} {bookingState.adults === 1 ? "Adult" : "Adults"}
            {bookingState.children > 0 && `, ${bookingState.children} Child`}
            {bookingState.infants > 0 && `, ${bookingState.infants} Infant`}
          </span>
        </div>

        {bookingState.selectedRoom && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
              <HotelIcon className="w-3.5 h-3.5 text-slate-400" /> Room
            </span>
            <span className="font-semibold text-slate-900 text-[11px] truncate max-w-[130px]" title={bookingState.selectedRoom.name}>
              {bookingState.selectedRoom.name}
            </span>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Base Package ({totals.totalPersons} x ₹{totals.unitPrice.toLocaleString('en-IN')})</span>
          <span className="font-semibold text-slate-900">₹{totals.baseTotal.toLocaleString('en-IN')}</span>
        </div>

        {totals.roomMultiplier > 1 && (
          <div className="flex justify-between text-slate-600">
            <span>Room Upgrade Supplement</span>
            <span className="font-semibold text-slate-900">+₹{(totals.roomTotal - totals.baseTotal).toLocaleString('en-IN')}</span>
          </div>
        )}

        {totals.addOnsTotal > 0 && (
          <div className="flex justify-between text-slate-600">
            <span>Add-ons ({bookingState.selectedAddOns.length})</span>
            <span className="font-semibold text-slate-900">+₹{totals.addOnsTotal.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
          <span>Estimated Total</span>
          <span className="text-emerald-600">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Security Info Pill */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Server-Authoritative Price
        </div>
        <p className="leading-normal text-slate-500 text-[10px]">
          Final order total is calculated securely on the server prior to Razorpay checkout.
        </p>
      </div>

    </div>
  );
};

export default BookingSummary;
