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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import MyBookings from "../booking/MyBookings";
import { updateProfile, updatePassword as updatePasswordApi } from "../../services/userService";
import { getUserCurrentBookings } from "../../services/bookingService";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const Profile = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");

  // Profile Edit Mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
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

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        address: currentUser.address || "",
        phone: currentUser.phone || "",
      });

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
    try {
      const data = await updateProfile(currentUser._id, formData);
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
    }
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
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      isUserAdmin
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isUserAdmin ? "Administrator" : "Traveler"}
                  </span>
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
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditingProfile ? "Close Edit Mode" : "Edit Profile"}
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
                    Manage your personal travel contact information.
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditingProfile ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateUserDetails} className="space-y-4">
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

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        PHONE NUMBER
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="phone"
                          placeholder="+971 50 123 4567"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        ADDRESS
                      </label>
                      <div className="relative">
                        <textarea
                          id="address"
                          rows={2}
                          placeholder="City, Country"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                        />
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
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

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      PHONE NUMBER
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {currentUser.phone || "Not provided (Edit to add)"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      ADDRESS
                    </span>
                    <p className="font-bold text-slate-800 text-sm">
                      {currentUser.address || "Not provided (Edit to add)"}
                    </p>
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

          {/* Account Actions */}
          <FadeIn>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900">
                    ACCOUNT ACTIONS
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    Sign out of your Wadi Al Zaitoon account.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  LOG OUT
                </button>
              </div>
            </div>
          </FadeIn>

        </div>

      </div>
    </PageTransition>
  );
};

export default Profile;
