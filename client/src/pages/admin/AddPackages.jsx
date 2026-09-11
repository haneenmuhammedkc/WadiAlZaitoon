import React, { useState, useEffect } from "react";
import { Plus, DollarSign, Tag, Image as ImageIcon, CheckCircle, AlertCircle } from "lucide-react";
import { createPackage } from "../../services/packageService";
import { fetchHotels } from "../../services/hotelService";
import CloudinaryImageGallery from "../../components/admin/common/CloudinaryImageGallery";

const AddPackages = () => {
  const [formData, setFormData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "Bus",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageImages: [],
    hotel: "",
  });
  const [hotelsList, setHotelsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const res = await fetchHotels({ adminView: true });
        if (res?.success) {
          setHotelsList(res.hotels || []);
        }
      } catch (err) {
        console.error("Failed to load hotels:", err);
      }
    };
    loadHotels();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (e.target.type === "checkbox") {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.packageImages.length === 0) {
      alert("You must upload at least 1 image");
      return;
    }
    if (
      !formData.packageName ||
      !formData.packageDescription ||
      !formData.packageDestination ||
      !formData.packageAccommodation ||
      !formData.packageTransportation ||
      !formData.packageMeals ||
      !formData.packageActivities
    ) {
      alert("All fields are required!");
      return;
    }
    if (formData.packageOffer && Number(formData.packageDiscountPrice) >= Number(formData.packagePrice)) {
      alert("Regular Price must be greater than Discount Price!");
      return;
    }
    try {
      setLoading(true);
      setError(false);

      const data = await createPackage(formData);

      if (data?.success) {
        setLoading(false);
        setError(false);
        alert(data?.message || "Package Created Successfully!");
        setFormData({
          packageName: "",
          packageDescription: "",
          packageDestination: "",
          packageDays: 1,
          packageNights: 1,
          packageAccommodation: "",
          packageTransportation: "Bus",
          packageMeals: "",
          packageActivities: "",
          packagePrice: 500,
          packageDiscountPrice: 0,
          packageOffer: false,
          packageRating: 0,
          packageTotalRatings: 0,
          packageImages: [],
        });
        setImages([]);
      } else {
        setError(data?.message || "Package creation failed!");
        setLoading(false);
        alert(data?.message || "Package creation failed!");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      alert(err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans">
      
      <div className="border-b border-slate-200 pb-4">
        <h3 className="font-bold text-lg text-slate-900 tracking-tight">Create Travel Package</h3>
        <p className="text-xs text-slate-500">Publish a new curated expedition itinerary for travelers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: BASIC PACKAGE INFO */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            1. Package Essentials
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label htmlFor="packageName" className="text-xs font-semibold text-slate-700">
                Package Name
              </label>
              <input
                type="text"
                id="packageName"
                placeholder="e.g. Historic Jerusalem & Bethlehem Tour"
                value={formData.packageName}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="packageDestination" className="text-xs font-semibold text-slate-700">
                Destination / Region
              </label>
              <input
                type="text"
                id="packageDestination"
                placeholder="e.g. Jerusalem & West Bank"
                value={formData.packageDestination}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                required
              />
            </div>

          </div>

          <div className="space-y-1">
            <label htmlFor="packageDescription" className="text-xs font-semibold text-slate-700">
              Full Journey Description
            </label>
            <textarea
              id="packageDescription"
              rows={3}
              placeholder="Describe the highlight destinations, itinerary summary, and unique experience..."
              value={formData.packageDescription}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="packageDays" className="text-xs font-semibold text-slate-700">
                Duration (Days)
              </label>
              <input
                type="number"
                id="packageDays"
                min={1}
                value={formData.packageDays}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="packageNights" className="text-xs font-semibold text-slate-700">
                Duration (Nights)
              </label>
              <input
                type="number"
                id="packageNights"
                min={0}
                value={formData.packageNights}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
              />
            </div>
          </div>

        </div>

        {/* SECTION 2: INCLUSIONS & LOGISTICS */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            2. Logistics & Inclusions
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Hotel Reference Selector */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="hotel" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Linked Hotel Stay (Database Reference)</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional — Links package to hotel roster</span>
              </label>
              <select
                id="hotel"
                value={formData.hotel}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedObj = hotelsList.find((h) => String(h._id) === String(selectedId));
                  setFormData((prev) => ({
                    ...prev,
                    hotel: selectedId,
                    packageAccommodation: prev.packageAccommodation || (selectedObj ? selectedObj.hotelName : prev.packageAccommodation),
                  }));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
              >
                <option value="">-- No Hotel Reference (Use Text Fallback Only) --</option>
                {hotelsList.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.hotelName} ({h.location}) {!h.isActive ? "[INACTIVE]" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="packageAccommodation" className="text-xs font-semibold text-slate-700">
                Accommodation Details (Display Text)
              </label>
              <textarea
                id="packageAccommodation"
                rows={2}
                placeholder="e.g. 4-Star Boutique Hotel in Old City"
                value={formData.packageAccommodation}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium resize-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="packageTransportation" className="text-xs font-semibold text-slate-700">
                Transportation Type
              </label>
              <select
                id="packageTransportation"
                value={formData.packageTransportation}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
              >
                <option value="Bus">Luxury Coach / Bus</option>
                <option value="Flight">Flight + Coach</option>
                <option value="Train">Railway / Express Train</option>
                <option value="Boat">Private Boat / Cruise</option>
                <option value="Other">Private Luxury Chauffeur</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="packageMeals" className="text-xs font-semibold text-slate-700">
                Meals Included
              </label>
              <textarea
                id="packageMeals"
                rows={2}
                placeholder="e.g. Daily Breakfast & Traditional Palestinian Dinner"
                value={formData.packageMeals}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium resize-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="packageActivities" className="text-xs font-semibold text-slate-700">
                Activities & Excursions
              </label>
              <textarea
                id="packageActivities"
                rows={2}
                placeholder="e.g. Guided tour of Church of Nativity, Al-Aqsa Mosque..."
                value={formData.packageActivities}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium resize-none"
                required
              />
            </div>

          </div>
        </div>

        {/* SECTION 3: PRICING & OFFERS */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
            3. Pricing & Discounts
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            
            <div className="space-y-1">
              <label htmlFor="packagePrice" className="text-xs font-semibold text-slate-700">
                Regular Price (₹ INR)
              </label>
              <input
                type="number"
                id="packagePrice"
                value={formData.packagePrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                required
              />
            </div>

            <div className="pt-5">
              <label htmlFor="packageOffer" className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  id="packageOffer"
                  checked={formData.packageOffer}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-800">Enable Promotional Offer</span>
              </label>
            </div>

            {formData.packageOffer && (
              <div className="space-y-1">
                <label htmlFor="packageDiscountPrice" className="text-xs font-semibold text-slate-700">
                  Discounted Price (₹ INR)
                </label>
                <input
                  type="number"
                  id="packageDiscountPrice"
                  value={formData.packageDiscountPrice}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                />
              </div>
            )}

          </div>
        </div>

        {/* SECTION 4: CLOUDINARY IMAGE GALLERY */}
        <div className="pt-4 border-t border-slate-200">
          <CloudinaryImageGallery
            packageImages={formData.packageImages}
            onChange={(newImages) => setFormData({ ...formData, packageImages: newImages })}
          />
        </div>

        {/* Submit Form CTA */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Publishing Package..." : "Publish Travel Package"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPackages;
