import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Phone, Lock, Eye, EyeOff, ShieldCheck, UserCheck } from "lucide-react";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  updatePassStart,
  updatePassSuccess,
  updatePassFailure,
} from "../../redux/user/userSlice";
import { apiFetch } from "../../services/api";

const AdminUpdateProfile = () => {
  const navigate = useNavigate();
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [updateProfileDetailsPanel, setUpdateProfileDetailsPanel] = useState(true);
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    address: "",
    phone: "",
    avatar: "",
  });
  const [updatePassword, setUpdatePassword] = useState({
    oldpassword: "",
    newpassword: "",
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username,
        address: currentUser.address,
        phone: currentUser.phone,
        avatar: currentUser.avatar,
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
      alert("Please modify at least one field to update profile details");
      return;
    }
    try {
      dispatch(updateUserStart());
      const data = await apiFetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (data?.success) {
        alert(data?.message || "Admin Profile Updated Successfully!");
        dispatch(updateUserSuccess(data?.user));
        return;
      } else {
        dispatch(updateUserFailure(data?.message));
        alert(data?.message || "Failed to update profile");
        if (data?.status === 401) {
          navigate("/login");
        }
      }
    } catch (err) {
      dispatch(updateUserFailure(err.message));
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
      alert("Old password and new password (min 6 chars) are required!");
      return;
    }
    if (updatePassword.oldpassword === updatePassword.newpassword) {
      alert("New password cannot be identical to current password!");
      return;
    }
    try {
      dispatch(updatePassStart());
      const data = await apiFetch(`/api/user/update-password/${currentUser._id}`, {
        method: "POST",
        body: JSON.stringify(updatePassword),
      });
      if (data?.success) {
        dispatch(updatePassSuccess());
        alert(data?.message || "Admin Password Updated Successfully!");
        setUpdatePassword({
          oldpassword: "",
          newpassword: "",
        });
      } else {
        dispatch(updatePassFailure(data?.message));
        alert(data?.message || "Failed to update password");
        if (data?.status === 401) {
          navigate("/login");
        }
      }
    } catch (err) {
      dispatch(updatePassFailure(err.message));
      alert(err.message);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl uppercase shrink-0 shadow-md">
          {currentUser?.username?.charAt(0) || "A"}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {currentUser?.username || "Admin Profile"}
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider">
              Administrator
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
        <button
          onClick={() => setUpdateProfileDetailsPanel(true)}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            updateProfileDetailsPanel
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> General Details
        </button>
        <button
          onClick={() => setUpdateProfileDetailsPanel(false)}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            !updateProfileDetailsPanel
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Security & Password
        </button>
      </div>

      {/* Card Form */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {updateProfileDetailsPanel ? (
          <form onSubmit={updateUserDetails} className="space-y-4">
            
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Administrator Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone Number
              </label>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="address" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Office Address
              </label>
              <textarea
                id="address"
                rows={3}
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? "Saving Changes..." : "Save Admin Profile"}
            </button>
          </form>
        ) : (
          <form onSubmit={updateUserPassword} className="space-y-4">
            
            <div className="space-y-1">
              <label htmlFor="oldpassword" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  id="oldpassword"
                  value={updatePassword.oldpassword}
                  onChange={handlePass}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-9 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="newpassword" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newpassword"
                  value={updatePassword.newpassword}
                  onChange={handlePass}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all pr-9 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters long</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? "Updating Password..." : "Update Security Password"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
};

export default AdminUpdateProfile;
