import React from "react";
import { Menu, Bell } from "lucide-react";

const AdminHeader = ({
  mobileSidebarOpen = false,
  onToggleMobileSidebar,
  setActivePanelId,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-4 sm:px-8 justify-between shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Static Page Title & Subtitle */}
        <div className="min-w-0">
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2 truncate">
            <span>Wadi Al Zaitoon Admin</span>
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block truncate">
            Manage your travel platform from one place
          </p>
        </div>
      </div>

      {/* Right Top Header Actions */}
      <div className="flex items-center shrink-0">
        <button
          onClick={() => setActivePanelId && setActivePanelId(5)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          title="Financial Ledger Quick Access"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
