import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Edit3, Trash2, Tag, Star, MapPin, Eye } from "lucide-react";
import { apiFetch } from "../../services/api";
import { StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const AllPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showMoreBtn, setShowMoreBtn] = useState(false);

  const getPackages = async () => {
    setPackages([]);
    try {
      setLoading(true);
      let url =
        filter === "offer"
          ? `/api/package/get-packages?searchTerm=${encodeURIComponent(search)}&offer=true`
          : filter === "latest"
          ? `/api/package/get-packages?searchTerm=${encodeURIComponent(search)}&sort=createdAt`
          : filter === "top"
          ? `/api/package/get-packages?searchTerm=${encodeURIComponent(search)}&sort=packageRating`
          : `/api/package/get-packages?searchTerm=${encodeURIComponent(search)}`;
      const data = await apiFetch(url);
      if (data?.success) {
        setPackages(data?.packages || []);
        setLoading(false);
      } else {
        setLoading(false);
        alert(data?.message || "Something went wrong!");
      }
      if (data?.packages?.length >= 9) {
        setShowMoreBtn(true);
      } else {
        setShowMoreBtn(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const onShowMoreSClick = async () => {
    const numberOfPackages = packages.length;
    const startIndex = numberOfPackages;
    let url =
      filter === "offer"
        ? `/api/package/get-packages?searchTerm=${encodeURIComponent(search)}&offer=true&startIndex=${startIndex}`
        : filter === "latest"
        ? `/api/package/get-packages?searchTerm=${encodeURIComponent(search)}&sort=createdAt&startIndex=${startIndex}`
        : filter === "top"
        ? `/api/package/get-packages?searchTerm=${encodeURIComponent(search)}&sort=packageRating&startIndex=${startIndex}`
        : `/api/package/get-packages?searchTerm=${encodeURIComponent(search)}&startIndex=${startIndex}`;
    const data = await apiFetch(url);
    if (!data?.packages || data?.packages?.length < 9) {
      setShowMoreBtn(false);
    }
    if (data?.packages) {
      setPackages([...packages, ...data.packages]);
    }
  };

  useEffect(() => {
    getPackages();
  }, [filter, search]);

  const handleDelete = async (packageId) => {
    const CONFIRM = window.confirm("Are you sure you want to delete this package?");
    if (!CONFIRM) return;
    try {
      setLoading(true);
      const data = await apiFetch(`/api/package/delete-package/${packageId}`, {
        method: "DELETE",
      });
      alert(data?.message || "Package Deleted!");
      getPackages();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(error.message);
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Top Filter & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 tracking-tight">Package Inventory</h3>
          <p className="text-xs text-slate-500">Active tour listings and package management</p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search packages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "all", label: "All Packages" },
          { id: "offer", label: "Special Offers" },
          { id: "latest", label: "Newly Added" },
          { id: "top", label: "Highest Rated" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
              filter === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && packages.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-400 font-medium">
          No travel packages found matching your criteria.
        </div>
      )}

      {/* Package List */}
      {!loading && packages.length > 0 && (
        <StaggerContainer className="space-y-3">
          {packages.map((pack) => (
            <StaggerItem key={pack._id}>
              <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  <Link to={`/package/${pack._id}`} className="shrink-0">
                    <img
                      src={pack?.packageImages[0] || "/assets/bg_jmg1.jpg"}
                      alt={pack?.packageName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                  </Link>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/package/${pack._id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                      >
                        {pack?.packageName}
                      </Link>
                      {pack.packageOffer && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          Offer
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <MapPin className="w-3 h-3 text-slate-400" /> {pack.packageDestination}
                      </span>
                      <span>&bull;</span>
                      <span className="font-bold text-slate-900">
                        ₹{pack.packageOffer ? pack.packageDiscountPrice : pack.packagePrice} / person
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link
                    to={`/package/${pack._id}`}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    title="View Package Page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/profile/admin/update-package/${pack._id}`}
                    className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Edit Package"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(pack._id)}
                    disabled={loading}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete Package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {showMoreBtn && (
        <div className="text-center pt-4">
          <button
            onClick={onShowMoreSClick}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            Load More Packages
          </button>
        </div>
      )}

    </div>
  );
};

export default AllPackages;
