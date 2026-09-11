import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Mail, MapPin, Phone, Lock, Key, ArrowLeft, Eye, EyeOff } from "lucide-react";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  updatePassStart,
  updatePassSuccess,
  updatePassFailure,
} from "../../redux/user/userSlice";
import { apiFetch } from "../../services/api";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [updateProfileDetailsPanel, setUpdateProfileDetailsPanel] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    avatar: "",
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
        avatar: currentUser.avatar || "",
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
      dispatch(updateUserStart());
      const data = await apiFetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (data?.success) {
        alert(data?.message || "Profile Updated Successfully");
        dispatch(updateUserSuccess(data?.user));
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
        alert(data?.message || "Password Updated Successfully");
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
    <div className="w-full max-w-lg mx-auto py-2">
      {updateProfileDetailsPanel ? (
        <form onSubmit={updateUserDetails} className="space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-lg text-slate-900">Update Profile Details</h3>
            <p className="text-xs text-slate-500 font-normal">Keep your personal contact information up to date.</p>
          </div>

          <div className="space-y-3">
            
            <div className="space-y-1">
              <label htmlFor="username" className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="phone"
                  placeholder="+971 50 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="address" className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Address
              </label>
              <div className="relative">
                <textarea
                  id="address"
                  rows={2}
                  placeholder="City, Country"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setUpdateProfileDetailsPanel(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-blue-600" /> Password Settings
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={updateUserPassword} className="space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Change Password</h3>
              <p className="text-xs text-slate-500 font-normal">Update your security credentials.</p>
            </div>
            <button
              type="button"
              onClick={() => setUpdateProfileDetailsPanel(true)}
              className="text-xs text-blue-600 font-extrabold hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
            </button>
          </div>

          <div className="space-y-3">
            
            <div className="space-y-1">
              <label htmlFor="oldpassword" className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? "text" : "password"}
                  id="oldpassword"
                  value={updatePassword.oldpassword}
                  onChange={handlePass}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="newpassword" className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  id="newpassword"
                  placeholder="Minimum 6 characters"
                  value={updatePassword.newpassword}
                  onChange={handlePass}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  required
                />
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateProfile;
