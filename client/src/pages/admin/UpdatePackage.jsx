import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../../services/api";
import { fetchHotels } from "../../services/hotelService";
import CloudinaryImageGallery from "../../components/admin/common/CloudinaryImageGallery";

const UpdatePackage = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    packageName: "",
    packageDescription: "",
    packageDestination: "",
    packageDays: 1,
    packageNights: 1,
    packageAccommodation: "",
    packageTransportation: "",
    packageMeals: "",
    packageActivities: "",
    packagePrice: 500,
    packageDiscountPrice: 0,
    packageOffer: false,
    packageRating: 0,
    packageTotalRatings: 0,
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

  const getPackageData = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/package/get-package-data/${params?.id}`);
      if (data?.success) {
        const pkg = data.packageData;
        const hotelId = pkg?.hotel?._id || pkg?.hotel || "";
        setFormData({
          packageName: pkg?.packageName || "",
          packageDescription: pkg?.packageDescription || "",
          packageDestination: pkg?.packageDestination || "",
          packageDays: pkg?.packageDays || 1,
          packageNights: pkg?.packageNights || 1,
          packageAccommodation: pkg?.packageAccommodation || "",
          packageTransportation: pkg?.packageTransportation || "",
          packageMeals: pkg?.packageMeals || "",
          packageActivities: pkg?.packageActivities || "",
          packagePrice: pkg?.packagePrice || 0,
          packageDiscountPrice: pkg?.packageDiscountPrice || 0,
          packageOffer: pkg?.packageOffer || false,
          packageRating: pkg?.packageRating || 0,
          packageImages: pkg?.packageImages || [],
          hotel: hotelId,
        });
      } else {
        setError(data?.message || "Failed to fetch package data");
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) getPackageData();
  }, [params.id]);

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

      const data = await apiFetch(`/api/package/update-package/${params?.id}`, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data?.success) {
        setLoading(false);
        setError(false);
        alert(data?.message || "Package updated successfully!");
        navigate(`/package/${params?.id}`);
      } else {
        setError(data?.message || "Failed to update package");
        setLoading(false);
        alert(data?.message || "Failed to update package");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      alert(err.message);
    }
  };

  return (
    <div className="w-full space-y-6">
        
        {/* Top Header & Breadcrumb */}
        <div className="max-w-4xl mx-auto space-y-4 mb-8">
          <Link
            to="/profile/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="border-b border-slate-200 pb-4">
            <h1 className="font-bold text-2xl text-slate-900 tracking-tight">
              Edit Package: {formData.packageName || "Loading..."}
            </h1>
            <p className="text-xs text-slate-500">Update details, itinerary inclusions, rates, and imagery gallery.</p>
          </div>
        </div>

        {/* Edit Form Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: ESSENTIALS */}
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                1. Basic Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="packageName" className="text-xs font-semibold text-slate-700">
                    Package Name
                  </label>
                  <input
                    type="text"
                    id="packageName"
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
                  rows={4}
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

            {/* SECTION 2: LOGISTICS & HOTEL REFERENCE */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                2. Accommodation & Logistics
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Hotel Selector */}
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="hotel" className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Linked Hotel Stay (Database Reference)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
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
                    value={formData.packageActivities}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium resize-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: DESCRIPTION & ITINERARY */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                2. Overview & Custom Inclusions
              </h4>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="packageDescription" className="text-xs font-semibold text-slate-700">
                    Tour Package Description *
                  </label>
                  <textarea
                    id="packageDescription"
                    rows={4}
                    value={formData.packageDescription}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: PRICING & LOGISTICS */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                3. Rates & Duration
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="packagePrice" className="text-xs font-semibold text-slate-700">
                    Regular Price (₹ INR) *
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

                <div className="space-y-1">
                  <label htmlFor="packageDays" className="text-xs font-semibold text-slate-700">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    id="packageDays"
                    value={formData.packageDays}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="packageNights" className="text-xs font-semibold text-slate-700">
                    Duration (Nights) *
                  </label>
                  <input
                    type="number"
                    id="packageNights"
                    value={formData.packageNights}
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
              </div>
            </div>

            {/* SECTION 4: GALLERY */}
            <div className="pt-4 border-t border-slate-200">
              <CloudinaryImageGallery
                packageImages={formData.packageImages}
                onChange={(newImages) => setFormData({ ...formData, packageImages: newImages })}
              />
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-50"
              >
                {loading ? "Updating Package..." : "Save Package Changes"}
              </button>
            </div>

          </form>
        </div>

      </div>
  );
};

export default UpdatePackage;
