import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../../components/admin/common/AdminHeader";
import AdminSidebar from "../../components/admin/common/AdminSidebar";
import { PageTransition } from "../../components/animations/Motion";
import { apiFetch } from "../../services/api";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  logOutStart,
  logOutSuccess,
  logOutFailure,
  deleteUserAccountStart,
  deleteUserAccountSuccess,
  deleteUserAccountFailure,
} from "../../redux/user/userSlice";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../firebase";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);

  const [profilePhoto, setProfilePhoto] = useState(undefined);
  const [activePanelId, setActivePanelId] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
    avatar: "",
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        address: currentUser.address,
        phone: currentUser.phone,
        avatar: currentUser.avatar,
      });
    }
  }, [currentUser]);

  // Sync activePanelId from location state if returning to /profile/admin
  useEffect(() => {
    if (location.pathname === "/profile/admin" && location.state?.activePanelId !== undefined) {
      setActivePanelId(location.state.activePanelId);
    }
  }, [location.pathname, location.state]);

  const handleProfilePhoto = (photo) => {
    try {
      dispatch(updateUserStart());
      const storage = getStorage(app);
      const photoname = new Date().getTime() + photo.name.replace(/\s/g, "");
      const storageRef = ref(storage, `profile-photos/${photoname}`);
      const uploadTask = uploadBytesResumable(storageRef, photo);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.log(error);
          dispatch(updateUserFailure(error.message));
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadUrl) => {
            const data = await apiFetch(
              `/api/user/update-profile-photo/${currentUser._id}`,
              {
                method: "POST",
                body: JSON.stringify({ avatar: downloadUrl }),
              }
            );
            if (data?.success) {
              alert(data?.message || "Profile photo updated");
              setFormData((prev) => ({ ...prev, avatar: downloadUrl }));
              dispatch(updateUserSuccess(data?.user));
              setProfilePhoto(null);
            } else {
              dispatch(updateUserFailure(data?.message));
              alert(data?.message || "Failed to update profile photo");
            }
          });
        }
      );
    } catch (error) {
      console.log(error);
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleLogout = async () => {
    try {
      dispatch(logOutStart());
      const data = await apiFetch("/api/auth/logout");
      if (data?.success !== true) {
        dispatch(logOutFailure(data?.message));
        return;
      }
      dispatch(logOutSuccess());
      navigate("/login");
      alert(data?.message || "Logged out successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e?.preventDefault();
    const CONFIRM = confirm(
      "Are you sure? Your administrator account will be permanently deleted!"
    );
    if (CONFIRM) {
      try {
        dispatch(deleteUserAccountStart());
        const data = await apiFetch(`/api/user/delete/${currentUser._id}`, {
          method: "DELETE",
        });
        if (data?.success === false) {
          dispatch(deleteUserAccountFailure(data?.message));
          alert("Something went wrong!");
          return;
        }
        dispatch(deleteUserAccountSuccess());
        alert(data?.message || "Account deleted");
        navigate("/signup");
      } catch (error) {
        dispatch(deleteUserAccountFailure(error.message));
      }
    }
  };

  // Helper to determine title/meta based on active route and panel
  const getPageMeta = () => {
    if (location.pathname.startsWith("/profile/admin/update-package")) {
      return {
        title: "Edit Travel Package",
        desc: "Update tour itinerary, accommodations, image gallery, and rates",
      };
    }

    switch (activePanelId) {
      case 0:
        return {
          title: "Dashboard Overview",
          desc: "Real-time travel operations, bookings, and financial analytics",
        };
      case 1:
        return {
          title: "Active Reservations",
          desc: "Live package bookings and passenger manifests",
        };
      case 2:
        return {
          title: "Create Travel Package",
          desc: "Publish a new curated expedition itinerary",
        };
      case 3:
        return {
          title: "Package Management",
          desc: "Inventory catalog, pricing, and promotional offers",
        };
      case 4:
        return {
          title: "User Accounts",
          desc: "Registered traveler accounts and administrative permissions",
        };
      case 5:
        return {
          title: "Payments & Refunds",
          desc: "Razorpay financial ledger and atomic refund transactions",
        };
      case 6:
        return {
          title: "Ratings & Reviews",
          desc: "Customer review moderation and feedback analytics",
        };
      case 7:
        return {
          title: "Historical Log",
          desc: "Archive of past reservations and cancelled records",
        };
      case 8:
        return {
          title: "Admin Profile",
          desc: "Administrator account details and security password",
        };
      case 9:
        return {
          title: "Hotel Stays",
          desc: "Accommodation inventory and package stay assignments",
        };
      default:
        return {
          title: "Command Portal",
          desc: "Wadi Al Zaitoon Management System",
        };
    }
  };

  // Sidebar active item ID: highlight Packages (id: 3) for update-package route
  const effectiveSidebarPanelId = location.pathname.startsWith(
    "/profile/admin/update-package"
  )
    ? 3
    : activePanelId;

  // Navigation click handler
  const handlePanelChange = (panelId) => {
    setActivePanelId(panelId);
    if (location.pathname !== "/profile/admin") {
      navigate("/profile/admin", { state: { activePanelId: panelId } });
    }
  };

  const currentMeta = getPageMeta();

  return (
    <PageTransition>
      <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
        {/* TOP HEADER BAR */}
        <AdminHeader
          currentMeta={currentMeta}
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          setActivePanelId={handlePanelChange}
          currentUser={currentUser}
          profilePhoto={profilePhoto}
          avatarUrl={formData.avatar}
          onLogout={handleLogout}
        />

        {/* MAIN APPLICATION SHELL */}
        <div className="flex-1 flex overflow-hidden">
          {/* REUSABLE SIDEBAR & MOBILE DRAWER */}
          <AdminSidebar
            activePanelId={effectiveSidebarPanelId}
            setActivePanelId={handlePanelChange}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
            currentUser={currentUser}
            profilePhoto={profilePhoto}
            avatarUrl={formData.avatar}
            fileRef={fileRef}
            onProfilePhotoChange={handleProfilePhoto}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 max-w-7xl mx-auto w-full">
            <Outlet
              context={{
                activePanelId,
                setActivePanelId: handlePanelChange,
              }}
            />
          </main>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminLayout;
