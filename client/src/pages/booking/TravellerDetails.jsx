import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useBooking } from "./BookingContext";
import { User, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft, Mail, Phone, Lock } from "lucide-react";

const TravellerDetails = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { packageId, bookingState, updateTravellerDetails } = useBooking();

  const totalGuestsCount = Math.max(1, (bookingState.adults || 1) + (bookingState.children || 0));

  // Lead Traveller Form State
  const [lead, setLead] = useState({
    fullName: bookingState.leadTraveller?.fullName || currentUser?.username || "",
    email: bookingState.leadTraveller?.email || currentUser?.email || "",
    phone: bookingState.leadTraveller?.phone || currentUser?.phone || "",
    dob: bookingState.leadTraveller?.dob || "1992-05-15",
    gender: bookingState.leadTraveller?.gender || "Male",
    nationality: bookingState.leadTraveller?.nationality || "Indian",
    idType: bookingState.leadTraveller?.idType || "Passport",
    idNumber: bookingState.leadTraveller?.idNumber || "",
  });

  // Additional Travellers Form State
  const [additionals, setAdditionals] = useState(() => {
    const existing = bookingState.additionalTravellers || [];
    const needed = totalGuestsCount - 1;
    const result = [];
    for (let i = 0; i < needed; i++) {
      if (existing[i]) {
        result.push(existing[i]);
      } else {
        result.push({
          fullName: "",
          age: 25,
          gender: "Male",
          idType: "Passport",
          idNumber: "",
        });
      }
    }
    return result;
  });

  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);

  const handleLeadChange = (e) => {
    setLead({ ...lead, [e.target.id]: e.target.value });
  };

  const handleAdditionalChange = (index, field, value) => {
    const updated = [...additionals];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionals(updated);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!lead.fullName || !lead.email || !lead.phone || !lead.idNumber) {
      alert("Please complete all required fields for the Lead Traveller.");
      return;
    }

    for (let i = 0; i < additionals.length; i++) {
      if (!additionals[i].fullName || !additionals[i].idNumber) {
        alert(`Please complete the full name and document number for Traveller #${i + 2}.`);
        return;
      }
    }

    if (!confirmedAccuracy) {
      alert("Please confirm that all traveller details match official IDs.");
      return;
    }

    updateTravellerDetails(lead, additionals);
    navigate(`/booking/${packageId}/review`);
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Traveller Information
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your details exactly as they appear on your official government passport or ID.
        </p>
      </div>

      {/* LEAD TRAVELLER FORM */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" /> Lead Traveller (Traveller 1)
          </h3>
          <span className="text-[10px] font-extrabold uppercase bg-slate-900 text-white px-2 py-0.5 rounded-full">
            Primary Contact
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
              Full Legal Name (as on Passport) *
            </label>
            <input
              type="text"
              id="fullName"
              value={lead.fullName}
              onChange={handleLeadChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="dob" className="text-xs font-semibold text-slate-700">
              Date of Birth *
            </label>
            <input
              type="date"
              id="dob"
              value={lead.dob}
              onChange={handleLeadChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="gender" className="text-xs font-semibold text-slate-700">
              Gender *
            </label>
            <select
              id="gender"
              value={lead.gender}
              onChange={handleLeadChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="nationality" className="text-xs font-semibold text-slate-700">
              Nationality *
            </label>
            <input
              type="text"
              id="nationality"
              value={lead.nationality}
              onChange={handleLeadChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="idType" className="text-xs font-semibold text-slate-700">
              Identification Document Type *
            </label>
            <select
              id="idType"
              value={lead.idType}
              onChange={handleLeadChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
            >
              <option value="Passport">Passport</option>
              <option value="National_ID">National ID / Aadhaar</option>
              <option value="Driving_License">Driving License</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="idNumber" className="text-xs font-semibold text-slate-700">
              Document Number *
            </label>
            <input
              type="text"
              id="idNumber"
              value={lead.idNumber}
              onChange={handleLeadChange}
              placeholder="e.g. Z1234567"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={lead.email}
              onChange={handleLeadChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile Phone Number *
            </label>
            <input
              type="text"
              id="phone"
              value={lead.phone}
              onChange={handleLeadChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
              required
            />
          </div>
        </div>
      </div>

      {/* DYNAMIC ADDITIONAL TRAVELLERS FORMS */}
      {additionals.map((t, idx) => (
        <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-slate-500" /> Traveller #{idx + 2} Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Full Legal Name *
              </label>
              <input
                type="text"
                value={t.fullName}
                onChange={(e) => handleAdditionalChange(idx, "fullName", e.target.value)}
                placeholder="Full name as on ID"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Age *
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={t.age}
                onChange={(e) => handleAdditionalChange(idx, "age", Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Gender *
              </label>
              <select
                value={t.gender}
                onChange={(e) => handleAdditionalChange(idx, "gender", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Document Number *
              </label>
              <input
                type="text"
                value={t.idNumber}
                onChange={(e) => handleAdditionalChange(idx, "idNumber", e.target.value)}
                placeholder="Passport / ID number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                required
              />
            </div>
          </div>
        </div>
      ))}

      {/* Important Notice & Accuracy Confirmation */}
      <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
        <div className="flex items-start gap-2 text-amber-900 text-xs font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Official Identification Notice</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed font-medium">
          Please make sure all traveller information matches your official passport or government-issued ID exactly. Incorrect names or document numbers may affect hotel check-in and travel permits.
        </p>

        <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmedAccuracy}
            onChange={(e) => setConfirmedAccuracy(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            required
          />
          <span className="text-xs font-bold text-slate-900">
            I confirm that all traveller details provided above are accurate and match official IDs.
          </span>
        </label>
      </div>

      {/* Navigation CTAs */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(`/booking/${packageId}/add-ons`)}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <span>Continue to Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};

export default TravellerDetails;
