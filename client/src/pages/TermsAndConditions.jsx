import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Info,
  Lock,
  ExternalLink,
} from "lucide-react";
import { PageTransition } from "../components/animations/Motion";
import {
  TERMS_LAST_UPDATED,
  COMPANY_INFO,
  CANCELLATION_SCHEDULE,
  TABLE_OF_CONTENTS,
} from "../data/termsAndConditions";

const TermsAndConditions = () => {
  const [activeSection, setActiveSection] = useState("about-services");

  useEffect(() => {
    document.title = "Terms & Conditions | WADI AL ZAITOON TOURISM LLC";
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // Header offset
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <PageTransition className="bg-slate-50 min-h-screen py-8 lg:py-26">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HERO / COMPACT LEGAL HEADER */}
        <header className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 mb-8 sm:mb-12 shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Legal Document</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Terms & Conditions
            </h1>

            <div className="text-emerald-400 font-bold text-sm tracking-wide uppercase">
              {COMPANY_INFO.legalName}
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              These Terms & Conditions govern your use of our website, booking platform and travel services.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Last Updated: <strong className="text-white">{TERMS_LAST_UPDATED}</strong></span>
            </div>
          </div>
        </header>

        {/* TWO COLUMN MAIN CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT: STICKY TABLE OF CONTENTS NAVIGATION (DESKTOP) */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> Contents
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  27 Sections
                </span>
              </div>

              <nav className="space-y-1 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
                {TABLE_OF_CONTENTS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate flex items-center gap-2">
                        <span className={`text-[10px] font-mono ${isActive ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                          {item.number}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? "text-emerald-600 translate-x-0.5" : "text-slate-300 opacity-0 group-hover:opacity-100"}`} />
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* RIGHT: POLICY CONTENT */}
          <main className="lg:col-span-3 space-y-10">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-10 text-slate-800 font-sans leading-relaxed text-xs sm:text-sm">
              
              {/* SECTION 1 */}
              <section id="about-services" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">01</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">About Our Services</h2>
                </div>
                <p>
                  <strong>{COMPANY_INFO.legalName}</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is a licensed tourism entity registered in {COMPANY_INFO.location}. We provide travel arrangement services including tour packages, hotel reservations, guided excursions, transfers, flight assistance, and travel-related services through our website and authorized booking channels.
                </p>
                <p>
                  By accessing, browsing, or making a reservation through our website, mobile application, or customer support channels, you acknowledge that you have read, understood, and agreed to be bound by these Terms & Conditions.
                </p>
              </section>

              {/* SECTION 2 */}
              <section id="booking-reservation" className="space-y-4 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">02</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Booking & Reservation</h2>
                </div>
                <p>
                  A booking request submitted through our website or customer support channels becomes confirmed only after all of the following requirements are met:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li>Required traveller information has been accurately submitted.</li>
                  <li>Applicable payment or required deposit has been successfully received and verified.</li>
                  <li>Availability has been confirmed by the relevant third-party suppliers (hotels, airlines, activity operators).</li>
                  <li>An official booking confirmation voucher or notification has been issued by {COMPANY_INFO.legalName}.</li>
                </ul>

                {/* Highlighted Warning Callout */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-amber-900">Important Booking Notice:</strong>
                    <span>A payment transaction alone does not necessarily guarantee supplier availability until the booking is confirmed and an official confirmation voucher is issued by {COMPANY_INFO.legalName}.</span>
                  </div>
                </div>
              </section>

              {/* SECTION 3 */}
              <section id="package-prices" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">03</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Package Prices</h2>
                </div>
                <p>
                  All package prices displayed on our platform are subject to real-time availability and dynamic pricing adjustments. Rates may vary based on several factors, including:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li>Travel dates and seasonality demand.</li>
                  <li>Hotel availability and selected room categories.</li>
                  <li>Total number of travellers (adults, children, infants).</li>
                  <li>Airline fares and flight class availability.</li>
                  <li>Foreign exchange rate fluctuations.</li>
                  <li>Applicable government taxes, municipal charges, or regulatory fees.</li>
                  <li>Direct price modifications imposed by third-party suppliers.</li>
                </ul>
                <p>
                  The exact inclusions and exclusions displayed on the specific package booking page or stated in your final quotation and booking confirmation apply exclusively to that reservation.
                </p>
              </section>

              {/* SECTION 4 */}
              <section id="traveller-info" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">04</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Traveller Information</h2>
                </div>
                <p>
                  It is the sole responsibility of the customer to ensure that all traveller details—including full legal names, passport numbers, dates of birth, genders, and nationalities—are entered accurately according to official government travel documents.
                </p>
                <p>
                  {COMPANY_INFO.legalName} shall not be held liable for any ticket re-issuance fees, hotel amendment penalties, or boarding rejections caused by inaccurate or incomplete traveller information submitted during booking.
                </p>
              </section>

              {/* SECTION 5 */}
              <section id="visa-travel-docs" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">05</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Passport, Visa & Entry Requirements</h2>
                </div>
                <p>
                  Travellers are individually responsible for obtaining and holding all valid travel documentation required by the destination country and any transit stops. Requirements include:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li>A valid passport and required entry permits for the destination.</li>
                  <li>Appropriate entry visas, transit visas, or electronic travel authorizations (eTA).</li>
                  <li>Required health documents, vaccination certificates, or destination entry forms.</li>
                </ul>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                  <strong className="text-slate-900 font-bold block">Visa Authority Disclaimer:</strong>
                  <span>Visa approvals, processing timelines, and entry permissions are determined solely by the relevant embassy, consulate, or government authority. Payment for travel packages or visa processing services does not guarantee visa approval.</span>
                </div>
              </section>

              {/* SECTION 6 */}
              <section id="flights" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">06</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Flights</h2>
                </div>
                <p>
                  Flight bookings included within package itineraries are operated by independent airlines and governed by the carrier&apos;s specific Conditions of Carriage.
                </p>
                <p>
                  Flight schedules, departure times, operating aircraft, seat assignments, baggage allowances, and routes are subject to change by the operating airline. {COMPANY_INFO.legalName} is not responsible for airline schedule changes, flight delays, cancellations, or missed connections caused by airline operations.
                </p>
              </section>

              {/* SECTION 7 */}
              <section id="hotels-accommodation" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">07</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Hotels & Accommodation</h2>
                </div>
                <p>
                  Hotel room bookings are subject to availability and the specific operational policies of the property. Standard check-in and check-out times apply as established by each hotel.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li><strong>Alternative Accommodation:</strong> In the event of unforeseen hotel unavailability or overbooking by the property, {COMPANY_INFO.legalName} reserves the right to substitute the hotel with a property of comparable standard and rating.</li>
                  <li><strong>Room Photographs:</strong> Images of hotels and rooms shown on our website are illustrative and represent general room categories; actual layout or decor may vary.</li>
                  <li><strong>Direct Hotel Charges:</strong> Early check-in, late check-out, room mini-bar usage, hotel security deposits, tourism dirham/city taxes, or incidentals are direct charges payable by the guest directly to the hotel property.</li>
                </ul>
              </section>

              {/* SECTION 8 */}
              <section id="activities-attractions" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">08</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Activities & Attractions</h2>
                </div>
                <p>
                  Guided tours, sightseeing excursions, transfers, and attraction admissions included in tour packages are subject to local weather conditions, operating hours, safety regulations, and third-party supplier availability.
                </p>
                <p>
                  Unused activities due to personal delays or weather cancellations will follow supplier refund policies.
                </p>
              </section>

              {/* SECTION 9 */}
              <section id="payment" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">09</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Payment</h2>
                </div>
                <p>
                  Payments may be processed through authorized payment service providers or payment gateways.
                </p>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 space-y-1 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Payment Security Commitment:</strong>
                    <span>{COMPANY_INFO.legalName} does not store complete credit/debit card numbers or CVV security codes on its own systems where payment is processed through an authorized payment gateway.</span>
                  </div>
                </div>
              </section>

              {/* SECTION 10 */}
              <section id="cancellation-refund" className="space-y-4 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">10</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Cancellation & Refund Policy</h2>
                </div>
                <p>
                  Cancellation requests must be submitted through official booking or support channels. The cancellation timing is calculated from the date official request is received by {COMPANY_INFO.legalName}.
                </p>
                <p>
                  Refund eligibility depends on several parameters, including:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li>Date and timing of cancellation notice relative to departure.</li>
                  <li>Package-specific cancellation terms.</li>
                  <li>Individual hotel property cancellation policies.</li>
                  <li>Airline fare rules and ticket refundability.</li>
                  <li>Attraction and event ticket conditions.</li>
                  <li>Supplier cancellation penalties and non-refundable deposit components.</li>
                  <li>Visa application fees and third-party administrative charges.</li>
                </ul>
                <p>
                  <strong>Priority Note:</strong> The cancellation terms displayed at the time of booking or explicitly stated on your official booking confirmation voucher will take priority for that specific reservation.
                </p>
              </section>

              {/* SECTION 11 */}
              <section id="cancellation-guideline" className="space-y-4 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">11</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Standard Cancellation Guideline</h2>
                </div>
                <p>
                  Where non-refundable supplier terms do not specify stricter conditions, the following standard cancellation charge schedule applies to package bookings:
                </p>

                {/* RESPONSIVE CANCELLATION TABLE */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs uppercase font-extrabold tracking-wider">
                        <th className="p-4 border-b border-slate-800">Cancellation Timing</th>
                        <th className="p-4 border-b border-slate-800 text-right">Standard Cancellation Charge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs font-medium text-slate-800">
                      {CANCELLATION_SCHEDULE.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="p-4 font-semibold text-slate-900">{item.timing}</td>
                          <td className="p-4 text-right font-bold text-emerald-700">{item.charge}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-800">Important Policy Note:</p>
                  <p>
                    These percentages are standard guidelines only. If the hotel, airline, visa provider, attraction or other supplier has stricter/non-refundable conditions, the supplier&apos;s actual cancellation penalty will apply.
                  </p>
                  <p>
                    The exact cancellation charge applicable to a booking will be communicated during booking or shown in the booking confirmation.
                  </p>
                </div>
              </section>

              {/* SECTION 12 */}
              <section id="non-refundable-services" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">12</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Non-Refundable Services</h2>
                </div>
                <p>
                  Certain components within a travel package are strictly non-refundable regardless of the cancellation date. These include, but are not limited to:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-slate-700">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Issued Airline Tickets (per fare rules)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Visa Fees & Application Charges</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Attraction & Event Entrance Tickets</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Non-Refundable Promotional Room Rates</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Confirmed Private Airport Transfers</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Specialized Tours & Seasonal Services</span>
                  </div>
                </div>
              </section>

              {/* SECTION 13 */}
              <section id="noshow-missed" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">13</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">No-Show & Missed Services</h2>
                </div>
                <p>
                  Failing to arrive for a scheduled flight, hotel check-in, airport transfer, tour departure, or activity without prior cancellation constitutes a &quot;No-Show&quot;.
                </p>
                <p>
                  No-shows are subject to a 100% cancellation charge as indicated in the standard cancellation guideline. {COMPANY_INFO.legalName} is not responsible for additional transportation or rebooking costs resulting from missed departures or late arrivals.
                </p>
              </section>

              {/* SECTION 14 */}
              <section id="supplier-changes" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">14</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Supplier Cancellation / Changes</h2>
                </div>
                <p>
                  If an airline, hotel operator, transport provider, or third-party supplier cancels or materially changes a service, {COMPANY_INFO.legalName} will reasonably assist the traveller in securing available alternative arrangements or facilitating applicable supplier refunds.
                </p>
                <p>
                  Refunds in such instances are strictly limited to the amounts actually recoverable and refundable by the relevant third-party supplier, subject to applicable UAE law.
                </p>
              </section>

              {/* SECTION 15 */}
              <section id="refund-processing" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">15</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Refund Processing</h2>
                </div>
                <p>
                  Approved refunds will be processed using the original method of payment utilized during the initial transaction.
                </p>
                <p>
                  Refund processing timelines depend on internal verification, third-party supplier processing, payment gateway settlement schedules, and individual financial institution processing times.
                </p>
              </section>

              {/* SECTION 16 */}
              <section id="partial-refunds" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">16</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Partial Refunds</h2>
                </div>
                <p>
                  Partial refunds will account for all applicable deductions, including supplier cancellation charges, non-refundable ticket components, credit card processing fees, and administrative handling charges permitted by law.
                </p>
              </section>

              {/* SECTION 17 */}
              <section id="visa-rejection" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">17</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Visa Rejection</h2>
                </div>
                <p>
                  Visa application fees, government submission charges, and processing fees are non-refundable once an application is submitted to government authorities, regardless of approval or rejection.
                </p>
                <p>
                  In the event of visa rejection, other travel components (hotels, tours, flights) will follow their respective supplier cancellation and refund policies.
                </p>
              </section>

              {/* SECTION 18 */}
              <section id="booking-amendments" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">18</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Booking Amendments</h2>
                </div>
                <p>
                  Requests to modify travel dates, change hotel properties, adjust room types, add or replace travellers, or alter itineraries must be submitted through official support channels. Amendments are subject to supplier availability, fare differences, rate adjustments, and applicable amendment fees.
                </p>
              </section>

              {/* SECTION 19 */}
              <section id="force-majeure" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">19</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Force Majeure</h2>
                </div>
                <p>
                  {COMPANY_INFO.legalName} shall not be held liable or deemed in breach of contract for failure or delay in performing travel obligations resulting from events beyond reasonable control (&quot;Force Majeure&quot;).
                </p>
                <p>
                  Force Majeure events include natural disasters, extreme weather, acts of God, war, civil unrest, government restrictions, border closures, epidemics, pandemics, strikes, airport closures, airspace restrictions, or immigration policy changes. In such cases, reasonable assistance with supplier credits or alternative dates will be offered where available.
                </p>
              </section>

              {/* SECTION 20 */}
              <section id="customer-responsibilities" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">20</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Customer Responsibilities</h2>
                </div>
                <p>Customers and travellers using our services agree to:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li>Provide accurate, truthful personal information during reservation.</li>
                  <li>Comply with airline, hotel, transport provider, and attraction safety policies.</li>
                  <li>Arrive at designated airport terminals and tour pick-up points on time.</li>
                  <li>Carry valid original passports, entry visas, and required travel permits.</li>
                  <li>Observe local laws, cultural norms, and regulations of the destination country.</li>
                  <li>Pay for personal expenses, room incidentals, and non-included meals directly.</li>
                  <li>Promptly inform {COMPANY_INFO.legalName} of any changes affecting their travel schedule.</li>
                </ul>
              </section>

              {/* SECTION 21 */}
              <section id="website-info" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">21</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Website Information</h2>
                </div>
                <p>
                  While we strive to ensure that all photographs, itinerary descriptions, pricing details, and hotel information are accurate, supplier updates and operational changes may occur. Website imagery is illustrative.
                </p>
              </section>

              {/* SECTION 22 */}
              <section id="third-party-suppliers" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">22</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Third-Party Suppliers</h2>
                </div>
                <p>
                  Travel services are provided by independent third parties including airlines, hotels, transport providers, tour operators, restaurants, and attractions. Their individual operating rules and terms apply.
                </p>
              </section>

              {/* SECTION 23 */}
              <section id="complaints-support" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">23</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Complaints & Support</h2>
                </div>
                <p>
                  If you encounter issues during your tour or stay, please report them immediately to our 24/7 customer support team so we may assist in resolving the matter promptly:
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1 text-xs">
                  <p><strong>Support Channel:</strong> {COMPANY_INFO.legalName} Customer Support</p>
                  <p><strong>Email:</strong> <a href={`mailto:${COMPANY_INFO.email}`} className="text-emerald-700 font-bold hover:underline">{COMPANY_INFO.email}</a></p>
                  <p><strong>Phone / WhatsApp:</strong> <a href={`tel:${COMPANY_INFO.phoneRaw}`} className="text-emerald-700 font-bold hover:underline">{COMPANY_INFO.phone}</a></p>
                </div>
              </section>

              {/* SECTION 24 */}
              <section id="privacy" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">24</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Privacy</h2>
                </div>
                <p>
                  Personal information is collected and processed in accordance with applicable privacy laws to process reservations, verify identity, and communicate booking updates.
                </p>
              </section>

              {/* SECTION 25 */}
              <section id="changes-to-terms" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">25</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Changes to These Terms</h2>
                </div>
                <p>
                  {COMPANY_INFO.legalName} reserves the right to modify these Terms & Conditions at any time. The terms published on our website at the time of your booking confirmation apply to that specific reservation.
                </p>
              </section>

              {/* SECTION 26 */}
              <section id="governing-law" className="space-y-3 scroll-mt-24 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">26</span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Governing Law</h2>
                </div>
                <p>
                  These Terms & Conditions shall be governed by and construed in accordance with the applicable laws and regulations of the <strong>United Arab Emirates</strong>. Any disputes shall be subject to the competent authorities and courts of the UAE.
                </p>
              </section>

              {/* SECTION 27: POLISHED CONTACT CARD */}
              <section id="contact-us" className="scroll-mt-24 pt-2">
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">27</span>
                    <span>Contact Us</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white">{COMPANY_INFO.legalName}</h3>
                  <p className="text-slate-400 text-xs">For legal inquiries or reservation support, please reach out directly:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <MapPin className="w-4 h-4" /> Location
                      </div>
                      <span className="text-slate-300 block">{COMPANY_INFO.location}</span>
                    </div>

                    <a
                      href={`mailto:${COMPANY_INFO.email}`}
                      className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all space-y-1 group"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 font-bold group-hover:text-emerald-300">
                        <Mail className="w-4 h-4" /> Email
                      </div>
                      <span className="text-slate-300 group-hover:underline block truncate">{COMPANY_INFO.email}</span>
                    </a>

                    <a
                      href={`tel:${COMPANY_INFO.phoneRaw}`}
                      className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-all space-y-1 group"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 font-bold group-hover:text-emerald-300">
                        <Phone className="w-4 h-4" /> Phone / WhatsApp
                      </div>
                      <span className="text-slate-300 group-hover:underline block">{COMPANY_INFO.phone}</span>
                    </a>
                  </div>
                </div>
              </section>

            </div>
          </main>

        </div>
      </div>
    </PageTransition>
  );
};

export default TermsAndConditions;
