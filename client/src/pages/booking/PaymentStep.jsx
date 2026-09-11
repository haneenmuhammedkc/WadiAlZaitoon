import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBooking } from "./BookingContext";
import { createOrder, verifyPayment } from "../../services/paymentService";
import { submitTravellers } from "../../services/travellerService";
import { CreditCard, Lock, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

const PaymentStep = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { packageId, packageData, bookingState, setConfirmedBooking, calculateTotals } = useBooking();
  const totals = calculateTotals();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(false);

  // Dynamically load Razorpay SDK
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

  const handleRazorpayCheckout = async () => {
    if (!currentUser?._id) {
      alert("Please login to complete your reservation.");
      navigate("/login");
      return;
    }

    try {
      setProcessing(true);
      setError(false);

      // 1. Submit Pre-Payment Pending Booking & Server Order Creation
      const orderRes = await createOrder({
        packageId,
        persons: totals.totalPersons,
        date: bookingState.departureDate,
        selectedRoom: bookingState.selectedRoom,
        selectedAddOns: bookingState.selectedAddOns,
        adults: bookingState.adults,
        children: bookingState.children,
        infants: bookingState.infants,
        rooms: bookingState.rooms,
        returnDate: bookingState.returnDate,
      });

      if (!orderRes?.success) {
        setError(orderRes?.message || "Failed to create payment order.");
        setProcessing(false);
        return;
      }

      const { bookingId, orderId, amount, currency, keyId } = orderRes;

      // 2. Open Razorpay Standard Checkout Gateway Modal
      if (window.Razorpay) {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || "INR",
          name: "Wadi Al Zaitoon Tourism",
          description: `Tour Reservation: ${packageData?.packageName}`,
          image: packageData?.packageImages?.[0] || "/assets/favicon.ico",
          order_id: orderId,
          prefill: {
            name: bookingState.leadTraveller?.fullName || currentUser?.username || "",
            email: bookingState.leadTraveller?.email || currentUser?.email || "",
            contact: bookingState.leadTraveller?.phone || currentUser?.phone || "",
          },
          theme: {
            color: "#0F172A",
          },
          handler: async function (response) {
            try {
              // 3. Post Payment Callback Payload to Backend for HMAC Signature Verification
              const verifyRes = await verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes?.success) {
                // 4. Submit Passenger Manifest to /api/traveller/:bookingId/travellers
                try {
                  const manifestArray = [];
                  // Lead traveller
                  manifestArray.push({
                    passengerNumber: 1,
                    fullName: bookingState.leadTraveller.fullName,
                    age: 30,
                    gender: bookingState.leadTraveller.gender || "Male",
                    idType: bookingState.leadTraveller.idType || "Passport",
                    idNumber: bookingState.leadTraveller.idNumber || "Z1234567",
                  });
                  // Additionals
                  (bookingState.additionalTravellers || []).forEach((t, i) => {
                    manifestArray.push({
                      passengerNumber: i + 2,
                      fullName: t.fullName,
                      age: t.age || 25,
                      gender: t.gender || "Male",
                      idType: t.idType || "Passport",
                      idNumber: t.idNumber || "Z1234567",
                    });
                  });

                  await submitTravellers(bookingId, { travellers: manifestArray });
                } catch {
                  // Ignore manifest save non-blocking errors
                }

                // Set confirmed booking state
                setConfirmedBooking({
                  bookingId: bookingId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  totalPrice: totals.grandTotal,
                  paidAt: new Date().toISOString(),
                });

                navigate(`/booking/${packageId}/confirmation?bookingId=${bookingId}`);
              } else {
                setError(verifyRes?.message || "Payment verification failed.");
                setProcessing(false);
              }
            } catch (err) {
              setError("Verification Error: " + err.message);
              setProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              alert("Payment session cancelled. You can retry payment when ready.");
              setProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setError("Razorpay Checkout SDK failed to load. Please refresh the page.");
        setProcessing(false);
      }
    } catch (err) {
      setError("Payment Error: " + err.message);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Secure Checkout
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete your reservation using 256-Bit SSL encrypted Razorpay payment gateway.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Razorpay Payment Card */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Razorpay Standard Checkout</h3>
              <p className="text-[11px] text-slate-400">Supports UPI, Credit/Debit Cards, Net Banking & Wallets</p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-emerald-400 px-3 py-1 rounded-full border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL
          </span>
        </div>

        {/* Amount Summary Pill */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Payable Amount</span>
            <span className="text-2xl font-black text-white">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
            All Taxes Included
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Your payment details are protected by Razorpay SSL 256-bit encryption. Wadi Al Zaitoon does not store your card or bank credentials.
        </p>

        {/* Dynamic CTA Button */}
        <button
          onClick={handleRazorpayCheckout}
          disabled={processing}
          className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
        >
          <Lock className="w-4 h-4 text-white" />
          <span>{processing ? "Processing Checkout..." : `PAY ₹${totals.grandTotal.toLocaleString('en-IN')}`}</span>
        </button>
      </div>

      {/* Navigation CTAs */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(`/booking/${packageId}/review`)}
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review</span>
        </button>
      </div>

    </div>
  );
};

export default PaymentStep;
