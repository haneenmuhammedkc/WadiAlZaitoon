import { Rating } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, MessageSquare, ArrowRight, Package as PackageIcon } from "lucide-react";
import { getPackages as fetchPackagesApi } from "../../services/packageService";
import { StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const RatingsReviews = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showMoreBtn, setShowMoreBtn] = useState(false);

  const getPackages = async () => {
    setPackages([]);
    try {
      setLoading(true);
      const query = `searchTerm=${encodeURIComponent(search)}&sort=packageRating`;
      const data = await fetchPackagesApi(query);
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
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    getPackages();
  }, [filter, search]);

  const onShowMoreSClick = async () => {
    const numberOfPackages = packages.length;
    const startIndex = numberOfPackages;
    const query = `searchTerm=${encodeURIComponent(search)}&sort=packageRating&startIndex=${startIndex}`;
    const data = await fetchPackagesApi(query);
    if (!data?.packages || data?.packages?.length < 9) {
      setShowMoreBtn(false);
    }
    if (data?.packages) {
      setPackages([...packages, ...data.packages]);
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Ratings & Reviews Moderation
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Overview of customer feedback, package ratings, and guest review metrics
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search package by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && packages.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">No Rated Packages Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No packages match your search filter or have received ratings yet.
          </p>
        </div>
      )}

      {/* Ratings List */}
      {!loading && packages.length > 0 && (
        <StaggerContainer className="space-y-3">
          {packages.map((pack) => (
            <StaggerItem key={pack._id}>
              <div className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                  <Link to={`/package/ratings/${pack._id}`} className="shrink-0 group">
                    <img
                      src={pack?.packageImages[0] || "/assets/bg_jmg1.jpg"}
                      alt={pack?.packageName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <div className="space-y-1">
                    <Link
                      to={`/package/ratings/${pack._id}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition-colors line-clamp-1"
                    >
                      {pack?.packageName}
                    </Link>

                    <div className="flex items-center gap-2">
                      <Rating
                        value={Number(pack?.packageRating) || 0}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <span className="text-xs font-bold text-slate-900">
                        {Number(pack?.packageRating || 0).toFixed(1)}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {pack?.packageTotalRatings || 0} {pack?.packageTotalRatings === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end shrink-0">
                  <Link
                    to={`/package/ratings/${pack._id}`}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-700 text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
                  >
                    View All Reviews <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
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
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
          >
            Load More Ratings
          </button>
        </div>
      )}

    </div>
  );
};

export default RatingsReviews;
