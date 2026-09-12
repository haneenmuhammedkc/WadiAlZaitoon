import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Users,
  CreditCard,
  Star,
  Clock,
  Hotel as HotelIcon,
  LogOut,
  X,
  User,
} from "lucide-react";

const navGroups = [
  {
    group: "OVERVIEW",
    items: [
      { id: 0, label: "Command Overview", icon: LayoutDashboard },
      { id: 1, label: "Add Tour Package", icon: PlusCircle },
    ],
  },
  {
    group: "OPERATIONS",
    items: [
      { id: 2, label: "Package Inventory", icon: Package },
      { id: 3, label: "Hotel Directory", icon: HotelIcon },
      { id: 6, label: "Booking Ledger", icon: Clock },
    ],
  },
  {
    group: "COMMUNITY",
    items: [
      { id: 4, label: "User Accounts", icon: Users },
      { id: 7, label: "Reviews & Ratings", icon: Star },
    ],
  },
  {
    group: "FINANCIALS",
    items: [{ id: 5, label: "Revenue & Refunds", icon: CreditCard }],
  },
];

const AdminSidebar = ({
  activePanelId = 0,
  setActivePanelId,
  mobileSidebarOpen = false,
  setMobileSidebarOpen,
  currentUser,
  onLogout,
  onDeleteAccount,
}) => {
  const closeMobileSidebar = () => {
    if (setMobileSidebarOpen) setMobileSidebarOpen(false);
  };

  return (
    <>
      {/* DESKTOP SIDEBAR (FIXED 250px) */}
      <aside className="w-64 bg-slate-900 text-white shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-800">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                W
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wider text-white block uppercase">
                  WADI AL ZAITOON
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest block">
                  Admin Command Center
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 overflow-y-auto no-scrollbar">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 block mb-1">
                  {group.group}
                </span>
                {group.items.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activePanelId === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActivePanelId && setActivePanelId(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-md font-bold"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <IconComp className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block truncate max-w-[110px]">
                  {currentUser?.username}
                </span>
                <button
                  onClick={() => setActivePanelId && setActivePanelId(8)}
                  className="text-[10px] text-emerald-400 hover:underline font-medium block"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {onDeleteAccount && (
              <button
                onClick={onDeleteAccount}
                className="text-slate-500 hover:text-red-500 text-[10px] font-medium"
                title="Delete Admin Account"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 lg:hidden"
            >
              <div>
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center">
                      W
                    </div>
                    <span className="font-extrabold text-sm tracking-wider uppercase text-white">
                      Wadi Al Zaitoon
                    </span>
                  </div>
                  <button
                    onClick={closeMobileSidebar}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
                  {navGroups.map((group) => (
                    <div key={group.group} className="space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-3 block mb-1">
                        {group.group}
                      </span>
                      {group.items.map((item) => {
                        const IconComp = item.icon;
                        const isActive = activePanelId === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              if (setActivePanelId) setActivePanelId(item.id);
                              closeMobileSidebar();
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? "bg-emerald-600 text-white shadow-md font-bold"
                                : "text-slate-300 hover:bg-slate-800"
                            }`}
                          >
                            <IconComp className="w-4 h-4" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="p-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    closeMobileSidebar();
                    if (onLogout) onLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-white hover:bg-emerald-600 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
