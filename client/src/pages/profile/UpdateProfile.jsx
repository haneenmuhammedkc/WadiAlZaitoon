import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, MapPin, Phone, Lock, Key, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, updatePassword as updatePasswordApi } from "../../services/userService";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser, loading, error } = useAuth();
  const [updateProfileDetailsPanel, setUpdateProfileDetailsPanel] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
  });
  const [updatePassword, setUpdatePassword] = useState({
    oldpassword: "",
    newpassword: "",
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        address: currentUser.address || "",
        phone: currentUser.phone || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handlePass = (e) => {
    setUpdatePassword({
      ...updatePassword,
      [e.target.id]: e.target.value,
    });
  };

  const updateUserDetails = async (e) => {
    e.preventDefault();
    if (
      currentUser.username === formData.username &&
      currentUser.email === formData.email &&
      currentUser.address === formData.address &&
      currentUser.phone === formData.phone
    ) {
      alert("Change at least 1 field to update details");
      return;
    }
    try {
      const data = await updateProfile(currentUser._id, formData);
      if (data?.success) {
        alert(data?.message || "Profile Updated Successfully");
        updateUser(data?.user);
      } else {
        alert(data?.message || "Failed to update profile");
        if (data?.status === 401) {
          navigate("/login");
        }
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const updateUserPassword = async (e) => {
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

  return (
    <div className="py-12 bg-slate-50 min-h-screen px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile</span>
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-2xl bg-slate-200/80 p-1.5 gap-1">
          <button
            onClick={() => setUpdateProfileDetailsPanel(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              updateProfileDetailsPanel
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setUpdateProfileDetailsPanel(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              !updateProfileDetailsPanel
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Profile Details Panel */}
        {updateProfileDetailsPanel ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Personal Information
            </h2>
            <form onSubmit={updateUserDetails} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Location / City</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Kerala, India"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Updating..." : "Save Profile Changes"}
              </button>
            </form>
          </div>
        ) : (
          /* Password Change Panel */
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Change Security Password
            </h2>
            <form onSubmit={updateUserPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPass ? "text" : "password"}
                    id="oldpassword"
                    placeholder="••••••••"
                    value={updatePassword.oldpassword}
                    onChange={handlePass}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    id="newpassword"
                    placeholder="Minimum 6 characters"
                    value={updatePassword.newpassword}
                    onChange={handlePass}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                    required
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password Now"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default UpdateProfile;
