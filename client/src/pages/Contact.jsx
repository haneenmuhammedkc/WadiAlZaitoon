import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowRight } from "lucide-react";
import { PageTransition, FadeIn } from "../components/animations/Motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  return (
    <PageTransition>
      <div className="bg-white min-h-screen">
        
        {/* Dark Photographic Hero Banner */}
        <div className="relative bg-slate-900 text-white py-24 md:py-32 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{ backgroundImage: `url('/assets/bg_jmg1.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white uppercase">
              Contact us
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-medium max-w-lg mx-auto">
              Home <span className="text-coral-500 mx-2">/</span> Contact us
            </p>
          </div>

          {/* Organic / Paint-Brush Bottom Divider */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 80%)" }} />
        </div>

        {/* White Content Section */}
        <div className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Section Header */}
            <FadeIn>
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs uppercase tracking-widest text-coral-600 font-extrabold px-3 py-1 bg-coral-50 rounded-full inline-block">
                  GET IN TOUCH
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 uppercase tracking-tight">
                  CONTACT US TO GET MORE INFO
                </h2>
                <p className="text-slate-600 text-sm font-normal leading-relaxed">
                  Whether you have questions about our Middle Eastern tour packages, customized itineraries, or holiday bookings, our dedicated support team is here to assist you 24/7.
                </p>
              </div>
            </FadeIn>

            {/* Main Contact Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Contact Cards */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-8 rounded-3xl bg-slate-900 text-white space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                    <MessageSquare className="w-64 h-64 text-white" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-white border-b border-slate-800 pb-4">
                    Headquarters Info
                  </h3>
                  
                  <div className="space-y-6 text-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-coral-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-white text-base font-bold mb-1">Dubai Main Office</strong>
                        <p className="text-slate-300 text-xs leading-relaxed font-normal">
                          Al Fahidi Historical District, Bur Dubai, United Arab Emirates
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-coral-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-white text-base font-bold mb-1">Phone Number</strong>
                        <p className="text-slate-300 text-xs leading-relaxed font-normal">
                          +971 4 123 4567 / +971 50 987 6543
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-coral-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-white text-base font-bold mb-1">Email Address</strong>
                        <p className="text-slate-300 text-xs leading-relaxed font-normal">
                          info@wadialzaitoondxb.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-coral-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <strong className="block text-white text-base font-bold mb-1">Working Hours</strong>
                        <p className="text-slate-300 text-xs leading-relaxed font-normal">
                          Monday - Sunday: 8:00 AM - 10:00 PM GST
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Inquiry Form */}
              <div className="lg:col-span-7">
                <div className="p-8 md:p-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-2xl font-extrabold text-slate-900">Send Message</h3>

                  {submitted && (
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Thank you! Your message has been sent successfully. Our team will contact you shortly.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Your Full Name</label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-coral-500 shadow-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Address</label>
                        <input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-coral-500 shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Subject</label>
                      <input
                        type="text"
                        placeholder="Inquiry regarding Jerusalem package"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-coral-500 shadow-sm"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Message Details</label>
                      <textarea
                        rows={4}
                        placeholder="Provide details about your travel dates or group size..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-coral-500 resize-none shadow-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-95"
                    >
                      <Send className="w-4 h-4" /> SEND MESSAGE
                    </button>
                  </form>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Contact;
