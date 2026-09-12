import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBooking } from "./BookingContext";
import { Calendar, Users, MapPin, Clock, ArrowRight, User, Heart, Compass, AlertCircle, Lock, ArrowLeft } from "lucide-react";
import { TRIP_TYPES, TRIP_TYPE_LABELS } from "../../constants/booking.constants";

const TravelDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromReview = location.state?.fromReview === true;

  const { packageId, packageData, bookingState, updateTravelDetails } = useBooking();
  const [errorMsg, setErrorMsg] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const isFamily = bookingState.tripType === TRIP_TYPES.FAMILY;

  const handleTripTypeSelect = (type) => {
    setErrorMsg("");
    if (type === TRIP_TYPES.SOLO) {
      updateTravelDetails({
        tripType: TRIP_TYPES.SOLO,
        adults: 1,
        children: 0,
        infants: 0,
        childAges: [],
      });
    } else if (type === TRIP_TYPES.COUPLE) {
      updateTravelDetails({
        tripType: TRIP_TYPES.COUPLE,
        adults: 2,
        children: 0,
        infants: 0,
        childAges: [],
      });
    } else if (type === TRIP_TYPES.FAMILY) {
      const initAdults = bookingState.tripType === TRIP_TYPES.FAMILY ? bookingState.adults : Math.max(1, bookingState.adults || 2);
      const initChildren = bookingState.tripType === TRIP_TYPES.FAMILY ? bookingState.children : 0;
      const initInfants = bookingState.tripType === TRIP_TYPES.FAMILY ? bookingState.infants : 0;
      const initChildAges = bookingState.tripType === TRIP_TYPES.FAMILY ? bookingState.childAges : [];

      updateTravelDetails({
        tripType: TRIP_TYPES.FAMILY,
        adults: initAdults,
        children: initChildren,
        infants: initInfants,
        childAges: initChildAges,
      });
    }
  };

  const handleAdultsChange = (val) => {
    if (!isFamily) return;
    const newAdults = Math.max(1, val);
    updateTravelDetails({ adults: newAdults });
  };

  const handleChildrenChange = (val) => {
    if (!isFamily) return;
    const newChildren = Math.max(0, val);
    let newAges = [...(bookingState.childAges || [])];
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
    if (!isFamily) return;
    const newAges = [...(bookingState.childAges || [])];
    newAges[index] = Number(age);
    updateTravelDetails({ childAges: newAges });
  };

  const handleInfantsChange = (val) => {
    if (!isFamily) return;
    updateTravelDetails({ infants: Math.max(0, val) });
  };

  const handleRoomsChange = (val) => {
    updateTravelDetails({ rooms: Math.max(1, val) });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!bookingState.departureDate) {
      setErrorMsg("Please select a valid departure date.");
      return;
    }

    if (!bookingState.tripType || !Object.values(TRIP_TYPES).includes(bookingState.tripType)) {
      setErrorMsg("Please select a trip type to continue.");
      return;
    }

    if (bookingState.tripType === TRIP_TYPES.SOLO && (bookingState.adults !== 1 || bookingState.children !== 0 || bookingState.infants !== 0)) {
      setErrorMsg("Solo Trip requires exactly 1 adult and 0 children/infants.");
      return;
    }

    if (bookingState.tripType === TRIP_TYPES.COUPLE && (bookingState.adults !== 2 || bookingState.children !== 0 || bookingState.infants !== 0)) {
      setErrorMsg("Couple Trip requires exactly 2 adults and 0 children/infants.");
      return;
    }

    if (bookingState.tripType === TRIP_TYPES.FAMILY && (bookingState.adults < 1 || bookingState.children < 0 || bookingState.infants < 0)) {
      setErrorMsg("Family Trip requires at least 1 adult.");
      return;
    }

    if (fromReview) {
      navigate(`/booking/${packageId}/review`);
      return;
    }

    navigate(`/booking/${packageId}/hotel`);
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6 font-sans">
      
      {/* Review-Edit Banner */}
      {fromReview && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm">
          <span>Editing Travel Details from Review Booking</span>
          <button
            type="button"
            onClick={() => navigate(`/booking/${packageId}/review`)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
          >
            ← Back to Review Booking
          </button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Plan Your Trip
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Select your preferred departure date, trip type, guest count, and room requirements.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

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

      {/* Trip Type Selection Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" /> How are you travelling?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose the type of trip that best describes your group.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* SOLO TRIP CARD */}
          <button
            type="button"
            onClick={() => handleTripTypeSelect(TRIP_TYPES.SOLO)}
            aria-pressed={bookingState.tripType === TRIP_TYPES.SOLO}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              bookingState.tripType === TRIP_TYPES.SOLO
                ? "border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600/30"
                : "border-slate-200/80 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                bookingState.tripType === TRIP_TYPES.SOLO ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                <User className="w-4 h-4" />
              </div>
              {bookingState.tripType === TRIP_TYPES.SOLO && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  Selected
                </span>
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">SOLO TRIP</h4>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">1 Traveller</p>
              <p className="text-[11px] text-slate-500">1 Adult</p>
            </div>
          </button>

          {/* COUPLE TRIP CARD */}
          <button
            type="button"
            onClick={() => handleTripTypeSelect(TRIP_TYPES.COUPLE)}
            aria-pressed={bookingState.tripType === TRIP_TYPES.COUPLE}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              bookingState.tripType === TRIP_TYPES.COUPLE
                ? "border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600/30"
                : "border-slate-200/80 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                bookingState.tripType === TRIP_TYPES.COUPLE ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                <Heart className="w-4 h-4" />
              </div>
              {bookingState.tripType === TRIP_TYPES.COUPLE && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  Selected
                </span>
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">COUPLE TRIP</h4>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">2 Travellers</p>
              <p className="text-[11px] text-slate-500">2 Adults</p>
            </div>
          </button>

          {/* FAMILY TRIP CARD */}
          <button
            type="button"
            onClick={() => handleTripTypeSelect(TRIP_TYPES.FAMILY)}
            aria-pressed={bookingState.tripType === TRIP_TYPES.FAMILY}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              bookingState.tripType === TRIP_TYPES.FAMILY
                ? "border-emerald-600 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-600/30"
                : "border-slate-200/80 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                bookingState.tripType === TRIP_TYPES.FAMILY ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                <Users className="w-4 h-4" />
              </div>
              {bookingState.tripType === TRIP_TYPES.FAMILY && (
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  Selected
                </span>
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">FAMILY TRIP</h4>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">Custom Group</p>
              <p className="text-[11px] text-slate-500">Choose your travellers</p>
            </div>
          </button>
        </div>
      </div>

      {/* Guests Counter Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" /> Guests & Room Occupancy
          </h3>
          
          {!isFamily && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Guest count is fixed for {TRIP_TYPE_LABELS[bookingState.tripType] || "this trip type"}.</span>
            </span>
          )}
        </div>

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
                disabled={!isFamily || bookingState.adults <= 1}
                onClick={() => handleAdultsChange(bookingState.adults - 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-900 cursor-pointer"
              >
                -
              </button>
              <span className="font-bold text-sm text-slate-900 w-4 text-center">
                {bookingState.adults}
              </span>
              <button
                type="button"
                disabled={!isFamily}
                onClick={() => handleAdultsChange(bookingState.adults + 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-900 cursor-pointer"
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
                disabled={!isFamily || bookingState.children <= 0}
                onClick={() => handleChildrenChange(bookingState.children - 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-900 cursor-pointer"
              >
                -
              </button>
              <span className="font-bold text-sm text-slate-900 w-4 text-center">
                {bookingState.children}
              </span>
              <button
                type="button"
                disabled={!isFamily}
                onClick={() => handleChildrenChange(bookingState.children + 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-900 cursor-pointer"
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
                disabled={!isFamily || bookingState.infants <= 0}
                onClick={() => handleInfantsChange(bookingState.infants - 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-900 cursor-pointer"
              >
                -
              </button>
              <span className="font-bold text-sm text-slate-900 w-4 text-center">
                {bookingState.infants}
              </span>
              <button
                type="button"
                disabled={!isFamily}
                onClick={() => handleInfantsChange(bookingState.infants + 1)}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-900 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic Child Ages Selector */}
        {isFamily && bookingState.children > 0 && (
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3 pt-3">
            <span className="text-xs font-bold text-slate-900 block">Specify Child Ages:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bookingState.childAges.map((age, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Child {idx + 1} Age</label>
                  <select
                    value={age}
                    onChange={(e) => handleChildAgeChange(idx, e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
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

        {/* Room Counter & Occupancy Summary (Only shown for Family Trips) */}
        {isFamily && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-900">Number of Rooms:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleRoomsChange(bookingState.rooms - 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="font-bold text-sm text-slate-900 w-4 text-center">
                  {bookingState.rooms}
                </span>
                <button
                  type="button"
                  onClick={() => handleRoomsChange(bookingState.rooms + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
              Room Occupancy: <span className="font-bold text-slate-900">{bookingState.adults} Adults{bookingState.children > 0 ? ` + ${bookingState.children} Child` : ""}</span>
            </div>
          </div>
        )}


      </div>

      {/* Navigation CTA */}
      <div className="flex items-center justify-between pt-2">
        {fromReview && (
          <button
            type="button"
            onClick={() => navigate(`/booking/${packageId}/review`)}
            className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Review</span>
          </button>
        )}
        <button
          type="submit"
          className={`px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer ${!fromReview ? "ml-auto" : ""}`}
        >
          <span>{fromReview ? "SAVE & RETURN TO REVIEW" : "Continue to Hotel"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};

export default TravelDetails;
