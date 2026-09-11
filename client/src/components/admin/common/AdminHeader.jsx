import React from "react";
import { Menu, Bell, LogOut } from "lucide-react";

const AdminHeader = ({
  currentMeta = { title: "Command Portal", desc: "Wadi Al Zaitoon Management System" },
  mobileSidebarOpen = false,
  onToggleMobileSidebar,
  setActivePanelId,
  currentUser,
  profilePhoto,
  avatarUrl,
  onLogout,
}) => {
  const displayAvatar =
    (profilePhoto && URL.createObjectURL(profilePhoto)) ||
    avatarUrl ||
    currentUser?.avatar ||
    "/assets/images/profile.png";

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-4 sm:px-8 justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{currentMeta.title}</span>
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {currentMeta.desc}
          </p>
        </div>
      </div>

      {/* Right Top Header Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setActivePanelId && setActivePanelId(5)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          title="Financial Ledger Quick Access"
        >
          <Bell className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Admin Profile Quick Badge */}
        <div
          onClick={() => setActivePanelId && setActivePanelId(8)}
          className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <img
            src={displayAvatar}
            alt={currentUser?.username || "Admin"}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div className="hidden sm:block text-left">
            <span className="font-bold text-xs text-slate-900 block leading-tight">
              {currentUser?.username}
            </span>
            <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider block">
              System Admin
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
