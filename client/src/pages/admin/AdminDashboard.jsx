import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Users,
  CreditCard,
  Hotel as HotelIcon,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  DollarSign,
  CheckCircle2,
  Sparkles,
  User as UserIcon,
} from "lucide-react";
import AllBookings from "./AllBookings";
import AdminUpdateProfile from "./AdminUpdateProfile";
import AddPackages from "./AddPackages";
import AllPackages from "./AllPackages";
import AllUsers from "./AllUsers";
import Payments from "./Payments";
import RatingsReviews from "./RatingsReviews";
import AllHotels from "./AllHotels";
import { getPaymentLedger } from "../../services/paymentService";
import { getCurrentBookings } from "../../services/bookingService";
import { getAllUsers } from "../../services/userService";
import { getPackages } from "../../services/packageService";

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const context = useOutletContext();
  const activePanelId = context?.activePanelId ?? 0;
  const setActivePanelId = context?.setActivePanelId || (() => {});

  // Overview Analytics State (Real DB Data)
  const [overviewData, setOverviewData] = useState({
    totalCapturedRevenue: 0,
    netRevenue: 0,
    totalRefunded: 0,
    activeBookingsCount: 0,
    usersCount: 0,
    recentBookings: [],
    recentPackages: [],
    loading: true,
  });

  // Load Overview Data from Backend APIs
  useEffect(() => {
    const fetchOverviewAnalytics = async () => {
      try {
        setOverviewData((prev) => ({ ...prev, loading: true }));
        const [ledgerRes, bookingsRes, usersRes, packagesRes] = await Promise.allSettled([
          getPaymentLedger(),
          getCurrentBookings(),
          getAllUsers(),
          getPackages("limit=4"),
        ]);

        let gross = 0;
        let net = 0;
        let refunded = 0;
        if (ledgerRes.status === "fulfilled" && ledgerRes.value?.success) {
          const m = ledgerRes.value.metrics || {};
          gross = m.totalCapturedRevenue || 0;
          net = m.netRevenue || 0;
          refunded = m.totalRefunded || 0;
        }

        let bookings = [];
        if (bookingsRes.status === "fulfilled" && bookingsRes.value?.success) {
          bookings = bookingsRes.value.bookings || [];
        }

        let uCount = 0;
        if (usersRes.status === "fulfilled") {
          const uVal = usersRes.value;
          if (Array.isArray(uVal)) uCount = uVal.length;
          else if (uVal?.users && Array.isArray(uVal.users)) uCount = uVal.users.length;
        }

        let pkgs = [];
        if (packagesRes.status === "fulfilled" && packagesRes.value?.success) {
          pkgs = packagesRes.value.packages || [];
        }

        setOverviewData({
          totalCapturedRevenue: gross,
          netRevenue: net,
          totalRefunded: refunded,
          activeBookingsCount: bookings.length,
          usersCount: uCount,
          recentBookings: bookings.slice(0, 4),
          recentPackages: pkgs,
          loading: false,
        });
      } catch (err) {
        console.error("Overview analytics load error:", err);
        setOverviewData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchOverviewAnalytics();
  }, []);

  if (!currentUser || currentUser.user_role !== 1) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 font-sans">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Administrator Access Required</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          Please sign in with authorized system administrator credentials to access the command portal.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePanelId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        className="space-y-8"
      >
        {/* PANEL 0: DASHBOARD OVERVIEW HOME */}
        {activePanelId === 0 && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-lg relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                  <Sparkles className="w-3.5 h-3.5" /> Operations Dashboard
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {currentUser.username}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Here's what's happening across Wadi Al Zaitoon today. Monitor live bookings, inspect Razorpay revenue ledgers, and manage tour offerings.
                </p>
              </div>
            </div>

            {/* KPI Analytics Grid (5 Metrics) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* KPI 1: Gross Revenue */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Gross Revenue
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  ₹{overviewData.totalCapturedRevenue.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500">Captured Razorpay payments</p>
              </div>

              {/* KPI 2: Net Revenue */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Net Revenue
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-800 tracking-tight">
                  ₹{overviewData.netRevenue.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500">Gross minus refunds</p>
              </div>

              {/* KPI 3: Active Bookings */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Active Bookings
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {overviewData.activeBookingsCount}
                </div>
                <p className="text-[10px] text-slate-500">Confirmed upcoming tours</p>
              </div>

              {/* KPI 4: Registered Users */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Registered Users
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {overviewData.usersCount}
                </div>
                <p className="text-[10px] text-slate-500">Platform traveler accounts</p>
              </div>

              {/* KPI 5: Total Refunded */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Refunded
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-700 tracking-tight">
                  ₹{overviewData.totalRefunded.toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-500">Processed refund total</p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Quick Workspace Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  onClick={() => setActivePanelId(1)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left space-y-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">+ Add New Package</div>
                  <div className="text-[10px] text-slate-500">Publish tour itinerary</div>
                </button>

                <button
                  onClick={() => setActivePanelId(3)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left space-y-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <HotelIcon className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">+ Add Hotel Stay</div>
                  <div className="text-[10px] text-slate-500">Manage accommodations</div>
                </button>

                <button
                  onClick={() => setActivePanelId(6)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left space-y-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Manage Bookings</div>
                  <div className="text-[10px] text-slate-500">Inspect passenger roster</div>
                </button>

                <button
                  onClick={() => setActivePanelId(5)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all text-left space-y-2 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="font-bold text-xs text-slate-900">Financial Ledger</div>
                  <div className="text-[10px] text-slate-500">Process refunds & ledger</div>
                </button>
              </div>
            </div>

            {/* LOWER GRID: RECENT BOOKINGS PREVIEW + FEATURED PACKAGES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Recent Active Bookings (col 7) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Recent Active Bookings</h3>
                    <p className="text-[11px] text-slate-500">Upcoming reservations</p>
                  </div>
                  <button
                    onClick={() => setActivePanelId(6)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {overviewData.recentBookings.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No active bookings recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overviewData.recentBookings.map((b) => (
                      <div
                        key={b._id}
                        className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100/60 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-xs text-slate-900 block line-clamp-1">
                            {b.packageDetails?.packageName || "Tour Package"}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <UserIcon className="w-3 h-3 text-slate-400" /> {b.buyer?.username || "Traveler"}
                            </span>
                            <span>&bull;</span>
                            <span>Date: {b.date}</span>
                            <span>&bull;</span>
                            <span>{b.persons} guests</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0">
                          ₹{b.totalPrice?.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Package Catalog Preview (col 5) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Featured Packages</h3>
                    <p className="text-[11px] text-slate-500">Active tour listings</p>
                  </div>
                  <button
                    onClick={() => setActivePanelId(2)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    Catalog <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {overviewData.recentPackages.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    No packages available.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overviewData.recentPackages.map((p) => (
                      <div
                        key={p._id}
                        className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <img
                          src={p.packageImages?.[0] || "/assets/bg_jmg1.jpg"}
                          alt={p.packageName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {p.packageName}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {p.packageDestination} &bull; {p.packageDays}D/{p.packageNights}N
                          </span>
                        </div>
                        <span className="font-bold text-xs text-slate-900 shrink-0">
                          ₹{p.packageOffer ? p.packageDiscountPrice : p.packagePrice}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE PANELS (1-8) */}
        {activePanelId === 1 && <AddPackages />}
        {activePanelId === 2 && <AllPackages />}
        {activePanelId === 3 && <AllHotels />}
        {activePanelId === 4 && <AllUsers />}
        {activePanelId === 5 && <Payments />}
        {activePanelId === 6 && <AllBookings />}
        {activePanelId === 7 && <RatingsReviews />}
        {activePanelId === 8 && <AdminUpdateProfile />}
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminDashboard;
