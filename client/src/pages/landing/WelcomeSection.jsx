import React from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const WelcomeSection = ({ packageCount = "50+" }) => {
  return (
    <section className="min-h-[85vh] lg:min-h-[90vh] flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <FadeIn>
          <div className="space-y-5">
            <span className="text-xs uppercase tracking-widest text-emerald-800 font-extrabold px-3 py-1 bg-emerald-50 rounded-full inline-block">
              WELCOME TO WADI AL ZAITOON
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight uppercase leading-tight max-w-2xl mx-auto whitespace-pre-line">
              YOUR TRUSTED TRAVEL{"\n"}PARTNER FOR EVERY{"\n"}JOURNEY
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-normal leading-relaxed max-w-2xl mx-auto">
              Wadi Al Zaitoon Tourism brings together holiday packages, international destinations, comfortable stays, exciting experiences and seamless travel services — all in one place.
            </p>
          </div>
        </FadeIn>

        {/* Statistics: FOUR EQUAL CARDS */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
          <StaggerItem>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm transition-all space-y-1 text-center">
              <h4 className="font-extrabold text-2xl md:text-3xl text-slate-900">
                5,000+
              </h4>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Happy Travellers
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm transition-all space-y-1 text-center">
              <h4 className="font-extrabold text-2xl md:text-3xl text-slate-900">
                4.9 ★
              </h4>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Customer Rating
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm transition-all space-y-1 text-center">
              <h4 className="font-extrabold text-2xl md:text-3xl text-slate-900">
                {packageCount}
              </h4>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Tour Packages
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-sm transition-all space-y-1 text-center">
              <h4 className="font-extrabold text-2xl md:text-3xl text-slate-900">
                24/7
              </h4>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Travel Support
              </p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default WelcomeSection;
