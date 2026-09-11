import React from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "./BookingContext";
import { Calendar, Users, MapPin, Clock, ArrowRight, ShieldCheck } from "lucide-react";

const TravelDetails = () => {
  const navigate = useNavigate();
  const { packageId, packageData, bookingState, updateTravelDetails } = useBooking();

  const today = new Date().toISOString().split("T")[0];

  const handleAdultsChange = (val) => {
    const newAdults = Math.max(1, val);
    updateTravelDetails({ adults: newAdults });
  };

  const handleChildrenChange = (val) => {
    const newChildren = Math.max(0, val);
    let newAges = [...bookingState.childAges];
    if (newChildren > newAges.length) {
      while (newAges.length < newChildren) {
        newAges.push(5);
      }
    } else {
      newAges = newAges.slice(0, newChildren);
    }
    updateTravelDetails({ children: newChildren, childAges: newAges });
  };

  const handleChildAgeChange = (index, age) => {
    const newAges = [...bookingState.childAges];
    newAges[index] = Number(age);
    updateTravelDetails({ childAges: newAges });
  };

  const handleInfantsChange = (val) => {
    updateTravelDetails({ infants: Math.max(0, val) });
  };

  const handleRoomsChange = (val) => {
    updateTravelDetails({ rooms: Math.max(1, val) });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!bookingState.departureDate) {
      alert("Please select a valid departure date.");
      return;
    }
    navigate(`/booking/${packageId}/hotel`);
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Plan Your Trip
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select your preferred departure date, guest count, and room requirements.
        </p>
      </div>

      {/* Selected Package Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={packageData?.packageImages?.[0] || "/assets/bg_jmg1.jpg"}
            alt={packageData?.packageName}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Selected Package</span>
            <h3 className="font-bold text-sm text-slate-900">{packageData?.packageName}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> {packageData?.packageDestination}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {packageData?.packageDays} Days / {packageData?.packageNights} Nights</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting From</span>
          <span className="text-lg font-black text-slate-900">
            ₹{(packageData?.packageOffer && packageData?.packageDiscountPrice > 0 ? packageData?.packageDiscountPrice : packageData?.packagePrice || 0).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 block">/ person</span>
        </div>
      </div>

      {/* Travel Dates Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Calendar className="w-4 h-4 text-emerald-600" /> When are you travelling?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="departureDate" className="text-xs font-semibold text-slate-700">
              Departure Date *
            </label>
            <input
              type="date"
              id="departureDate"
              min={today}
              value={bookingState.departureDate}
              onChange={(e) => updateTravelDetails({ departureDate: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Return Date (Auto-calculated)
            </label>
            <input
              type="date"
              value={bookingState.returnDate}
              disabled
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 cursor-not-allowed font-medium"
            />
            <p className="text-[10px] text-slate-400">
              Based on {packageData?.packageDays} Days / {packageData?.packageNights} Nights itinerary
            </p>
          </div>
        </div>
      </div>

      {/* Guests Counter Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="w-4 h-4 text-emerald-600" /> Guests & Room Occupancy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Adults */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Adults</span>
              <span className="text-[10px] text-slate-500">Age 12+ yrs</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAdultsChange(bookingState.adults - 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                -
              </button>
              <span className="font-bold text-sm text-slate-900 w-4 text-center">
                {bookingState.adults}
              </span>
              <button
                type="button"
                onClick={() => handleAdultsChange(bookingState.adults + 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Children</span>
              <span className="text-[10px] text-slate-500">Age 2-11 yrs</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleChildrenChange(bookingState.children - 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                -
              </button>
              <span className="font-bold text-sm text-slate-900 w-4 text-center">
                {bookingState.children}
              </span>
              <button
                type="button"
                onClick={() => handleChildrenChange(bookingState.children + 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Infants</span>
              <span className="text-[10px] text-slate-500">Under 2 yrs</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleInfantsChange(bookingState.infants - 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                -
              </button>
              <span className="font-bold text-sm text-slate-900 w-4 text-center">
                {bookingState.infants}
              </span>
              <button
                type="button"
                onClick={() => handleInfantsChange(bookingState.infants + 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic Child Ages Selector */}
        {bookingState.children > 0 && (
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3 pt-3">
            <span className="text-xs font-bold text-slate-900 block">Specify Child Ages:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bookingState.childAges.map((age, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Child {idx + 1} Age</label>
                  <select
                    value={age}
                    onChange={(e) => handleChildAgeChange(idx, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900"
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 2} value={i + 2}>{i + 2} years</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Room Counter & Occupancy Summary */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-900">Number of Rooms:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleRoomsChange(bookingState.rooms - 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                -
              </button>
              <span className="font-bold text-sm text-slate-900 w-4 text-center">
                {bookingState.rooms}
              </span>
              <button
                type="button"
                onClick={() => handleRoomsChange(bookingState.rooms + 1)}
                className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
            Room Occupancy: <span className="font-bold text-slate-900">{bookingState.adults} Adults{bookingState.children > 0 ? ` + ${bookingState.children} Child` : ""}</span>
          </div>
        </div>

      </div>

      {/* Navigation CTA */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>Continue to Hotel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};

export default TravelDetails;
