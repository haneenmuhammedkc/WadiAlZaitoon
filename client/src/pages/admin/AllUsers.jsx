import React, { useEffect, useState } from "react";
import { Search, Trash2, Shield, User as UserIcon, Mail, Phone, MapPin } from "lucide-react";
import { apiFetch } from "../../services/api";
import { StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const AllUsers = () => {
  const [allUser, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/user/getAllUsers?searchTerm=${encodeURIComponent(search)}`);
      if (Array.isArray(data)) {
        setAllUsers(data);
        setError(false);
      } else if (data && data?.success === false) {
        setAllUsers([]);
        setError(false); // Graceful empty handling for search/filter
      } else {
        setAllUsers([]);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  useEffect(() => {
    getUsers();
  }, [search]);

  const handleUserDelete = async (userId) => {
    const CONFIRM = window.confirm("Are you sure? This user account will be permanently deleted!");
    if (CONFIRM) {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/user/delete-user/${userId}`, {
          method: "DELETE",
        });
        if (data?.success) {
          alert(data?.message || "User account deleted successfully!");
          getUsers();
        } else {
          alert(data?.message || "Something went wrong!");
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        alert(err.message);
      }
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Table Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 tracking-tight">User Account Directory</h3>
          <p className="text-xs text-slate-500">Registered platform traveler accounts ({allUser.length})</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 text-red-700 text-xs text-center rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && allUser.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-400 font-medium">
          No registered user accounts match your search query.
        </div>
      )}

      {/* Users Data Table */}
      {!loading && !error && allUser.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-200 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact Email</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUser.map((user) => {
                const isAdmin = user.user_role === 1;

                return (
                  <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {user.username?.[0] || "U"}
                      </div>
                      <span>{user.username}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{user.email}</td>
                    <td className="py-3.5 px-4 text-slate-600">{user.phone || "—"}</td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">{user.address || "—"}</td>
                    <td className="py-3.5 px-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                          <Shield className="w-3 h-3 text-amber-600" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          Traveler
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleUserDelete(user._id)}
                        disabled={loading}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AllUsers;
