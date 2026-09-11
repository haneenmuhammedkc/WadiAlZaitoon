import React, { createContext, useContext, useEffect, useState } from "react";
import { AVAILABLE_ADDONS, ROOM_TYPES } from "../../constants/booking.constants";

const BookingContext = createContext();

export const BookingProvider = ({ packageId, packageData, children }) => {
  const STORAGE_KEY = `wzt_booking_state_${packageId}`;

  // Initial State Factory
  const getInitialState = () => {
    const today = new Date().toISOString().split("T")[0];
    
    // Try restoring non-sensitive state from sessionStorage
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          departureDate: parsed.departureDate || today,
          returnDate: parsed.returnDate || "",
          adults: parsed.adults || 2,
          children: parsed.children || 0,
          childAges: parsed.childAges || [],
          infants: parsed.infants || 0,
          rooms: parsed.rooms || 1,
          selectedRoom: parsed.selectedRoom || ROOM_TYPES[0],
          selectedAddOns: parsed.selectedAddOns || [],
          leadTraveller: parsed.leadTraveller || {
            fullName: "",
            email: "",
            phone: "",
            dob: "",
            gender: "Male",
            nationality: "Indian",
            idType: "Passport",
            idNumber: "",
          },
          additionalTravellers: parsed.additionalTravellers || [],
          termsAccepted: parsed.termsAccepted || false,
          policyAccepted: parsed.policyAccepted || false,
        };
      }
    } catch {
      // Fallback if sessionStorage fails
    }

    return {
      departureDate: today,
      returnDate: "",
      adults: 2,
      children: 0,
      childAges: [],
      infants: 0,
      rooms: 1,
      selectedRoom: ROOM_TYPES[0],
      selectedAddOns: [],
      leadTraveller: {
        fullName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "Male",
        nationality: "Indian",
        idType: "Passport",
        idNumber: "",
      },
      additionalTravellers: [],
      termsAccepted: false,
      policyAccepted: false,
    };
  };

  const [bookingState, setBookingState] = useState(getInitialState);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Calculate return date whenever departure date or package duration changes
  useEffect(() => {
    if (bookingState.departureDate && packageData?.packageDays) {
      const dept = new Date(bookingState.departureDate);
      if (!isNaN(dept.getTime())) {
        const ret = new Date(dept);
        ret.setDate(ret.getDate() + (packageData.packageDays - 1));
        const formattedReturn = ret.toISOString().split("T")[0];
        if (formattedReturn !== bookingState.returnDate) {
          setBookingState((prev) => ({ ...prev, returnDate: formattedReturn }));
        }
      }
    }
  }, [bookingState.departureDate, packageData?.packageDays]);

  // Sync non-sensitive booking parameters to sessionStorage
  useEffect(() => {
    try {
      const toSave = {
        departureDate: bookingState.departureDate,
        returnDate: bookingState.returnDate,
        adults: bookingState.adults,
        children: bookingState.children,
        childAges: bookingState.childAges,
        infants: bookingState.infants,
        rooms: bookingState.rooms,
        selectedRoom: bookingState.selectedRoom,
        selectedAddOns: bookingState.selectedAddOns,
        leadTraveller: bookingState.leadTraveller,
        additionalTravellers: bookingState.additionalTravellers,
        termsAccepted: bookingState.termsAccepted,
        policyAccepted: bookingState.policyAccepted,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore storage quota errors
    }
  }, [bookingState, STORAGE_KEY]);

  // Update Travel Details (Step 1)
  const updateTravelDetails = (travelData) => {
    setBookingState((prev) => ({
      ...prev,
      ...travelData,
    }));
  };

  // Update Hotel Room Selection (Step 2)
  const updateSelectedRoom = (room) => {
    setBookingState((prev) => ({
      ...prev,
      selectedRoom: room,
    }));
  };

  // Toggle Add-on Selection (Step 3)
  const toggleAddOn = (addon) => {
    setBookingState((prev) => {
      const exists = prev.selectedAddOns.some((a) => a.id === addon.id);
      let updated;
      if (exists) {
        updated = prev.selectedAddOns.filter((a) => a.id !== addon.id);
      } else {
        updated = [...prev.selectedAddOns, addon];
      }
      return { ...prev, selectedAddOns: updated };
    });
  };

  // Update Traveller Details (Step 4)
  const updateTravellerDetails = (lead, additionals) => {
    setBookingState((prev) => ({
      ...prev,
      leadTraveller: lead,
      additionalTravellers: additionals,
    }));
  };

  // Update Review Terms Acceptance (Step 5)
  const updateTermsAcceptance = (termsAccepted, policyAccepted) => {
    setBookingState((prev) => ({
      ...prev,
      termsAccepted,
      policyAccepted,
    }));
  };

  // Price Calculation Logic
  const calculateTotals = () => {
    const unitPrice =
      packageData?.packageOffer && packageData?.packageDiscountPrice > 0
        ? packageData.packageDiscountPrice
        : packageData?.packagePrice || 0;

    const totalPersons = Math.max(1, (bookingState.adults || 1) + (bookingState.children || 0));
    const baseTotal = unitPrice * totalPersons;

    const roomMultiplier = bookingState.selectedRoom?.priceMultiplier || 1.0;
    const roomTotal = Math.round(baseTotal * roomMultiplier);

    const addOnsTotal = (bookingState.selectedAddOns || []).reduce((acc, addon) => {
      if (addon.type === "per_person") {
        return acc + addon.price * totalPersons;
      }
      return acc + addon.price;
    }, 0);

    const grandTotal = roomTotal + addOnsTotal;

    return {
      unitPrice,
      totalPersons,
      baseTotal,
      roomMultiplier,
      roomTotal,
      addOnsTotal,
      grandTotal,
    };
  };

  // Clear Session Data
  const clearBookingState = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <BookingContext.Provider
      value={{
        packageId,
        packageData,
        bookingState,
        confirmedBooking,
        setConfirmedBooking,
        updateTravelDetails,
        updateSelectedRoom,
        toggleAddOn,
        updateTravellerDetails,
        updateTermsAcceptance,
        calculateTotals,
        clearBookingState,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
