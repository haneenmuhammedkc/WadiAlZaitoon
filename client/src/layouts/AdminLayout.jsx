import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/common/AdminHeader";
import AdminSidebar from "../components/admin/common/AdminSidebar";
import { PageTransition } from "../components/animations/Motion";
import { deleteUser } from "../services/userService";
import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser, logout, updateUser } = useAuth();

  const [activePanelId, setActivePanelId] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (currentUser !== null) {
      setFormData({
        username: currentUser.username,
        email: currentUser.email,
        address: currentUser.address,
        phone: currentUser.phone,
      });
    }
  }, [currentUser]);

  // Sync activePanelId from location state if returning to /profile/admin
  useEffect(() => {
    if (location.pathname === "/profile/admin" && location.state?.activePanelId !== undefined) {
      setActivePanelId(location.state.activePanelId);
    }
  }, [location.pathname, location.state]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      alert("Logged out successfully");
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
        const data = await deleteUser(currentUser._id);
        if (data?.success === false) {
          alert("Something went wrong!");
          return;
        }
        alert(data?.message || "Account deleted successfully");
        await logout();
        navigate("/login");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getPageMeta = (panelId) => {
    switch (panelId) {
      case 0:
        return { title: "Command Overview", desc: "System performance and operational summary" };
      case 1:
        return { title: "Add Tour Package", desc: "Create new itinerary for travelers" };
      case 2:
        return { title: "Package Inventory", desc: "Manage existing tour packages and listings" };
      case 3:
        return { title: "Hotel Directory", desc: "Manage partner hotel properties" };
      case 4:
        return { title: "User Accounts", desc: "Platform user directory and permission access" };
      case 5:
        return { title: "Revenue & Refunds", desc: "Financial ledger and traveler refund requests" };
      case 6:
        return { title: "Booking Ledger", desc: "Active traveler reservations and history" };
      case 7:
        return { title: "Reviews & Ratings", desc: "Traveler feedback and rating moderations" };
      case 8:
        return { title: "Admin Account Settings", desc: "Update profile and account security" };
      default:
        return { title: "Command Portal", desc: "Wadi Al Zaitoon Management System" };
    }
  };

  const isSubPage = location.pathname !== "/profile/admin";

  const getSubPageMeta = () => {
    if (location.pathname.includes("/update-package")) {
      return { title: "Update Tour Package", desc: "Modify package details and gallery" };
    }
    if (location.pathname.includes("/add-package")) {
      return { title: "Create Tour Package", desc: "Publish new travel itinerary" };
    }
    return { title: "Management Console", desc: "Wadi Al Zaitoon Admin Portal" };
  };

  const currentMeta = isSubPage ? getSubPageMeta() : getPageMeta(activePanelId);
  const effectiveSidebarPanelId = isSubPage ? -1 : activePanelId;

  const handlePanelChange = (id) => {
    setActivePanelId(id);
    if (isSubPage) {
      navigate("/profile/admin", { state: { activePanelId: id } });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        {/* TOP HEADER BAR */}
        <AdminHeader
          currentMeta={currentMeta}
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          setActivePanelId={handlePanelChange}
          currentUser={currentUser}
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
