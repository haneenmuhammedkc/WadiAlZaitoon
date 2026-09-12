import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Phone, Lock, Eye, EyeOff, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, updatePassword as updatePasswordApi } from "../../services/userService";

const AdminUpdateProfile = () => {
  const navigate = useNavigate();
  const { user: currentUser, updateUser, loading, error } = useAuth();
  const [updateProfileDetailsPanel, setUpdateProfileDetailsPanel] = useState(true);
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    address: "",
    phone: "",
  });
  const [updatePassword, setUpdatePassword] = useState({
    oldpassword: "",
    newpassword: "",
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username || "",
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
      currentUser.address === formData.address &&
      currentUser.phone === formData.phone
    ) {
      alert("Change at least 1 field to update details");
      return;
    }
    try {
      const data = await updateProfile(currentUser._id, formData);
      if (data?.success) {
        alert(data?.message || "Admin Profile Updated Successfully");
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
    <div className="p-6 font-sans max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> System Administrator
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Profile Settings</h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Admin Account</span>
          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-block mt-0.5">
            {currentUser?.email}
          </span>
        </div>
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
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Admin Profile Info</span>
        </button>
        <button
          onClick={() => setUpdateProfileDetailsPanel(false)}
          className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            !updateProfileDetailsPanel
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Security Password</span>
        </button>
      </div>

      {/* Details Form */}
      {updateProfileDetailsPanel ? (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={updateUserDetails} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Admin Name</label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Phone</label>
                <input
                  type="text"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Address / Base</label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md mt-4 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Updating..." : "Save Admin Profile"}
            </button>
          </form>
        </div>
      ) : (
        /* Password Form */
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <form onSubmit={updateUserPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Current Admin Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  id="oldpassword"
                  value={updatePassword.oldpassword}
                  onChange={handlePass}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newpassword"
                  value={updatePassword.newpassword}
                  onChange={handlePass}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md mt-4 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Security Password"}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminUpdateProfile;
