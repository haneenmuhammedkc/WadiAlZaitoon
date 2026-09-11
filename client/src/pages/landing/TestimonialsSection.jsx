import React from "react";
import RatingCard from "../RatingCard";
import { FadeIn } from "../../components/animations/Motion";

const TestimonialsSection = ({ ratings }) => {
  if (!ratings || ratings.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <FadeIn>
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-coral-600 font-extrabold">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 uppercase">
            Traveler's Experiences
          </h2>
        </div>
      </FadeIn>

      <RatingCard ratingData={ratings} />
    </section>
  );
};

export default TestimonialsSection;
