import React, { useEffect, useState } from "react";
import { useParams, useLocation, Outlet, Link } from "react-router-dom";
import { BookingProvider } from "../../pages/booking/BookingContext";
import BookingSummary from "../booking/BookingSummary";
import { CHECKOUT_STEPS } from "../../constants/booking.constants";
import { apiFetch } from "../../services/api";
import { PageTransition } from "../animations/Motion";
import { ShieldCheck } from "lucide-react";

const BookingLayout = () => {
  const params = useParams();
  const location = useLocation();
  const packageId = params.packageId;

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine current active step index from route path
  const currentPathSegment = location.pathname.split("/").pop() || "travel";
  let stepIndex = CHECKOUT_STEPS.findIndex((s) => s.path === currentPathSegment);
  if (stepIndex === -1) stepIndex = 0;

  useEffect(() => {
    const fetchPackage = async () => {
      if (!packageId || packageId === "undefined") {
        setError("Invalid Package ID specified.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await apiFetch(`/api/package/get-package-data/${packageId}`);
        if (data?.success && data?.packageData) {
          setPackageData(data.packageData);
          setLoading(false);
        } else {
          setError(data?.message || "Package details unavailable.");
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-slate-900 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Package Unavailable</h3>
          <p className="text-xs text-slate-500">{error || "Unable to load tour itinerary for booking."}</p>
          <Link
            to="/packages"
            className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Explore Packages
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmationStep = stepIndex === 6;

  return (
    <BookingProvider packageId={packageId} packageData={packageData}>
      <PageTransition>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
          
          {/* Main 2-Column Responsive Layout */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Main Step Form / Content Column */}
              <div className={isConfirmationStep ? "lg:col-span-12 max-w-3xl mx-auto w-full" : "lg:col-span-7 xl:col-span-8 space-y-6"}>
                <Outlet />
              </div>

              {/* Right Sticky Trip Summary Sidebar (Hidden on Step 7 Confirmation) */}
              {!isConfirmationStep && (
                <div className="lg:col-span-5 xl:col-span-4">
                  <BookingSummary />
                </div>
              )}

            </div>
          </main>

        </div>
      </PageTransition>
    </BookingProvider>
  );
};

export default BookingLayout;
