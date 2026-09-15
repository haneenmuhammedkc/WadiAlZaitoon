import { useNavigate, Link } from "react-router-dom";
import { useBooking } from "./BookingContext";
import { CheckCircle2, Edit3, MapPin, Calendar, Users, Hotel as HotelIcon, Sparkles, User, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { TRIP_TYPE_LABELS } from "../../constants/booking.constants";

const ReviewBooking = () => {
  const navigate = useNavigate();
  const { packageId, packageData, bookingState, updateTermsAcceptance, calculateTotals } = useBooking();
  const totals = calculateTotals();

  const [termsAccepted, setTermsAccepted] = useState(bookingState.termsAccepted || false);
  const [cancellationPolicyAccepted, setCancellationPolicyAccepted] = useState(bookingState.cancellationPolicyAccepted || bookingState.policyAccepted || false);
  const [detailsConfirmed, setDetailsConfirmed] = useState(bookingState.detailsConfirmed || false);

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

  const handleContinue = (e) => {
    e.preventDefault();
    if (!termsAccepted || !cancellationPolicyAccepted || !detailsConfirmed) {
      alert("Please agree to the Terms & Conditions, Cancellation & Refund Policy, and confirm all booking details.");
      return;
    }
    updateTermsAcceptance(termsAccepted, detailsConfirmed, cancellationPolicyAccepted);
    navigate(`/booking/${packageId}/payment`);
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Review Your Booking
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Verify all reservation details carefully before proceeding to payment.
        </p>
      </div>

      {/* SECTION 1: PACKAGE SUMMARY */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            1. Package Itinerary
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <img
            src={packageData?.packageImages?.[0] || "/assets/bg_jmg1.jpg"}
            alt={packageData?.packageName}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div>
            <h4 className="font-bold text-sm text-slate-900">{packageData?.packageName}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {packageData?.packageDestination}
            </p>
            <p className="text-xs text-slate-500">{packageData?.packageDays} Days / {packageData?.packageNights} Nights</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: TRAVEL DATES & GUESTS */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            2. Dates & Guest Logistics
          </h3>
          <button
            type="button"
            onClick={() => navigate(`/booking/${packageId}/travel`, { state: { fromReview: true } })}
            className="text-xs font-bold text-emerald-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Trip Type</span>
            <span className="font-bold text-slate-900">{TRIP_TYPE_LABELS[bookingState.tripType] || "Couple Trip"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Departure</span>
            <span className="font-bold text-slate-900">{formattedDeparture}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Return</span>
            <span className="font-bold text-slate-900">{formattedReturn}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Guests</span>
            <span className="font-bold text-slate-900">
              {bookingState.adults} Adults{bookingState.children > 0 ? `, ${bookingState.children} Child` : ""}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Rooms</span>
            <span className="font-bold text-slate-900">{bookingState.rooms} Room</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: HOTEL & ROOM */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            3. Accommodation Stay
          </h3>
          <button
            type="button"
            onClick={() => navigate(`/booking/${packageId}/hotel`, { state: { fromReview: true } })}
            className="text-xs font-bold text-emerald-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="text-xs space-y-1">
          <span className="font-bold text-slate-900 text-sm">
            {packageData?.hotel?.hotelName || packageData?.packageAccommodation || "Partner Hotel Stay"}
          </span>
          <p className="text-slate-500">
            Room Type: <span className="font-semibold text-slate-900">{bookingState.selectedRoom?.name || "Standard Room"}</span> ({packageData?.packageNights} Nights)
          </p>
        </div>
      </div>

      {/* SECTION 4: ADD-ONS */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            4. Selected Add-ons
          </h3>
          <button
            type="button"
            onClick={() => navigate(`/booking/${packageId}/add-ons`, { state: { fromReview: true } })}
            className="text-xs font-bold text-emerald-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        {bookingState.selectedAddOns.length > 0 ? (
          <div className="space-y-1.5 text-xs">
            {bookingState.selectedAddOns.map((addon) => (
              <div key={addon.id} className="flex justify-between text-slate-700">
                <span>✓ {addon.title}</span>
                <span className="font-semibold text-slate-900">
                  ₹{(addon.type === 'per_person' ? addon.price * totals.totalPersons : addon.price).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No optional add-on services selected.</p>
        )}
      </div>

      {/* SECTION 5: LEAD TRAVELLER */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
            5. Lead Traveller Contact
          </h3>
          <button
            type="button"
            onClick={() => navigate(`/booking/${packageId}/travellers`, { state: { fromReview: true } })}
            className="text-xs font-bold text-emerald-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Lead Name</span>
            <span className="font-bold text-slate-900">{bookingState.leadTraveller?.fullName || "Not specified"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Email</span>
            <span className="font-bold text-slate-900 truncate block">{bookingState.leadTraveller?.email}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Mobile</span>
            <span className="font-bold text-slate-900">{bookingState.leadTraveller?.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Document Number</span>
            <span className="font-bold text-slate-900">{bookingState.leadTraveller?.idNumber || "Z1234567"}</span>
          </div>
        </div>
      </div>

      {/* FINAL PRICE SUMMARY TABLE */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Final Payment Breakdown
        </h3>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex justify-between">
            <span>Base Package Rate ({totals.totalPersons} Guests x ₹{totals.unitPrice.toLocaleString('en-IN')})</span>
            <span className="font-semibold text-slate-900">₹{totals.baseTotal.toLocaleString('en-IN')}</span>
          </div>

          {totals.roomMultiplier > 1 && (
            <div className="flex justify-between">
              <span>Room Upgrade Category ({bookingState.selectedRoom?.name})</span>
              <span className="font-semibold text-slate-900">+₹{(totals.roomTotal - totals.baseTotal).toLocaleString('en-IN')}</span>
            </div>
          )}

          {totals.addOnsTotal > 0 && (
            <div className="flex justify-between">
              <span>Selected Add-ons</span>
              <span className="font-semibold text-slate-900">+₹{totals.addOnsTotal.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-900 font-black text-lg pt-3 border-t border-slate-200">
            <span>Total Payable Amount:</span>
            <span className="text-emerald-600">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Terms & Confirmation Checkboxes */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
            required
          />
          <span className="text-xs font-semibold text-slate-800">
            I agree to the{" "}
            <Link to="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">
              Terms & Conditions
            </Link>.
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={cancellationPolicyAccepted}
            onChange={(e) => setCancellationPolicyAccepted(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
            required
          />
          <span className="text-xs font-semibold text-slate-800">
            I agree to the{" "}
            <Link to="/terms-and-conditions#cancellation-refund" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">
              Cancellation & Refund Policy
            </Link>.
          </span>
        </label>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={detailsConfirmed}
            onChange={(e) => setDetailsConfirmed(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
            required
          />
          <span className="text-xs font-semibold text-slate-800">
            I confirm that all traveller and booking details provided are correct.
          </span>
        </label>
      </div>

      {/* Navigation CTAs */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(`/booking/${packageId}/travellers`)}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>Continue to Secure Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};

export default ReviewBooking;
