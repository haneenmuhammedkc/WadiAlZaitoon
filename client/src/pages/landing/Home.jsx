import { useEffect, useState } from "react";
import { getPackages } from "../../services/packageService";
import { getPackageRatings } from "../../services/ratingService";
import { PageTransition } from "../../components/animations/Motion";
import Hero from "./Hero";
import WelcomeSection from "./WelcomeSection";
import FeaturedPackages from "./FeaturedPackages";
import Review from "./Review";
import TestimonialsSection from "./TestimonialsSection";
import HolidayOffer from "./HolidayOffer";

const Home = () => {
  const [offerPackages, setOfferPackages] = useState([]);
  const [latestPackages, setLatestPackages] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOfferPackages = async () => {
      try {
        const data = await getPackages("offer=true&limit=6");
        if (data?.success) {
          setOfferPackages(data.packages || []);
        }
      } catch (err) {
        console.error("Error fetching offer packages:", err);
      }
    };

    const fetchLatestPackages = async () => {
      try {
        setLoading(true);
        const data = await getPackages("limit=6");
        if (data?.success) {
          setLatestPackages(data.packages || []);
        } else {
          setError(data?.message || "Failed to load packages.");
        }
      } catch (err) {
        setError(err.message || "Network error loading packages.");
      } finally {
        setLoading(false);
      }
    };

    const fetchRatings = async () => {
      try {
        const data = await getPackageRatings("all", 6);
        if (Array.isArray(data)) {
          setRatings(data);
        } else if (data?.success) {
          setRatings(data.ratings || []);
        }
      } catch (err) {
        console.error("Error fetching ratings:", err);
      }
    };

    fetchOfferPackages();
    fetchLatestPackages();
    fetchRatings();
  }, []);

  const displayPackages = latestPackages.slice(0, 4);

  return (
    <PageTransition>
      <div className="bg-white min-h-screen space-y-16 md:space-y-24 pb-16 no-scrollbar">
        <Hero search={search} setSearch={setSearch} />
        <WelcomeSection />
        <FeaturedPackages displayPackages={displayPackages} loading={loading} error={error} />
        <Review />
        <TestimonialsSection ratings={ratings} />
        <HolidayOffer />
      </div>
    </PageTransition>
  );
};

export default Home;
