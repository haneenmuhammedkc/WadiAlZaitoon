import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Search, Calendar, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { getAllUserBookings, deleteBookingHistory } from "../../services/bookingService";
import { StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const MyHistory = () => {
  const { user: currentUser } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  const getAllBookings = async () => {
    if (!currentUser?._id) return;
    try {
      setLoading(true);
      const data = await getAllUserBookings(currentUser._id);
      if (data?.success) {
        setAllBookings(data?.bookings || []);
        setLoading(false);
        setError(false);
      } else {
        setLoading(false);
        setError(data?.message || "Failed to load history");
      }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    getAllBookings();
  }, [search, currentUser]);

  const handleHistoryDelete = async (id) => {
    if (!currentUser?._id) return;
    const CONFIRM = confirm("Are you sure you want to delete this booking history item?");
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
        alert(data?.message || "Failed to delete history");
      }
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-lightneutral pb-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-forest-900">Booking History Log</h3>
          <p className="text-xs text-charcoal/60">Archive of completed and past trips</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search past bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ivory/70 border border-lightneutral rounded-xl px-3.5 py-2 pl-9 text-xs text-charcoal placeholder-charcoal/40 focus:outline-none focus:border-sage-500"
          />
          <Search className="w-4 h-4 text-charcoal/40 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
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
      {!loading && !error && allBookings.length === 0 && (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-forest-50 text-forest-900 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6 text-sage-600" />
          </div>
          <h4 className="font-serif font-bold text-base text-forest-900">No Booking History</h4>
          <p className="text-xs text-charcoal/60 max-w-xs mx-auto">
            Your past trip history will appear here once completed.
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
                <div className="p-4 rounded-2xl border border-lightneutral/80 bg-ivory/30 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-4">
                    <Link to={`/package/${booking?.packageDetails?._id}`} className="shrink-0">
                      <img
                        src={booking?.packageDetails?.packageImages[0] || "/assets/bg_jmg1.jpg"}
                        alt={booking?.packageDetails?.packageName}
                        className="w-14 h-14 rounded-xl object-cover border border-lightneutral"
                      />
                    </Link>
                    <div className="space-y-1">
                      <Link
                        to={`/package/${booking?.packageDetails?._id}`}
                        className="font-serif font-bold text-sm text-forest-900 hover:text-sage-600 transition-colors line-clamp-1"
                      >
                        {booking?.packageDetails?.packageName}
                      </Link>
                      <div className="flex items-center gap-3 text-[11px] text-charcoal/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sage-600" /> {booking?.date}
                        </span>
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200">
                            <XCircle className="w-3 h-3" /> Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
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
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
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

export default MyHistory;
