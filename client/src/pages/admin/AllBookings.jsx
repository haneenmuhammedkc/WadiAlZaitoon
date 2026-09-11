import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, Calendar, User as UserIcon, XCircle, CheckCircle, Users, FileText, X, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import Chart from "../../components/ui/Chart";
import { apiFetch } from "../../services/api";
import { StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const AllBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [currentBookings, setCurrentBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [manifestFilter, setManifestFilter] = useState("all"); // "all", "completed", "pending"

  // Admin Manifest Modal State
  const [adminModalBookingId, setAdminModalBookingId] = useState(null);
  const [manifestData, setManifestData] = useState(null);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [manifestError, setManifestError] = useState(null);

  const getAllBookings = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(
        `/api/booking/get-currentBookings?searchTerm=${encodeURIComponent(searchTerm)}`
      );
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
  }, [searchTerm]);

  const handleCancel = async (id) => {
    if (!currentUser?._id) return;
    const CONFIRM = window.confirm("Are you sure you want to cancel this reservation?");
    if (!CONFIRM) return;
    try {
      setLoading(true);
      const data = await apiFetch(
        `/api/booking/cancel-booking/${id}/${currentUser._id}`,
        {
          method: "POST",
        }
      );
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

  // Open Admin Manifest View Modal
  const handleOpenAdminManifest = async (bookingId) => {
    setAdminModalBookingId(bookingId);
    setManifestLoading(true);
    setManifestError(null);
    setManifestData(null);

    try {
      const data = await apiFetch(`/api/traveller/admin/manifest/${bookingId}`);
      if (data?.success) {
        setManifestData(data);
      } else {
        setManifestError(data?.message || "Failed to retrieve passenger manifest.");
      }
    } catch (err) {
      setManifestError(err.message || "An unexpected error occurred.");
    } finally {
      setManifestLoading(false);
    }
  };

  const filteredBookings = currentBookings.filter((b) => {
    if (manifestFilter === "completed") return Boolean(b.travellerManifestCompleted);
    if (manifestFilter === "pending") return !b.travellerManifestCompleted;
    return true;
  });

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 tracking-tight">Active Reservations</h3>
          <p className="text-xs text-slate-500">Real-time package bookings and passenger manifests</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Manifest Filter */}
          <select
            value={manifestFilter}
            onChange={(e) => setManifestFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-slate-400 font-medium"
          >
            <option value="all">All Manifest Statuses</option>
            <option value="completed">Manifest Completed</option>
            <option value="pending">Manifest Pending</option>
          </select>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      {currentBookings.length > 0 && <Chart data={currentBookings} />}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 text-red-700 text-xs text-center rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && filteredBookings.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-400 font-medium">
          No matching active bookings found.
        </div>
      )}

      {/* Booking List */}
      {!loading && !error && filteredBookings.length > 0 && (
        <StaggerContainer className="space-y-3">
          {filteredBookings.map((booking) => (
            <StaggerItem key={booking._id}>
              <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  <Link to={`/package/${booking?.packageDetails?._id}`} className="shrink-0">
                    <img
                      src={booking?.packageDetails?.packageImages[0] || "/assets/bg_jmg1.jpg"}
                      alt={booking?.packageDetails?.packageName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                  </Link>
                  
                  <div className="space-y-1">
                    <Link
                      to={`/package/${booking?.packageDetails?._id}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                    >
                      {booking?.packageDetails?.packageName}
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <UserIcon className="w-3 h-3 text-slate-400" /> {booking?.buyer?.username} ({booking?.buyer?.email})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Date: {booking?.date}
                      </span>

                      {/* Admin Manifest Status Badge */}
                      {booking.travellerManifestCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          <Users className="w-3 h-3 text-emerald-600" /> Manifest Completed ({booking.persons}/{booking.persons})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                          <Users className="w-3 h-3 text-amber-600" /> Manifest Pending ({booking.persons} {booking.persons === 1 ? "seat" : "seats"})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleOpenAdminManifest(booking._id)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" /> View Manifest
                  </button>

                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-600 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel Reservation
                  </button>
                </div>

              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* ADMIN MANIFEST VIEW MODAL */}
      {adminModalBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white tracking-tight">
                    Admin Passenger Manifest
                  </h3>
                  <p className="text-xs text-slate-400">
                    Official Traveller Roster & Documents &bull; Unmasked Admin View
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAdminModalBookingId(null);
                  setManifestData(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50">
              {manifestLoading ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-slate-900 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Fetching secure passenger records...</p>
                </div>
              ) : manifestError ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{manifestError}</span>
                </div>
              ) : manifestData ? (
                <div className="space-y-6">
                  
                  {/* Reservation Context Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-sm text-slate-900">
                        {manifestData.booking?.packageName}
                      </p>
                      <p className="text-slate-500">
                        Destination: <span className="font-semibold text-slate-800">{manifestData.booking?.packageDestination}</span> &bull; Date: <span className="font-semibold text-slate-800">{manifestData.booking?.date}</span>
                      </p>
                      <p className="text-slate-500">
                        Primary Buyer: <span className="font-semibold text-slate-800">{manifestData.booking?.buyerUsername}</span> ({manifestData.booking?.buyerEmail} / {manifestData.booking?.buyerPhone})
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between gap-1 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Manifest Status
                      </span>
                      {manifestData.booking?.travellerManifestCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Complete ({manifestData.travellerCount}/{manifestData.booking?.persons})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Pending ({manifestData.travellerCount}/{manifestData.booking?.persons})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Passenger Roster */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" /> Registered Travellers ({manifestData.travellers?.length || 0})
                    </h4>

                    {(!manifestData.travellers || manifestData.travellers.length === 0) ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-1">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700">No Passenger Manifest Submitted Yet</p>
                        <p className="text-[11px] text-slate-400">The customer has not completed passenger details for this booking.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {manifestData.travellers.map((t) => (
                          <div key={t._id || t.passengerNumber} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">
                                  {t.passengerNumber}
                                </span>
                                {t.fullName}
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">
                                Age: <strong className="text-slate-800">{t.age}</strong> &bull; Gender: <strong className="text-slate-800">{t.gender}</strong>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                  Identity Document ({t.idType})
                                </span>
                                <span className="font-mono font-bold text-slate-900 text-xs tracking-wider">
                                  {t.idNumber}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                                  Emergency Contact
                                </span>
                                <span className="text-xs text-slate-800 font-medium">
                                  {t.emergencyContactName || "Not provided"} {t.emergencyContactPhone ? `(${t.emergencyContactPhone})` : ""}
                                </span>
                              </div>

                              {t.specialRequests && (
                                <div className="sm:col-span-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                                  <span className="text-[10px] font-bold text-amber-900 uppercase block">
                                    Special Requests / Accessibility
                                  </span>
                                  <span className="text-xs text-amber-900 font-medium">
                                    {t.specialRequests}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end">
              <button
                onClick={() => {
                  setAdminModalBookingId(null);
                  setManifestData(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
              >
                Close Roster
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AllBookings;
