import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Edit3,
  ShieldCheck,
  Compass,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Map,
  Hash,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import MyBookings from "../booking/MyBookings";
import { updateProfile, updatePassword as updatePasswordApi } from "../../services/userService";
import { getUserCurrentBookings } from "../../services/bookingService";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const COUNTRIES = [
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Saudi Arabia",
  "Qatar",
  "Oman",
  "Kuwait",
  "Bahrain",
  "Palestine",
  "Jordan",
  "Egypt",
  "India",
  "Pakistan",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Turkey",
  "Malaysia",
  "Singapore",
  "Indonesia",
  "China",
  "Japan",
  "South Korea",
  "South Africa",
  "Brazil",
  "Argentina",
  "Other / Unlisted",
];

// Helper to parse address (native object, JSON string, or legacy plain string) into structured fields
const parseAddressData = (rawAddress) => {
  const emptyAddress = {
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    customField: {
      name: "",
      value: "",
    },
  };

  if (!rawAddress) return emptyAddress;

  let parsed = rawAddress;
  if (typeof rawAddress === "string") {
    const trimmed = rawAddress.trim();
    if (!trimmed || trimmed === "[object Object]") return emptyAddress;
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return { ...emptyAddress, streetAddress: trimmed };
      }
    } else {
      return { ...emptyAddress, streetAddress: trimmed };
    }
  }

  if (typeof parsed !== "object" || parsed === null) {
    return emptyAddress;
  }

  const rawStreet = parsed.streetAddress ? String(parsed.streetAddress).trim() : "";
  const cleanStreet = rawStreet === "[object Object]" ? "" : rawStreet;

  const customName = parsed.customField?.name ? String(parsed.customField.name).trim() : "";
  const customVal = parsed.customField?.value ? String(parsed.customField.value).trim() : "";

  return {
    streetAddress: cleanStreet,
    apartment: parsed.apartment ? String(parsed.apartment).trim() : "",
    city: parsed.city ? String(parsed.city).trim() : "",
    state: parsed.state ? String(parsed.state).trim() : "",
    postalCode: parsed.postalCode ? String(parsed.postalCode).trim() : "",
    country: parsed.country ? String(parsed.country).trim() : "",
    customField: {
      name: customName.slice(0, 50),
      value: customVal.slice(0, 250),
    },
  };
};

const PHONE_COUNTRIES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+995", country: "Georgia", flag: "🇬🇪" },
  { code: "+994", country: "Azerbaijan", flag: "🇦🇿" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+960", country: "Maldives", flag: "🇲🇻" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+970", country: "Palestine", flag: "🇵🇸" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
];

// Format raw input digits by inserting a space after every 5 digits
const formatLocalPhone = (rawInput) => {
  if (!rawInput) return "";
  const digits = String(rawInput).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 5) {
    return digits;
  }
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 10);
  const part3 = digits.slice(10, 15);
  return [part1, part2, part3].filter(Boolean).join(" ");
};

// Helper to parse stored phone string into countryCode and localPhone
const parsePhoneNumber = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { countryCode: "+971", localPhone: "" };
  }
  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return { countryCode: "+971", localPhone: "" };
  }

  if (trimmed.startsWith("+")) {
    const sortedCountries = [...PHONE_COUNTRIES].sort(
      (a, b) => b.code.length - a.code.length
    );
    for (const country of sortedCountries) {
      if (trimmed.startsWith(country.code)) {
        const rest = trimmed.slice(country.code.length).trim();
        return {
          countryCode: country.code,
          localPhone: formatLocalPhone(rest),
        };
      }
    }

    const match = trimmed.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      return {
        countryCode: match[1],
        localPhone: formatLocalPhone(match[2]),
      };
    }
  }

  return {
    countryCode: "+971",
    localPhone: formatLocalPhone(trimmed),
  };
};

const Profile = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");

  // Profile Edit Mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  // Country Code + Phone State
  const [phoneCountryCode, setPhoneCountryCode] = useState("+971");
  const [localPhone, setLocalPhone] = useState("");

  // Structured Address State
  const [addressData, setAddressData] = useState({
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    customField: {
      name: "",
      value: "",
    },
  });

  // Password Change State
  const [updatePassword, setUpdatePassword] = useState({
    oldpassword: "",
    newpassword: "",
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Booking Stats State
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      });

      const parsedAddr = parseAddressData(currentUser.address);
      setAddressData(parsedAddr);

      const parsedPhone = parsePhoneNumber(currentUser.phone);
      setPhoneCountryCode(parsedPhone.countryCode);
      setLocalPhone(parsedPhone.localPhone);

      // Fetch active bookings count for overview card
      const fetchBookingsCount = async () => {
        try {
          const data = await getUserCurrentBookings(currentUser._id);
          if (data?.success) {
            setActiveBookingsCount(data?.bookings?.length || 0);
          }
        } catch {
          // Ignore error silently
        }
      };
      fetchBookingsCount();
    }
  }, [currentUser]);

  // Handle Profile Details Update
  const handleUpdateUserDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanStreet = addressData.streetAddress ? addressData.streetAddress.trim() : "";
      const cleanApartment = addressData.apartment ? addressData.apartment.trim() : "";
      const cleanCity = addressData.city ? addressData.city.trim() : "";
      const cleanState = addressData.state ? addressData.state.trim() : "";
      const cleanPostal = addressData.postalCode ? addressData.postalCode.trim() : "";
      const cleanCountry = addressData.country ? addressData.country.trim() : "";

      const cName = addressData.customField?.name ? addressData.customField.name.trim().slice(0, 50) : "";
      const cVal = addressData.customField?.value ? addressData.customField.value.trim().slice(0, 250) : "";
      const hasCustom = Boolean(cName && cVal);

      const structuredAddress = {
        streetAddress: cleanStreet,
        apartment: cleanApartment,
        city: cleanCity,
        state: cleanState,
        postalCode: cleanPostal,
        country: cleanCountry,
        customField: {
          name: hasCustom ? cName : "",
          value: hasCustom ? cVal : "",
        },
      };

      const cleanDigits = localPhone.replace(/\D/g, "");
      const formattedLocal = formatLocalPhone(cleanDigits);
      const fullPhone = formattedLocal ? `${phoneCountryCode} ${formattedLocal}` : "";

      const payload = {
        username: formData.username,
        email: formData.email,
        phone: fullPhone,
        address: structuredAddress,
      };

      const data = await updateProfile(currentUser._id, payload);
      if (data?.success) {
        alert(data?.message || "Profile details updated successfully!");
        updateUser(data?.user);
        setIsEditingProfile(false);
      } else {
        alert(data?.message || "Failed to update profile details");
        if (data?.status === 401) {
          navigate("/login");
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to saved profile data on cancel
  const handleCancelEdit = () => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
      });
      setAddressData(parseAddressData(currentUser.address));
      const parsedPhone = parsePhoneNumber(currentUser.phone);
      setPhoneCountryCode(parsedPhone.countryCode);
      setLocalPhone(parsedPhone.localPhone);
    }
    setIsEditingProfile(false);
  };

  // Handle Password Update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (
      !updatePassword.oldpassword ||
      !updatePassword.newpassword ||
      updatePassword.newpassword.length < 6
    ) {
      alert("Old password and new password (minimum 6 characters) are required!");
      return;
    }
    if (updatePassword.oldpassword === updatePassword.newpassword) {
      alert("New password cannot be identical to your current password!");
      return;
    }
    setLoading(true);
    try {
      const data = await updatePasswordApi(currentUser._id, updatePassword);
      if (data?.success) {
        alert(data?.message || "Password updated successfully!");
        setUpdatePassword({ oldpassword: "", newpassword: "" });
      } else {
        alert(data?.message || "Failed to update password");
        if (data?.status === 401) {
          navigate("/login");
        }
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 pt-28">
        <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4 text-slate-700 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Sign In Required</h2>
        <p className="text-xs text-slate-500 mb-6 max-w-sm">
          Please sign in to access your Wadi Al Zaitoon travel account and manage reservations.
        </p>
        <Link
          to="/login"
          className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const isUserAdmin = currentUser.user_role === 1;

  return (
    <PageTransition>
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 pt-28 sm:pt-32 pb-24">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Page Header */}
          <FadeIn>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-extrabold text-blue-600">
                <Compass className="w-4 h-4 text-blue-600 shrink-0" />
                <span>MY TRAVEL ACCOUNT</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Account Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Manage your profile, bookings and account settings.
              </p>
            </div>
          </FadeIn>

          {/* Profile Identity Card (NO PROFILE IMAGE AT ALL) */}
          <FadeIn>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentUser.username}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{currentUser.email}</span>
                  </div>
                  {currentUser.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{currentUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Log out
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Personal Information Section */}
          <FadeIn>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    PERSONAL INFORMATION
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Manage your personal travel contact information and residential address.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (isEditingProfile) handleCancelEdit();
                    else setIsEditingProfile(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateUserDetails} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        FULL NAME
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="username"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          required
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        EMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          required
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        PHONE NUMBER
                      </label>
                      <div className="flex w-full items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 overflow-hidden transition-all shadow-sm">
                        {/* Small Country Code Selector (105px - 115px) */}
                        <div className="relative shrink-0 w-[105px] sm:w-[115px] border-r border-slate-200 bg-slate-100/70 hover:bg-slate-100 transition-colors">
                          <select
                            id="phoneCountryCode"
                            value={phoneCountryCode}
                            onChange={(e) => setPhoneCountryCode(e.target.value)}
                            className="w-full bg-transparent px-2.5 py-3 text-xs font-extrabold text-slate-900 focus:outline-none appearance-none cursor-pointer pr-6 truncate"
                            title="Select Country Calling Code"
                          >
                            {PHONE_COUNTRIES.map((c, idx) => (
                              <option key={c.code + c.country + idx} value={c.code}>
                                {c.flag} {c.code} ({c.country})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-3.5 pointer-events-none" />
                        </div>

                        {/* Local Phone Input */}
                        <div className="relative flex-1 min-w-0">
                          <input
                            type="text"
                            id="localPhone"
                            placeholder="70124 99391"
                            value={localPhone}
                            onChange={(e) =>
                              setLocalPhone(formatLocalPhone(e.target.value))
                            }
                            className="w-full bg-transparent px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STRUCTURED ADDRESS FORM SECTION */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        ADDRESS DETAILS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Street Address - Full Width */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          STREET ADDRESS
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="streetAddress"
                            placeholder="House / Building / Street"
                            value={addressData.streetAddress}
                            onChange={(e) =>
                              setAddressData({ ...addressData, streetAddress: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      {/* Apartment / Unit */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          APARTMENT / UNIT <span className="text-slate-400 font-normal">(OPTIONAL)</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="apartment"
                            placeholder="Apartment, Suite, Unit (Optional)"
                            value={addressData.apartment}
                            onChange={(e) =>
                              setAddressData({ ...addressData, apartment: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      {/* City */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          CITY
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="city"
                            placeholder="Enter city"
                            value={addressData.city}
                            onChange={(e) =>
                              setAddressData({ ...addressData, city: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      {/* State / Province */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          STATE / PROVINCE
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="state"
                            placeholder="Enter state / province"
                            value={addressData.state}
                            onChange={(e) =>
                              setAddressData({ ...addressData, state: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <Map className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      {/* Postal / ZIP Code */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          POSTAL / ZIP CODE
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            id="postalCode"
                            placeholder="Enter postal / ZIP code"
                            value={addressData.postalCode}
                            onChange={(e) =>
                              setAddressData({ ...addressData, postalCode: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                          <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        </div>
                      </div>

                      {/* Country Dropdown */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          COUNTRY
                        </label>
                        <div className="relative">
                          <select
                            id="country"
                            value={addressData.country}
                            onChange={(e) =>
                              setAddressData({ ...addressData, country: e.target.value })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                          >
                            <option value="">Select country</option>
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* CUSTOM FIELD (OPTIONAL) SECTION */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          CUSTOM FIELD <span className="text-slate-400 font-normal">(OPTIONAL)</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Custom Field Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            FIELD NAME <span className="text-slate-400 font-normal">(OPTIONAL)</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="customFieldName"
                              placeholder="e.g. Landmark"
                              maxLength={50}
                              value={addressData.customField?.name || ""}
                              onChange={(e) =>
                                setAddressData({
                                  ...addressData,
                                  customField: {
                                    ...addressData.customField,
                                    name: e.target.value,
                                  },
                                })
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Custom Field Value */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            FIELD VALUE <span className="text-slate-400 font-normal">(OPTIONAL)</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="customFieldValue"
                              placeholder="e.g. Near Thalassery Railway Station"
                              maxLength={250}
                              value={addressData.customField?.value || ""}
                              onChange={(e) =>
                                setAddressData({
                                  ...addressData,
                                  customField: {
                                    ...addressData.customField,
                                    value: e.target.value,
                                  },
                                })
                              }
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3 justify-end">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "SAVE CHANGES"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      FULL NAME
                    </span>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {currentUser.username}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      EMAIL ADDRESS
                    </span>
                    <p className="font-extrabold text-slate-900 text-sm">
                      {currentUser.email}
                    </p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      PHONE NUMBER
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {currentUser.phone || "Not provided (Edit profile to add)"}
                    </p>
                  </div>

                  {/* STRUCTURED ADDRESS VIEW BLOCK */}
                  <div className="space-y-1 sm:col-span-2 border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      ADDRESS DETAILS
                    </span>
                    {currentUser.address ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-slate-800 text-xs font-semibold">
                        {(() => {
                          const parsed = parseAddressData(currentUser.address);
                          const hasStandard = Boolean(
                            parsed.streetAddress ||
                              parsed.apartment ||
                              parsed.city ||
                              parsed.state ||
                              parsed.postalCode ||
                              parsed.country
                          );

                          const customName = parsed.customField?.name ? parsed.customField.name.trim() : "";
                          const customVal = parsed.customField?.value ? parsed.customField.value.trim() : "";
                          const hasCustom = Boolean(customName && customVal);

                          if (!hasStandard && !hasCustom) {
                            return (
                              <p className="font-bold text-slate-900 text-sm">
                                {typeof currentUser.address === "string" && currentUser.address !== "[object Object]"
                                  ? currentUser.address
                                  : "No address provided"}
                              </p>
                            );
                          }

                          return (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {parsed.streetAddress && (
                                  <div className="space-y-0.5 sm:col-span-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                      STREET ADDRESS
                                    </span>
                                    <p className="font-extrabold text-slate-900 text-sm">{parsed.streetAddress}</p>
                                  </div>
                                )}

                                {parsed.apartment && (
                                  <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                      APARTMENT / UNIT
                                    </span>
                                    <p className="font-bold text-slate-800 text-xs">{parsed.apartment}</p>
                                  </div>
                                )}

                                {parsed.city && (
                                  <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                      CITY
                                    </span>
                                    <p className="font-bold text-slate-800 text-xs">{parsed.city}</p>
                                  </div>
                                )}

                                {parsed.state && (
                                  <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                      STATE / PROVINCE
                                    </span>
                                    <p className="font-bold text-slate-800 text-xs">{parsed.state}</p>
                                  </div>
                                )}

                                {parsed.postalCode && (
                                  <div className="space-y-0.5">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                      POSTAL / ZIP CODE
                                    </span>
                                    <p className="font-bold text-slate-800 text-xs">{parsed.postalCode}</p>
                                  </div>
                                )}

                                {parsed.country && (
                                  <div className="space-y-0.5 sm:col-span-2">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                      COUNTRY
                                    </span>
                                    <p className="text-blue-600 font-extrabold uppercase tracking-wider text-xs flex items-center gap-1">
                                      <Globe className="w-3.5 h-3.5 inline shrink-0" /> {parsed.country}
                                    </p>
                                  </div>
                                )}

                                {hasCustom && (
                                  <div className="space-y-0.5 sm:col-span-2 pt-2 border-t border-slate-200/60">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                      {customName.toUpperCase()}
                                    </span>
                                    <p className="font-extrabold text-slate-900 text-xs">{customVal}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">
                        Not provided (Edit profile to add)
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </FadeIn>

          {/* My Bookings Section */}
          <FadeIn>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-xl text-slate-900">
                  MY BOOKINGS
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  View and manage your tour package reservations.
                </p>
              </div>

              <MyBookings />
            </div>
          </FadeIn>

          {/* Security Section */}
          <FadeIn>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-xl text-slate-900">
                  SECURITY
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Keep your Wadi Al Zaitoon account secure with a strong password.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    CURRENT PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPass ? "text" : "password"}
                      id="oldpassword"
                      placeholder="Current password"
                      value={updatePassword.oldpassword}
                      onChange={(e) =>
                        setUpdatePassword({
                          ...updatePassword,
                          oldpassword: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowOldPass(!showOldPass)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    NEW PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      id="newpassword"
                      placeholder="Minimum 6 characters"
                      value={updatePassword.newpassword}
                      onChange={(e) =>
                        setUpdatePassword({
                          ...updatePassword,
                          newpassword: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "CHANGE PASSWORD"}
                  </button>
                </div>
              </form>
            </div>
          </FadeIn>

        </div>

      </div>
    </PageTransition>
  );
};

export default Profile;
