import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../components/admin/common/AdminHeader";
import AdminSidebar from "../components/admin/common/AdminSidebar";
import { PageTransition } from "../components/animations/Motion";
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

  const isSubPage = location.pathname !== "/profile/admin";
  const effectiveSidebarPanelId = location.pathname === "/profile/admin/profile" ? 8 : (isSubPage ? -1 : activePanelId);

  const handlePanelChange = (id) => {
    if (id === 8) {
      navigate("/profile/admin/profile");
      return;
    }
    setActivePanelId(id);
    if (isSubPage) {
      navigate("/profile/admin", { state: { activePanelId: id } });
    }
  };

  return (
    <PageTransition className="h-screen overflow-hidden">
      <div className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
        {/* TOP HEADER BAR */}
        <AdminHeader
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          setActivePanelId={handlePanelChange}
        />

        {/* MAIN APPLICATION SHELL */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* REUSABLE SIDEBAR & MOBILE DRAWER */}
          <AdminSidebar
            activePanelId={effectiveSidebarPanelId}
            setActivePanelId={handlePanelChange}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
            currentUser={currentUser}
            onLogout={handleLogout}
          />

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 max-w-7xl mx-auto w-full min-h-0">
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
