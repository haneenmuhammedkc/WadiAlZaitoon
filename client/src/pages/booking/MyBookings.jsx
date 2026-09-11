import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Search, Calendar, MapPin, XCircle, Compass, ArrowRight, RefreshCw, CreditCard, Users, FileText, CheckCircle, AlertCircle, X, ShieldAlert } from "lucide-react";
import { getUserCurrentBookings, cancelBooking, downloadInvoice } from "../../services/bookingService";
import { retryOrder, verifyPayment } from "../../services/paymentService";
import { getTravellers, submitTravellers } from "../../services/travellerService";
import { StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const MyBookings = () => {
  const { user: currentUser } = useAuth();
  const [currentBookings, setCurrentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [retryingId, setRetryingId] = useState(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

  const handleDownloadInvoice = async (bookingId) => {
    if (downloadingInvoiceId) return;
    try {
      setDownloadingInvoiceId(bookingId);
      const blob = await downloadInvoice(bookingId);
      if (blob?.success === false) {
        alert(blob.message || "Failed to download invoice.");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `INV-${bookingId.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Invoice Error: " + err.message);
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  // Manifest Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [manifestForms, setManifestForms] = useState([]);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [manifestSaving, setManifestSaving] = useState(false);
  const [manifestError, setManifestError] = useState(null);
  const [manifestSuccess, setManifestSuccess] = useState(null);

  const getAllBookings = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      const data = await getUserCurrentBookings(currentUser._id);
      if (data?.success) {
        setCurrentBookings(data?.bookings || []);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(data?.message || "Failed to load active bookings");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, [searchTerm, currentUser]);

  const handleCancel = async (id) => {
    if (!currentUser?._id) return;
    const confirmCancel = window.confirm("Are you sure you want to cancel this reservation?");
    if (!confirmCancel) return;

    try {
      setLoading(true);
      const data = await cancelBooking(id, currentUser._id);
      if (data?.success) {
        setLoading(false);
        alert(data?.message || "Booking Cancelled!");
        getAllBookings();
      } else {
        setLoading(false);
        alert(data?.message || "Failed to cancel booking");
      }
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const handleRetry = async (bookingId) => {
    if (!currentUser?._id || retryingId) return;
    try {
      setRetryingId(bookingId);
      const res = await retryOrder(bookingId);

      if (!res?.success) {
        alert(res?.message || "Failed to initiate payment retry.");
        setRetryingId(null);
        return;
      }

      const { orderId, amount, currency, keyId } = res;

      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || "INR",
          name: "Wadi Al Zaitoon Tourism",
          description: "Retry Tour Reservation Payment",
          image: "/assets/favicon.ico",
          order_id: orderId,
          prefill: {
            name: currentUser?.username || "",
            email: currentUser?.email || "",
            contact: currentUser?.phone || "",
          },
          theme: { color: "#0F2C23" },
          handler: async function (response) {
            try {
              const verifyRes = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes?.success) {
                alert("Payment Verified & Booking Confirmed!");
                getAllBookings();
              } else {
                alert(verifyRes?.message || "Payment verification failed.");
              }
            } catch (err) {
              alert("Verification Error: " + err.message);
            } finally {
              setRetryingId(null);
            }
          },
          modal: {
            ondismiss: function () {
              alert("Payment session closed. Your reservation remains saved as Pending.");
              setRetryingId(null);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Razorpay Checkout SDK is loading. Please refresh and try again.");
        setRetryingId(null);
      }
    } catch (err) {
      alert("Retry Error: " + err.message);
      setRetryingId(null);
    }
  };

  // Open Manifest Modal & Fetch Existing Manifest
  const handleOpenManifestModal = async (booking) => {
    setSelectedBooking(booking);
    setManifestError(null);
    setManifestSuccess(null);
    setManifestLoading(true);

    const totalPersons = Number(booking.persons) || 1;

    try {
      const data = await getTravellers(booking._id);
      if (data?.success && Array.isArray(data.travellers) && data.travellers.length > 0) {
        const existingMap = {};
        data.travellers.forEach((t) => {
          existingMap[t.passengerNumber] = t;
        });

        const initialForms = [];
        for (let i = 1; i <= totalPersons; i++) {
          if (existingMap[i]) {
            const ex = existingMap[i];
            initialForms.push({
              fullName: ex.fullName || "",
              age: ex.age !== undefined ? String(ex.age) : "",
              gender: ex.gender || "Male",
              idType: ex.idType || "Passport",
              idNumber: ex.idNumber || "",
              emergencyContactName: ex.emergencyContactName || "",
              emergencyContactPhone: ex.emergencyContactPhone || "",
              specialRequests: ex.specialRequests || "",
            });
          } else {
            initialForms.push({
              fullName: i === 1 ? currentUser?.username || "" : "",
              age: "",
              gender: "Male",
              idType: "Passport",
              idNumber: "",
              emergencyContactName: "",
              emergencyContactPhone: "",
              specialRequests: "",
            });
          }
        }
        setManifestForms(initialForms);
      } else {
        const initialForms = [];
        for (let i = 1; i <= totalPersons; i++) {
          initialForms.push({
            fullName: i === 1 ? currentUser?.username || "" : "",
            age: "",
            gender: "Male",
            idType: "Passport",
            idNumber: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            specialRequests: "",
          });
        }
        setManifestForms(initialForms);
      }
    } catch (err) {
      setManifestError("Failed to fetch passenger details: " + err.message);
    } finally {
      setManifestLoading(false);
    }
  };

  const handlePassengerFormChange = (index, field, value) => {
    setManifestForms((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveManifest = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setManifestError(null);
    setManifestSuccess(null);

    // Client-side validation
    for (let i = 0; i < manifestForms.length; i++) {
      const p = manifestForms[i];
      const pNum = i + 1;
      if (!p.fullName || !p.fullName.trim()) {
        setManifestError(`Passenger #${pNum}: Full Name is required.`);
        return;
      }
      const ageNum = Number(p.age);
      if (p.age === "" || isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) {
        setManifestError(`Passenger #${pNum}: Age must be an integer between 0 and 120.`);
        return;
      }
      if (!["Male", "Female", "Other"].includes(p.gender)) {
        setManifestError(`Passenger #${pNum}: Valid gender selection required.`);
        return;
      }
      if (!["Passport", "National_ID", "Driving_License"].includes(p.idType)) {
        setManifestError(`Passenger #${pNum}: Valid ID type selection required.`);
        return;
      }
      if (!p.idNumber || !p.idNumber.trim()) {
        setManifestError(`Passenger #${pNum}: ID document number is required.`);
        return;
      }
    }

    try {
      setManifestSaving(true);
      const payload = {
        travellers: manifestForms.map((p) => ({
          fullName: p.fullName.trim(),
          age: Number(p.age),
          gender: p.gender,
          idType: p.idType,
          idNumber: p.idNumber.trim(),
          emergencyContactName: p.emergencyContactName ? p.emergencyContactName.trim() : "",
          emergencyContactPhone: p.emergencyContactPhone ? p.emergencyContactPhone.trim() : "",
          specialRequests: p.specialRequests ? p.specialRequests.trim() : "",
        })),
      };

      const data = await submitTravellers(selectedBooking._id, payload);

      if (data?.success) {
        setManifestSuccess("Passenger details submitted successfully!");
        setCurrentBookings((prev) =>
          prev.map((b) =>
            b._id === selectedBooking._id ? { ...b, travellerManifestCompleted: true } : b
          )
        );
        setTimeout(() => {
          setSelectedBooking(null);
        }, 1200);
      } else {
        setManifestError(data?.message || "Failed to submit passenger details.");
      }
    } catch (err) {
      setManifestError(err.message || "An unexpected error occurred.");
    } finally {
      setManifestSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-lightneutral pb-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-forest-900">Active Trip Reservations</h3>
          <p className="text-xs text-charcoal/60">Upcoming scheduled travel packages</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search booking title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-ivory/70 border border-lightneutral rounded-xl px-3.5 py-2 pl-9 text-xs text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-sage-500"
          />
          <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error Feedback */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs text-center border border-red-200">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && currentBookings.length === 0 && (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-forest-50 text-forest-900 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6 text-sage-600" />
          </div>
          <h4 className="font-serif font-bold text-base text-forest-900">No Active Reservations Found</h4>
          <p className="text-xs text-charcoal/60 max-w-xs mx-auto">
            You don't have any upcoming trips scheduled. Discover our curated Palestinian destinations.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-semibold hover:bg-forest-800 transition-colors"
          >
            Explore Packages <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && currentBookings.length > 0 && (
        <StaggerContainer className="space-y-4">
          {currentBookings.map((booking) => {
            const isConfirmed = booking?.paymentStatus === "Captured" || booking?.status === "Confirmed" || booking?.status === "Approved" || booking?.status === "Booked";
            const isPendingPayment = booking?.status === "Pending" && booking?.paymentStatus === "Pending";
            const isFailedPayment = booking?.status === "Pending" && booking?.paymentStatus === "Failed";
            const isCancelled = booking?.status === "Cancelled" || booking?.status === "Cancellation_Requested";
            const isRetryingThis = retryingId === booking._id;

            return (
              <StaggerItem key={booking._id}>
                <div className="p-4 rounded-2xl border border-lightneutral/80 bg-ivory/40 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    <Link to={`/package/${booking?.packageDetails?._id}`} className="shrink-0">
                      <img
                        src={booking?.packageDetails?.packageImages[0] || "/assets/bg_jmg1.jpg"}
                        alt={booking?.packageDetails?.packageName}
                        className="w-16 h-16 rounded-xl object-cover border border-lightneutral"
                      />
                    </Link>
                    <div className="space-y-1">
                      <Link
                        to={`/package/${booking?.packageDetails?._id}`}
                        className="font-serif font-bold text-sm text-forest-900 hover:text-sage-600 transition-colors line-clamp-1"
                      >
                        {booking?.packageDetails?.packageName}
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-charcoal/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sage-600" /> {booking?.date}
                        </span>

                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                            Confirmed
                          </span>
                        )}

                        {isPendingPayment && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                            Payment Pending
                          </span>
                        )}

                        {isFailedPayment && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-800 text-[10px] font-semibold border border-red-200">
                            Payment Failed
                          </span>
                        )}

                        {/* Manifest Status Badge */}
                        {booking.travellerManifestCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-semibold border border-emerald-300">
                            <Users className="w-3 h-3 text-emerald-700" /> Manifest Completed ({booking.persons}/{booking.persons})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold border border-amber-300">
                            <Users className="w-3 h-3 text-amber-700" /> Details Pending ({booking.persons} {booking.persons === 1 ? "person" : "persons"})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-lightneutral/60">
                    
                    {/* Download Invoice Button (Only for Confirmed & Captured Bookings) */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleDownloadInvoice(booking._id)}
                        disabled={downloadingInvoiceId === booking._id}
                        className="px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <FileText className={`w-3.5 h-3.5 ${downloadingInvoiceId === booking._id ? "animate-spin" : ""}`} />
                        {downloadingInvoiceId === booking._id ? "Downloading..." : "Download Invoice"}
                      </button>
                    )}

                    {/* Passenger Manifest Action Button */}
                    <button
                      onClick={() => handleOpenManifestModal(booking)}
                      className="px-3.5 py-1.5 rounded-xl border border-forest-900/30 text-forest-900 hover:bg-forest-900 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      {booking.travellerManifestCompleted ? "Edit Passenger Details" : "Passenger Details"}
                    </button>

                    {(isPendingPayment || isFailedPayment) && (
                      <button
                        onClick={() => handleRetry(booking._id)}
                        disabled={isRetryingThis}
                        className="px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {isFailedPayment ? <RefreshCw className={`w-3.5 h-3.5 ${isRetryingThis ? "animate-spin" : ""}`} /> : <CreditCard className="w-3.5 h-3.5" />}
                        {isRetryingThis ? "Processing..." : isFailedPayment ? "Retry Payment" : "Complete Payment"}
                      </button>
                    )}

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-700 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Cancel Reservation
                      </button>
                    )}
                  </div>

                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

      {/* PASSENGER MANIFEST MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-lightneutral">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-lightneutral/80 flex items-center justify-between bg-ivory/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-forest-900/10 text-forest-900 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-forest-900">
                    Passenger Details Manifest
                  </h3>
                  <p className="text-xs text-charcoal/60">
                    {selectedBooking?.packageDetails?.packageName || "Tour Reservation"} &bull; {selectedBooking.persons} {selectedBooking.persons === 1 ? "Passenger" : "Passengers"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-lightneutral/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Lifecycle Warning for Cancelled Bookings */}
              {(selectedBooking.status === "Cancelled" || selectedBooking.status === "Cancellation_Requested") && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Passenger Details Locked</p>
                    <p className="text-amber-800/80">
                      This reservation is {selectedBooking.status === "Cancelled" ? "cancelled" : "pending cancellation"}. Passenger manifest details are read-only.
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback Alerts */}
              {manifestError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{manifestError}</span>
                </div>
              )}

              {manifestSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{manifestSuccess}</span>
                </div>
              )}

              {manifestLoading ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-forest-900 animate-spin mx-auto" />
                  <p className="text-xs text-charcoal/60">Loading passenger details...</p>
                </div>
              ) : (
                <form onSubmit={handleSaveManifest} className="space-y-6">
                  {manifestForms.map((p, idx) => {
                    const pNum = idx + 1;
                    const isLocked = selectedBooking.status === "Cancelled" || selectedBooking.status === "Cancellation_Requested";

                    return (
                      <div key={idx} className="p-4 rounded-xl border border-lightneutral/80 bg-ivory/30 space-y-4">
                        <div className="flex items-center justify-between border-b border-lightneutral/60 pb-2">
                          <span className="font-serif font-bold text-xs text-forest-900 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-sage-600" />
                            Passenger #{pNum} {pNum === 1 ? "(Primary Traveller)" : ""}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Required Slot #{pNum}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                          {/* Full Name */}
                          <div>
                            <label className="block text-[11px] font-semibold text-charcoal/80 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              disabled={isLocked}
                              value={p.fullName}
                              onChange={(e) => handlePassengerFormChange(idx, "fullName", e.target.value)}
                              placeholder="e.g. Tariq Mansour"
                              className="w-full bg-white border border-lightneutral rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 disabled:bg-slate-100 disabled:opacity-75"
                            />
                          </div>

                          {/* Age */}
                          <div>
                            <label className="block text-[11px] font-semibold text-charcoal/80 mb-1">
                              Age *
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="120"
                              required
                              disabled={isLocked}
                              value={p.age}
                              onChange={(e) => handlePassengerFormChange(idx, "age", e.target.value)}
                              placeholder="e.g. 28"
                              className="w-full bg-white border border-lightneutral rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 disabled:bg-slate-100 disabled:opacity-75"
                            />
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-[11px] font-semibold text-charcoal/80 mb-1">
                              Gender *
                            </label>
                            <select
                              disabled={isLocked}
                              value={p.gender}
                              onChange={(e) => handlePassengerFormChange(idx, "gender", e.target.value)}
                              className="w-full bg-white border border-lightneutral rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 disabled:bg-slate-100 disabled:opacity-75"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* ID Type */}
                          <div>
                            <label className="block text-[11px] font-semibold text-charcoal/80 mb-1">
                              ID Document Type *
                            </label>
                            <select
                              disabled={isLocked}
                              value={p.idType}
                              onChange={(e) => handlePassengerFormChange(idx, "idType", e.target.value)}
                              className="w-full bg-white border border-lightneutral rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 disabled:bg-slate-100 disabled:opacity-75"
                            >
                              <option value="Passport">Passport</option>
                              <option value="National_ID">National ID</option>
                              <option value="Driving_License">Driving License</option>
                            </select>
                          </div>

                          {/* ID Number */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-charcoal/80 mb-1">
                              ID Document Number * <span className="text-[10px] text-charcoal/50 font-normal">(Masked for security)</span>
                            </label>
                            <input
                              type="text"
                              required
                              disabled={isLocked}
                              value={p.idNumber}
                              onChange={(e) => handlePassengerFormChange(idx, "idNumber", e.target.value)}
                              placeholder="e.g. P12345678"
                              className="w-full bg-white border border-lightneutral rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 disabled:bg-slate-100 disabled:opacity-75"
                            />
                          </div>

                          {/* Emergency Contact Name */}
                          <div>
                            <label className="block text-[11px] font-medium text-charcoal/70 mb-1">
                              Emergency Contact Name <span className="text-[10px] text-charcoal/40">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              disabled={isLocked}
                              value={p.emergencyContactName}
                              onChange={(e) => handlePassengerFormChange(idx, "emergencyContactName", e.target.value)}
                              placeholder="e.g. Maryam Mansour"
                              className="w-full bg-white border border-lightneutral rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 disabled:bg-slate-100 disabled:opacity-75"
                            />
                          </div>

                          {/* Emergency Contact Phone */}
                          <div>
                            <label className="block text-[11px] font-medium text-charcoal/70 mb-1">
                              Emergency Contact Phone <span className="text-[10px] text-charcoal/40">(Optional)</span>
                            </label>
                            <input
                              type="text"
                              disabled={isLocked}
                              value={p.emergencyContactPhone}
                              onChange={(e) => handlePassengerFormChange(idx, "emergencyContactPhone", e.target.value)}
                              placeholder="e.g. +970599000000"
                              className="w-full bg-white border border-lightneutral rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 disabled:bg-slate-100 disabled:opacity-75"
                            />
                          </div>

                          {/* Special Requests */}
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-medium text-charcoal/70 mb-1">
                              Special Requests / Accessibility Requirements <span className="text-[10px] text-charcoal/40">(Optional)</span>
                            </label>
                            <textarea
                              rows="2"
                              disabled={isLocked}
                              value={p.specialRequests}
                              onChange={(e) => handlePassengerFormChange(idx, "specialRequests", e.target.value)}
                              placeholder="e.g. Dietary preferences, wheelchair access..."
                              className="w-full bg-white border border-lightneutral rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 disabled:bg-slate-100 disabled:opacity-75"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Submit Bar */}
                  {!(selectedBooking.status === "Cancelled" || selectedBooking.status === "Cancellation_Requested") && (
                    <div className="pt-2 border-t border-lightneutral flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBooking(null)}
                        className="px-4 py-2 rounded-xl border border-lightneutral text-xs font-semibold text-charcoal hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={manifestSaving}
                        className="px-5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {manifestSaving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving Details...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Save Passenger Manifest
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyBookings;

