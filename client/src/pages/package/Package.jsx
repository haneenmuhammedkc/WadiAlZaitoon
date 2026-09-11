import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, ArrowLeft } from "lucide-react";
import { getPackages } from "../../services/packageService";
import PackageCard from "./PackageCard";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [offer, setOffer] = useState(false);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = `searchTerm=${encodeURIComponent(searchTerm)}&sort=${sort}&limit=50`;
      if (offer) query += `&offer=true`;
      const data = await getPackages(query);
      if (data?.success) {
        setPackages(data.packages || []);
      } else {
        setError(data?.message || "Failed to load tour packages.");
      }
    } catch (err) {
      setError(err.message || "Unable to connect to package service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [searchTerm, sort, offer]);

  return (
    <PageTransition>
      <div className="pt-24 sm:pt-28 pb-24 bg-slate-50 min-h-screen text-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header with Back Link */}
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block mb-1">
                  HOLIDAY EXPERIENCES
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] uppercase tracking-tight">
                  FEATURED TOUR PACKAGES
                </h1>
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Showing <span className="font-extrabold text-[#0F172A]">{packages.length}</span> Tour Packages
              </div>
            </div>
          </FadeIn>

          {/* Search & Filter Toolbar */}
          <FadeIn>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search packages by destination or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-xs text-[#0F172A] focus:outline-none focus:border-[#059669]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#0F172A] focus:outline-none focus:border-gray-400 cursor-pointer"
                >
                  <option value="createdAt">Latest Added</option>
                  <option value="packagePrice">Price: High to Low</option>
                  <option value="packageRating">Highest Rated</option>
                </select>
              </div>
            </div>
          </FadeIn>

          {/* Full Package Catalog Grid (All 10 Packages) */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-96 bg-slate-200/60 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center font-medium">
              {error}
            </div>
          ) : packages.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-sm font-semibold">
              No tour packages matched your criteria.
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pack, idx) => (
                <StaggerItem key={pack._id || idx}>
                  <PackageCard packageData={pack} variant="featured" />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

        </div>
      </div>
    </PageTransition>
  );
};

export default Package;
