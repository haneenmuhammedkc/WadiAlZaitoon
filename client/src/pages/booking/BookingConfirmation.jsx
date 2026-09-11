import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useBooking } from "./BookingContext";
import axiosInstance from "../../services/axiosInstance";
import { CheckCircle2, Download, MapPin, Calendar, Users, Hotel as HotelIcon, ArrowRight, ShieldCheck } from "lucide-react";

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { packageData, bookingState, confirmedBooking, clearBookingState, calculateTotals } = useBooking();
  const totals = calculateTotals();

  const bookingId = searchParams.get("bookingId") || confirmedBooking?.bookingId;

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Clear temporary session storage state on successful confirmation
    clearBookingState();
  }, []);

  const handleDownloadInvoice = async () => {
    if (!bookingId) {
      alert("Booking ID unavailable for invoice download.");
      return;
    }
    try {
      setDownloading(true);
      const response = await axiosInstance.get(`/booking/${bookingId}/invoice`, {
        responseType: "blob",
        headers: {
          Accept: "application/pdf",
        },
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloading(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to download invoice.");
      setDownloading(false);
    }
  };

  const formattedDeparture = bookingState.departureDate
    ? new Date(bookingState.departureDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Confirmed";

  return (
    <div className="space-y-6 font-sans">
      
      {/* Success Hero Banner */}
      <div className="p-8 rounded-3xl bg-emerald-950 text-white border border-emerald-800/60 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/40 mb-2">
            Status: CONFIRMED
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-xs text-emerald-200/90 max-w-md mx-auto mt-1">
            Your trip reservation has been verified and confirmed on our system.
          </p>
        </div>

        {bookingId && (
          <div className="pt-2">
            <span className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider block">Official Booking Reference</span>
            <span className="font-mono font-bold text-sm text-white bg-emerald-900/80 px-4 py-1.5 rounded-xl inline-block border border-emerald-700/60 mt-1">
              {bookingId}
            </span>
          </div>
        )}
      </div>

      {/* Confirmed Reservation Details */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Confirmed Trip Details
        </h3>

        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Departure Date</span>
            <span className="font-bold text-slate-900">{formattedDeparture}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Guests</span>
            <span className="font-bold text-slate-900">{totals.totalPersons} Guests</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Payment Status</span>
            <span className="font-bold text-emerald-600">Captured (Paid)</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Total Paid</span>
            <span className="font-bold text-slate-900">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* What Happens Next Card */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> What Happens Next?
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          You can view your confirmed booking at any time under your profile's <span className="font-bold text-slate-900">My Bookings</span> dashboard. You can also download your official PDF Tax Invoice below.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          <span>{downloading ? "Generating PDF..." : "Download Official Invoice"}</span>
        </button>

        <Link
          to="/profile/user"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <span>View My Bookings</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

export default BookingConfirmation;
