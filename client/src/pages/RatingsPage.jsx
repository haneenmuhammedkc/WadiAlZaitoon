import { Rating } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import RatingCard from "./RatingCard";
import { apiFetch } from "../services/api";
import { PageTransition, FadeIn } from "../components/animations/Motion";

const RatingsPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [packageRatings, setPackageRatings] = useState([]);
  const [showRatingStars, setShowRatingStars] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);

  const getRatings = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/rating/get-ratings/${params.id}/100`);
      const data2 = await apiFetch(`/api/rating/average-rating/${params.id}`);
      if (Array.isArray(data)) {
        setPackageRatings(data);
      } else {
        setPackageRatings([]);
      }
      if (data2) {
        setShowRatingStars(data2.rating || 0);
        setTotalRatings(data2.totalRatings || 0);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (params.id) getRatings();
  }, [params.id]);

  return (
    <PageTransition>
      <div className="w-full min-h-screen bg-ivory text-charcoal pb-20">
        
        {/* Header Banner */}
        <div className="bg-forest-900 text-ivory py-12 px-4 border-b border-forest-800">
          <div className="max-w-4xl mx-auto space-y-4">
            <button
              onClick={() => navigate(`/package/${params?.id}`)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-sage-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Package Details
            </button>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">All Traveler Reviews</h1>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 pt-10">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-charcoal/60">Loading traveler feedback...</p>
            </div>
          ) : (
            <FadeIn className="space-y-8">
              
              {/* Average Rating Score Card */}
              <div className="p-6 rounded-2xl bg-white border border-lightneutral shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-charcoal/60">Overall Rating Score</span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl font-bold text-forest-900">{showRatingStars.toFixed(1)}</span>
                    <Rating value={showRatingStars || 0} precision={0.1} readOnly size="medium" />
                    <span className="text-xs text-charcoal/60 font-light">({totalRatings} verified reviews)</span>
                  </div>
                </div>

                <Link
                  to={`/package/${params?.id}`}
                  className="px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-xs transition-all text-center"
                >
                  View Package
                </Link>
              </div>

              {/* Review Cards List */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-lightneutral shadow-sm space-y-6">
                <h3 className="font-serif font-bold text-lg text-forest-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sage-600" /> Traveler Feedback Log
                </h3>
                <RatingCard packageRatings={packageRatings} />
              </div>

            </FadeIn>
          )}
        </div>

      </div>
    </PageTransition>
  );
};

export default RatingsPage;
