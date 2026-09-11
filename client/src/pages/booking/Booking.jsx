import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapPin, Clock, Calendar, Users, ShieldCheck, CheckCircle2, AlertCircle, CreditCard, Lock } from "lucide-react";
import { apiFetch } from "../../services/api";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const Booking = () => {
  const { currentUser } = useSelector((state) => state.user);
  const params = useParams();
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageRating: 0,
    packageTotalRatings: 0,
    packageImages: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

  const [bookingData, setBookingData] = useState({
    totalPrice: 0,
    persons: 1,
    date: "",
  });

  // Dynamically load Razorpay Standard Checkout SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const getPackageData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/package/get-package-data/${params?.packageId}`);
      if (data?.success) {
        setPackageData({
          packageName: data?.packageData?.packageName || "",
          packageDescription: data?.packageData?.packageDescription || "",
          packageDestination: data?.packageData?.packageDestination || "",
          packageDays: data?.packageData?.packageDays || 1,
          packageNights: data?.packageData?.packageNights || 1,
          packageAccommodation: data?.packageData?.packageAccommodation || "",
          packageTransportation: data?.packageData?.packageTransportation || "",
          packageMeals: data?.packageData?.packageMeals || "",
          packageActivities: data?.packageData?.packageActivities || "",
          packagePrice: data?.packageData?.packagePrice || 500,
          packageDiscountPrice: data?.packageData?.packageDiscountPrice || 0,
          packageOffer: data?.packageData?.packageOffer || false,
          packageRating: data?.packageData?.packageRating || 0,
          packageTotalRatings: data?.packageData?.packageTotalRatings || 0,
          packageImages: data?.packageData?.packageImages || [],
        });
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

  useEffect(() => {
    getPackageData();
    const today = new Date().toISOString().split("T")[0];
    setCurrentDate(today);
    setBookingData((prev) => ({ ...prev, date: today }));
  }, [params?.packageId]);

  // Recalculate price when persons or package offer changes
  useEffect(() => {
    const unitPrice =
      packageData.packageOffer && packageData.packageDiscountPrice > 0
        ? packageData.packageDiscountPrice
        : packageData.packagePrice;
    const calculatedTotal = unitPrice * Number(bookingData.persons);
    setBookingData((prev) => ({ ...prev, totalPrice: calculatedTotal }));
  }, [bookingData.persons, packageData]);

  // Initiate Razorpay Standard Checkout Flow
  const handleRazorpayPayment = async () => {
    if (!currentUser?._id) {
      alert("Please login to proceed with booking.");
      navigate("/login");
      return;
    }

    if (!bookingData.date) {
      alert("Please select a valid departure date.");
      return;
    }

    if (!bookingData.persons || bookingData.persons < 1) {
      alert("Please select at least 1 person for booking.");
      return;
    }

    try {
      setProcessingPayment(true);

      // 1. Create Pending Booking & Razorpay Order on Backend (Server-Authoritative Price Calculation)
      const orderRes = await apiFetch("/api/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          packageId: params?.packageId,
          persons: bookingData.persons,
          date: bookingData.date,
        }),
      });

      if (!orderRes?.success) {
        alert(orderRes?.message || "Failed to create payment order.");
        setProcessingPayment(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderRes;

      // 2. Open Razorpay Checkout Modal
      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || "INR",
          name: "Wadi Al Zaitoon Tourism",
          description: `Tour Reservation: ${packageData.packageName}`,
          image: packageData.packageImages[0] || "/assets/favicon.ico",
          order_id: orderId,
          prefill: {
            name: currentUser?.username || "",
            email: currentUser?.email || "",
            contact: currentUser?.phone || "",
          },
          theme: {
            color: "#0F2C23",
          },
          handler: async function (response) {
            // 3. Post Payment Callback Payload to Backend for HMAC Signature Verification & Atomic Confirmation
            try {
              const verifyRes = await apiFetch("/api/payment/verify-payment", {
                method: "POST",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              if (verifyRes?.success) {
                alert("Payment Verified & Booking Confirmed!");
                navigate("/profile/user");
              } else {
                alert(verifyRes?.message || "Payment verification failed.");
              }
            } catch (err) {
              alert("Verification Error: " + err.message);
            } finally {
              setProcessingPayment(false);
            }
          },
          modal: {
            ondismiss: function () {
              alert("Payment session closed. Your reservation has been saved as Pending.");
              setProcessingPayment(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Razorpay Checkout SDK failed to load. Please refresh the page and try again.");
        setProcessingPayment(false);
      }
    } catch (err) {
      alert("Payment Error: " + err.message);
      setProcessingPayment(false);
    }
  };

  return (
    <PageTransition>
      <div className="pb-12 pt-28 bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Breadcrumb */}
          <FadeIn>
            <div className="border-b border-lightneutral pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-sage-600">Secure Checkout</span>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-forest-900 mt-1">
                  Complete Your Tour Reservation
                </h1>
              </div>
            </div>
          </FadeIn>

          {loading ? (
            <div className="py-16 text-center text-charcoal/60 animate-pulse font-serif text-lg">
              Loading travel itinerary and pricing details...
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center font-medium">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Traveler & Payment Details */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Traveler Contact Summary Card */}
                <div className="p-6 rounded-2xl bg-white border border-lightneutral shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-forest-900 border-b border-lightneutral pb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-sage-600" /> Primary Traveler Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-charcoal/50 block font-medium">Full Name</span>
                      <span className="text-forest-900 font-semibold text-sm">{currentUser?.username}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 block font-medium">Email Address</span>
                      <span className="text-forest-900 font-semibold text-sm">{currentUser?.email}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 block font-medium">Phone Number</span>
                      <span className="text-forest-900 font-semibold text-sm">{currentUser?.phone || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 block font-medium">Billing Address</span>
                      <span className="text-forest-900 font-semibold text-sm line-clamp-1">{currentUser?.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Departure Date & Guest Counter Form */}
                <div className="p-6 rounded-2xl bg-white border border-lightneutral shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-forest-900 border-b border-lightneutral pb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sage-600" /> Tour Logistics & Date
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-charcoal block mb-1.5">
                        Select Departure Date
                      </label>
                      <input
                        type="date"
                        min={currentDate}
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        className="w-full bg-ivory/60 border border-lightneutral rounded-xl px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:border-sage-500 font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-charcoal block mb-1.5">
                        Number of Travelers
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setBookingData((prev) => ({ ...prev, persons: Math.max(1, prev.persons - 1) }))}
                          className="w-9 h-9 rounded-xl border border-lightneutral bg-ivory text-forest-900 font-bold hover:bg-forest-900 hover:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="font-serif font-bold text-base w-8 text-center text-forest-900">
                          {bookingData.persons}
                        </span>
                        <button
                          type="button"
                          onClick={() => setBookingData((prev) => ({ ...prev, persons: prev.persons + 1 }))}
                          className="w-9 h-9 rounded-xl border border-lightneutral bg-ivory text-forest-900 font-bold hover:bg-forest-900 hover:text-white transition-colors"
                        >
                          +
                        </button>
                        <span className="text-xs text-charcoal/50 ml-2">
                          (${packageData.packageOffer && packageData.packageDiscountPrice > 0 ? packageData.packageDiscountPrice : packageData.packagePrice} per person)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Razorpay Gateway Notice Card */}
                <div className="p-6 rounded-2xl bg-forest-900 text-white shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-sage-400" />
                      <h4 className="font-serif font-bold text-base">Razorpay Standard Checkout</h4>
                    </div>
                    <span className="text-[10px] uppercase font-semibold tracking-wider bg-sage-600 text-white px-2.5 py-0.5 rounded-full">
                      256-Bit SSL Encrypted
                    </span>
                  </div>
                  <p className="text-xs text-ivory/80 leading-relaxed font-light">
                    Your payment is processed securely via Razorpay. Order signatures are verified server-side with zero price tampering risk.
                  </p>
                  
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={processingPayment}
                    className="w-full py-3.5 rounded-xl bg-white hover:bg-ivory text-forest-900 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4 text-sage-600" />
                    {processingPayment ? "Processing Payment..." : "PAY SECURELY WITH RAZORPAY"}
                  </button>
                </div>

              </div>

              {/* Right Column: Order Summary Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-lightneutral shadow-sm space-y-6 sticky top-24">
                  <h3 className="font-serif text-lg font-bold text-forest-900 border-b border-lightneutral pb-3">
                    Booking Summary
                  </h3>

                  <div className="flex gap-4">
                    <img
                      src={packageData.packageImages[0] || "/assets/bg_jmg1.jpg"}
                      alt={packageData.packageName}
                      className="w-20 h-20 rounded-xl object-cover border border-lightneutral shrink-0"
                    />
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-forest-900 line-clamp-2">
                        {packageData.packageName}
                      </h4>
                      <p className="text-xs text-charcoal/60 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sage-600 shrink-0" /> {packageData.packageDestination}
                      </p>
                      <p className="text-xs text-charcoal/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sage-600 shrink-0" /> {packageData.packageDays} Days / {packageData.packageNights} Nights
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-b border-lightneutral py-4 text-xs">
                    <div className="flex justify-between text-charcoal/80">
                      <span>Rate per traveler</span>
                      <span className="font-semibold text-forest-900">
                        ${packageData.packageOffer && packageData.packageDiscountPrice > 0 ? packageData.packageDiscountPrice : packageData.packagePrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-charcoal/80">
                      <span>Total travelers</span>
                      <span className="font-semibold text-forest-900">{bookingData.persons}</span>
                    </div>
                    <div className="flex justify-between text-charcoal/80">
                      <span>Departure date</span>
                      <span className="font-semibold text-forest-900">{bookingData.date || "Not selected"}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-forest-900 font-serif font-bold text-xl pt-2">
                    <span>Total Amount:</span>
                    <span>${bookingData.totalPrice}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-ivory border border-lightneutral text-[11px] text-charcoal/70 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-forest-900">
                      <ShieldCheck className="w-4 h-4 text-sage-600" /> Guaranteed Booking Authorization
                    </div>
                    <p className="leading-relaxed">
                      Instant confirmation issued upon successful Razorpay signature verification.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
};

export default Booking;
