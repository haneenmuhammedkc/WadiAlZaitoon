import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  ShieldCheck,
  Globe,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Headphones,
  CalendarCheck,
  Award,
  Layers,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "../components/animations/Motion";
import { getPackages } from "../services/packageService";
import PackageCard from "./package/PackageCard";

const About = () => {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    const fetchShowcasePackages = async () => {
      try {
        setLoadingPackages(true);
        const data = await getPackages("limit=4");
        if (data?.success) {
          setFeaturedPackages(data.packages || []);
        }
      } catch (err) {
        console.error("Error loading showcase packages:", err);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchShowcasePackages();
  }, []);

  const storySteps = [
    {
      step: "01",
      title: "DISCOVER",
      desc: "Planning journeys around inspiring destinations worth experiencing.",
    },
    {
      step: "02",
      title: "PLAN",
      desc: "Creating thoughtfully structured travel packages for every traveler.",
    },
    {
      step: "03",
      title: "EXPERIENCE",
      desc: "Helping travelers enjoy their journey with confidence and ease.",
    },
    {
      step: "04",
      title: "RETURN",
      desc: "Building memorable travel experiences travelers want to cherish.",
    },
  ];

  const whyChooseUs = [
    {
      number: "01",
      icon: Compass,
      title: "CURATED EXPERIENCES",
      desc: "Thoughtfully designed travel packages built around memorable experiences and iconic destinations.",
    },
    {
      number: "02",
      icon: ShieldCheck,
      title: "TRUSTED SERVICE",
      desc: "A travel experience designed to make planning simpler, comfortable, and stress-free.",
    },
    {
      number: "03",
      icon: Globe,
      title: "DESTINATION EXPERTISE",
      desc: "Explore carefully selected global destinations with structured, hassle-free itineraries.",
    },
    {
      number: "04",
      icon: Layers,
      title: "SEAMLESS PLANNING",
      desc: "From discovering a package to booking your trip, we keep every step of your journey simple.",
    },
  ];

  const promises = [
    {
      title: "PLAN WITH CONFIDENCE",
      desc: "Clear package information and straightforward, transparent planning from start to finish.",
    },
    {
      title: "TRAVEL WITH EASE",
      desc: "A smooth and reliable experience from discovering your trip to final reservation booking.",
    },
    {
      title: "CREATE MEMORIES",
      desc: "Journeys designed specifically around authentic experiences worth remembering for a lifetime.",
    },
  ];

  return (
    <PageTransition>
      <div className="bg-slate-50 min-h-screen text-slate-900 pt-24 sm:pt-28 pb-20 space-y-20 sm:space-y-28">
        
        {/* 1. HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 lg:p-16 shadow-sm relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                
                {/* Left Content Column */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-50 border border-coral-100 text-coral-600 text-xs font-extrabold tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-coral-600" />
                    <span>ABOUT WADI AL ZAITOON</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                    Travel Beyond the <span className="text-coral-600">Ordinary</span>
                  </h1>

                  <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
                    Creating memorable journeys with carefully crafted experiences, trusted service, and destinations worth discovering across the world.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link
                      to="/packages"
                      className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 transform active:scale-95"
                    >
                      <span>EXPLORE PACKAGES</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </Link>

                    <Link
                      to="/contact"
                      className="px-8 py-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm"
                    >
                      CONTACT US
                    </Link>
                  </div>
                </div>

                {/* Right Hero Image Card */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 h-[340px] sm:h-[400px]">
                    <img
                      src="/assets/images/dubai.png"
                      alt="Travel Beyond The Ordinary"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/images/dubai.png";
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>
          </FadeIn>
        </section>

        {/* 2. WHO WE ARE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Image Card */}
              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden shadow-md border border-slate-200 h-[380px] sm:h-[440px]">
                  <img
                    src="/assets/images/maldives.png"
                    alt="Who We Are"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/assets/images/maldives.png";
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-coral-600" />
                    <span className="text-xs font-extrabold text-slate-900 uppercase">Trusted Travel Partner</span>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-extrabold uppercase tracking-widest text-coral-600 block">
                  WHO WE ARE
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Your Journey Starts With Us
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Wadi Al Zaitoon Tourism is dedicated to helping travelers discover iconic destinations through thoughtfully planned travel packages, reliable local guidance, and seamless arrangements.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Whether you are planning a relaxing beach getaway, a cultural city exploration, or a luxury desert safari, our mission is to ensure every aspect of your trip is comfortable and inspiring.
                </p>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Curated Destinations</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Transparent Pricing</span>
                  </div>
                </div>
              </div>

            </div>
          </FadeIn>
        </section>

        {/* 3. OUR STORY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <FadeIn>
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-coral-600 block">
                OUR PROCESS
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Our Story & Journey
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                How we turn travel aspirations into structured, memorable holiday experiences.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {storySteps.map((item, idx) => (
              <StaggerItem key={idx}>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-coral-400 transition-all h-full flex flex-col justify-between relative group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-coral-50 border border-coral-100 text-coral-600 font-black text-sm flex items-center justify-center">
                      {item.step}
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-coral-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* 4. WHY CHOOSE WADI AL ZAITOON */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <FadeIn>
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-coral-600 block">
                EXCELLENCE & VALUE
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Why Travelers Choose Us
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <StaggerItem key={idx}>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-slate-400 transition-all h-full space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-300">
                          {card.number}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

        {/* 5. OUR TRAVEL PROMISE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                
                {/* Left Statement */}
                <div className="lg:col-span-6 space-y-5">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-coral-400 block">
                    OUR TRAVEL PROMISE
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                    "Your trip should feel exciting before it even begins."
                  </h2>
                  <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
                    We aim to make travel planning clear, convenient, and inspiring — so you can focus on the places, people, and experiences that matter most.
                  </p>
                </div>

                {/* Right 3 Principles */}
                <div className="lg:col-span-6 space-y-4">
                  {promises.map((p, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1 backdrop-blur-sm"
                    >
                      <h3 className="font-extrabold text-xs text-coral-400 uppercase tracking-wider">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-normal leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </FadeIn>
        </section>

        {/* 6. DESTINATIONS SHOWCASE (REUSING REAL MONGODB PACKAGES) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-coral-600 font-extrabold block mb-1">
                  POPULAR DESTINATIONS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                  EXPLORE FEATURED ESCAPES
                </h2>
              </div>
              <Link
                to="/packages"
                className="text-xs font-bold text-slate-900 hover:text-coral-600 flex items-center gap-1.5 uppercase tracking-wider transition-colors shrink-0"
              >
                VIEW ALL DESTINATIONS →
              </Link>
            </div>
          </FadeIn>

          {loadingPackages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 bg-slate-200/60 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : featuredPackages.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredPackages.map((pack, idx) => (
                <StaggerItem key={pack._id || idx}>
                  <PackageCard packageData={pack} variant="featured" />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : null}
        </section>

        {/* 7. CALL TO ACTION (CTA SECTION) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
              <div className="max-w-2xl mx-auto space-y-3">
                <span className="text-xs uppercase tracking-widest text-coral-600 font-extrabold block">
                  START YOUR ADVENTURE
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Ready to Plan Your Next Journey?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                  Explore our curated travel destinations and find the perfect experience tailored for you.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  to="/packages"
                  className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 transform active:scale-95"
                >
                  <span>EXPLORE PACKAGES</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/contact"
                  className="px-8 py-4 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-900 font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  CONTACT US
                </Link>
              </div>
            </div>
          </FadeIn>
        </section>

      </div>
    </PageTransition>
  );
};

export default About;
