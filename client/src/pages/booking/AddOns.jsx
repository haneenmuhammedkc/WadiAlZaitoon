import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBooking } from "./BookingContext";
import { AVAILABLE_ADDONS } from "../../constants/booking.constants";
import { Sparkles, Plus, Check, Trash2, ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";

const AddOns = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromReview = location.state?.fromReview === true;

  const { packageId, bookingState, toggleAddOn, calculateTotals } = useBooking();
  const totals = calculateTotals();

  const handleContinue = (e) => {
    e.preventDefault();
    if (fromReview) {
      navigate(`/booking/${packageId}/review`);
      return;
    }
    navigate(`/booking/${packageId}/travellers`);
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6 font-sans">
      
      {/* Review-Edit Banner */}
      {fromReview && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm">
          <span>Editing Add-ons from Review Booking</span>
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
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Enhance Your Trip
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Make your journey more comfortable with these optional curated services.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(fromReview ? `/booking/${packageId}/review` : `/booking/${packageId}/travellers`)}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 underline underline-offset-4 self-start sm:self-auto cursor-pointer"
        >
          {fromReview ? "Done editing add-ons" : "Skip add-ons for now"}
        </button>
      </div>

      {/* Add-ons List */}
      <div className="grid grid-cols-1 gap-4">
        {AVAILABLE_ADDONS.map((addon) => {
          const isSelected = bookingState.selectedAddOns.some((a) => a.id === addon.id);

          return (
            <div
              key={addon.id}
              className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/20 shadow-md"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h3 className="font-bold text-sm text-slate-900">{addon.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  {addon.description}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="font-extrabold text-sm text-slate-900">
                    ₹{addon.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{addon.priceUnit}</span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAddOn(addon)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Selected Add-ons Summary */}
      {bookingState.selectedAddOns.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Selected Add-ons ({bookingState.selectedAddOns.length})
          </h4>

          <div className="space-y-2 text-xs">
            {bookingState.selectedAddOns.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-slate-700">
                <span className="font-semibold">{item.title}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">
                    ₹{(item.type === 'per_person' ? item.price * totals.totalPersons : item.price).toLocaleString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAddOn(item)}
                    className="text-emerald-600 hover:text-emerald-700 p-1 cursor-pointer"
                    title="Remove Add-on"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-100">
              <span>Add-ons Total:</span>
              <span className="text-emerald-600">₹{totals.addOnsTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation CTAs */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(fromReview ? `/booking/${packageId}/review` : `/booking/${packageId}/hotel`)}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{fromReview ? "Back to Review" : "Back"}</span>
        </button>

        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>{fromReview ? "SAVE & RETURN TO REVIEW" : "Continue to Traveller Details"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};

export default AddOns;

