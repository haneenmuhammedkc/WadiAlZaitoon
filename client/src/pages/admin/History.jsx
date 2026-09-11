import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Search, Calendar, Trash2, User as UserIcon, CheckCircle, XCircle, History as HistoryIcon, Clock } from "lucide-react";
import { getAllBookings as fetchAllBookingsApi, deleteBookingHistory } from "../../services/bookingService";
import { StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const History = () => {
  const { user: currentUser } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const getAllBookings = async () => {
    try {
      setLoading(true);
      const data = await fetchAllBookingsApi();
      if (data?.success) {
        setAllBookings(data?.bookings || []);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(data?.message || "Failed to load booking history");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, [search]);

  const handleHistoryDelete = async (id) => {
    if (!currentUser?._id) return;
    const CONFIRM = window.confirm("Are you sure you want to delete this booking log?");
    if (!CONFIRM) return;
    try {
      setLoading(true);
      const data = await deleteBookingHistory(id, currentUser._id);
      if (data?.success) {
        setLoading(false);
        alert(data?.message || "Booking History Deleted!");
        getAllBookings();
      } else {
        setLoading(false);
        alert(data?.message || "Failed to delete history item");
      }
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-emerald-600" /> Historical Booking Log
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Archive of all completed, past, and cancelled trip reservations
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-medium text-center rounded-xl border border-red-200">
          {error}
        </div>
      )}

      {!loading && !error && allBookings.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">No Historical Records Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No past or cancelled booking logs match your current search query.
          </p>
        </div>
      )}

      {/* History Items List */}
      {!loading && !error && allBookings.length > 0 && (
        <StaggerContainer className="space-y-3">
          {allBookings.map((booking) => {
            const isCancelled = booking?.status === "Cancelled";
            const isPastDate = new Date(booking?.date).getTime() < new Date().getTime();

            return (
              <StaggerItem key={booking._id}>
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    <Link to={`/package/${booking?.packageDetails?._id}`} className="shrink-0 group">
                      <img
                        src={booking?.packageDetails?.packageImages[0] || "/assets/bg_jmg1.jpg"}
                        alt={booking?.packageDetails?.packageName}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                      />
                    </Link>
                    
                    <div className="space-y-1">
                      <Link
                        to={`/package/${booking?.packageDetails?._id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                      >
                        {booking?.packageDetails?.packageName}
                      </Link>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                          <UserIcon className="w-3 h-3 text-slate-500" /> {booking?.buyer?.username} ({booking?.buyer?.email})
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" /> Date: {booking?.date}
                        </span>
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                            <XCircle className="w-3 h-3" /> Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(isPastDate || isCancelled) && (
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleHistoryDelete(booking._id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                        title="Delete History Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      )}

    </div>
  );
};

export default History;
