import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getPackages } from "../../services/package.service";
import PackageCard from "./PackageCard";
import PackageCollection from "./PackageCollection";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const PackageCollectionPage = () => {
  const [previewPackages, setPreviewPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreviewPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPackages("limit=10");
        if (data?.success) {
          setPreviewPackages((data.packages || []).slice(0, 4));
        } else {
          setError(data?.message || "Failed to load packages.");
        }
      } catch (err) {
        setError(err.message || "Unable to connect to package service.");
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewPackages();
  }, []);

  return (
    <PageTransition>
      <div className="pt-24 sm:pt-28 pb-24 bg-slate-50 min-h-screen text-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* 1. PACKAGE COLLECTION (5 Wide Category Cards) */}
          <PackageCollection />

          {/* 2. LOWER PACKAGE PREVIEW SECTION (4 MongoDB Cards) */}
          <section className="space-y-8 pt-6 border-t border-slate-200">
            
            {/* Section Header (Clean & Simple) */}
            <FadeIn>
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#059669] font-extrabold block">
                  EXPLORE PACKAGES
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
                  Explore Our Packages
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Discover some of our popular journeys.
                </p>
              </div>
            </FadeIn>

            {/* 4 Preview Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-96 bg-slate-200/60 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center font-medium">
                {error}
              </div>
            ) : previewPackages.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm font-semibold">
                No packages available.
              </div>
            ) : (
              <div className="space-y-10">
                <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {previewPackages.map((pack, idx) => (
                    <StaggerItem key={pack._id || idx}>
                      <PackageCard packageData={pack} variant="featured" />
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                {/* VIEW ALL PACKAGES CTA */}
                <FadeIn>
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => navigate("/packages/all")}
                      className="px-8 py-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#059669] text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-lg transform active:scale-95 cursor-pointer"
                    >
                      <span>VIEW ALL PACKAGES</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </FadeIn>
              </div>
            )}

          </section>

        </div>
      </div>
    </PageTransition>
  );
};

export default PackageCollectionPage;
