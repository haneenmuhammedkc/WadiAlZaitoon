import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Layers, FileText } from "lucide-react";
import { getPackageById, updatePackage } from "../../services/packageService";
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
    itinerary: [],
    inclusionsStr: "",
    exclusionsStr: "",
    faqs: [],
  });
  const [hotelsList, setHotelsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Bulk Itinerary Paste State
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [bulkPasteError, setBulkPasteError] = useState("");
  const [bulkPasteSuccess, setBulkPasteSuccess] = useState("");

  // Bulk FAQ Paste State
  const [showBulkFaqPaste, setShowBulkFaqPaste] = useState(false);
  const [bulkFaqText, setBulkFaqText] = useState("");
  const [bulkFaqMode, setBulkFaqMode] = useState("append");
  const [bulkFaqError, setBulkFaqError] = useState("");
  const [bulkFaqSuccess, setBulkFaqSuccess] = useState("");

  const handleBulkItineraryImport = () => {
    setBulkPasteError("");
    setBulkPasteSuccess("");

    if (!bulkPasteText || !bulkPasteText.trim()) {
      setBulkPasteError("Please paste itinerary text before importing.");
      return;
    }

    const lines = bulkPasteText.split("\n");
    const parsedDays = [];
    const seenDays = new Set();

    let lineNumber = 0;
    for (const rawLine of lines) {
      lineNumber++;
      const line = rawLine.trim();
      if (!line) continue;

      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 3) {
        setBulkPasteError(
          `Line ${lineNumber}: Invalid format. Expected 'Day Number | Title | Description' (separated by '|' pipes), but found ${parts.length} section(s). Line content: "${line.substring(0, 40)}${line.length > 40 ? "..." : ""}"`
        );
        return;
      }

      const dayMatch = parts[0].match(/\d+/);
      if (!dayMatch) {
        setBulkPasteError(
          `Line ${lineNumber}: Could not extract a valid Day Number from '${parts[0]}'. Format must be 'Day 1' or '1'.`
        );
        return;
      }

      const dayNum = parseInt(dayMatch[0], 10);
      if (isNaN(dayNum) || dayNum <= 0) {
        setBulkPasteError(`Line ${lineNumber}: Invalid day number '${parts[0]}'.`);
        return;
      }

      if (seenDays.has(dayNum)) {
        setBulkPasteError(
          `Line ${lineNumber}: Duplicate Day Number ${dayNum} found. Each day number in bulk paste must be unique.`
        );
        return;
      }
      seenDays.add(dayNum);

      const title = parts[1];
      if (!title) {
        setBulkPasteError(`Line ${lineNumber}: Day Title cannot be empty.`);
        return;
      }

      const description = parts.slice(2).join("|").trim();
      if (!description) {
        setBulkPasteError(`Line ${lineNumber}: Day Description cannot be empty.`);
        return;
      }

      parsedDays.push({
        day: dayNum,
        title,
        description,
      });
    }

    if (parsedDays.length === 0) {
      setBulkPasteError("No valid itinerary days found in the pasted content.");
      return;
    }

    parsedDays.sort((a, b) => a.day - b.day);

    setFormData((prev) => ({
      ...prev,
      itinerary: parsedDays,
    }));

    setBulkPasteSuccess(`Successfully imported ${parsedDays.length} day(s) into the itinerary!`);
    setBulkPasteText("");
    setTimeout(() => {
      setShowBulkPaste(false);
      setBulkPasteSuccess("");
    }, 1200);
  };

  const handleBulkFaqImport = () => {
    setBulkFaqError("");
    setBulkFaqSuccess("");

    if (!bulkFaqText || !bulkFaqText.trim()) {
      setBulkFaqError("Please paste FAQ text before importing.");
      return;
    }

    const lines = bulkFaqText.split("\n");
    const parsedFaqs = [];
    let currentQuestion = null;
    let currentAnswerLines = [];

    const finalizeCurrentBlock = (lineNum) => {
      if (currentQuestion !== null) {
        const fullAnswer = currentAnswerLines.join("\n").trim();
        if (!fullAnswer) {
          return `Question "${currentQuestion}" is missing an answer starting with 'A:'.`;
        }
        parsedFaqs.push({
          question: currentQuestion,
          answer: fullAnswer,
        });
        currentQuestion = null;
        currentAnswerLines = [];
      }
      return null;
    };

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const rawLine = lines[i];
      const line = rawLine.trim();

      const qMatch = rawLine.match(/^[Qq]\s*:\s*(.*)/);
      if (qMatch) {
        if (currentQuestion !== null) {
          const err = finalizeCurrentBlock(lineNumber);
          if (err) {
            setBulkFaqError(`Line ${lineNumber}: ${err}`);
            return;
          }
        }
        const qText = qMatch[1].trim();
        if (!qText) {
          setBulkFaqError(`Line ${lineNumber}: Question text cannot be empty after 'Q:'.`);
          return;
        }
        currentQuestion = qText;
        currentAnswerLines = [];
        continue;
      }

      const aMatch = rawLine.match(/^[Aa]\s*:\s*(.*)/);
      if (aMatch) {
        if (!currentQuestion) {
          setBulkFaqError(`Line ${lineNumber}: Found answer prefix 'A:' before any question prefix 'Q:'.`);
          return;
        }
        const aText = aMatch[1].trim();
        currentAnswerLines.push(aText);
        continue;
      }

      if (!line) {
        if (currentQuestion !== null && currentAnswerLines.length > 0) {
          const err = finalizeCurrentBlock(lineNumber);
          if (err) {
            setBulkFaqError(`Line ${lineNumber}: ${err}`);
            return;
          }
        }
        continue;
      }

      if (currentQuestion !== null && currentAnswerLines.length > 0) {
        currentAnswerLines.push(line);
      } else if (currentQuestion !== null && currentAnswerLines.length === 0) {
        setBulkFaqError(
          `Line ${lineNumber}: Expected answer starting with 'A:' for question "${currentQuestion}". Line content: "${line}"`
        );
        return;
      } else {
        setBulkFaqError(
          `Line ${lineNumber}: Content outside Q&A block. Lines must start with 'Q:' or 'A:'. Line content: "${line}"`
        );
        return;
      }
    }

    if (currentQuestion !== null) {
      const err = finalizeCurrentBlock(lines.length);
      if (err) {
        setBulkFaqError(`Line ${lines.length}: ${err}`);
        return;
      }
    }

    if (parsedFaqs.length === 0) {
      setBulkFaqError("No valid Q&A pairs found in the pasted content.");
      return;
    }

    const seenPasted = new Set();
    for (let idx = 0; idx < parsedFaqs.length; idx++) {
      const normQ = parsedFaqs[idx].question.toLowerCase().trim();
      if (seenPasted.has(normQ)) {
        setBulkFaqError(
          `Duplicate question found in pasted content: "${parsedFaqs[idx].question}". Each question must be unique.`
        );
        return;
      }
      seenPasted.add(normQ);
    }

    const currentFaqs = Array.isArray(formData.faqs) ? formData.faqs : [];
    if (bulkFaqMode === "append") {
      const existingSet = new Set(currentFaqs.map((f) => (f.question || "").toLowerCase().trim()));
      for (const faq of parsedFaqs) {
        const normQ = faq.question.toLowerCase().trim();
        if (existingSet.has(normQ)) {
          setBulkFaqError(
            `Duplicate question already exists in package FAQs: "${faq.question}". Use 'Replace' mode if you want to overwrite existing FAQs.`
          );
          return;
        }
      }
    }

    setFormData((prev) => {
      const existing = Array.isArray(prev.faqs) ? prev.faqs : [];
      const updatedFaqs = bulkFaqMode === "append" ? [...existing, ...parsedFaqs] : parsedFaqs;
      return {
        ...prev,
        faqs: updatedFaqs,
      };
    });

    setBulkFaqSuccess(
      `Successfully ${bulkFaqMode === "append" ? "appended" : "imported"} ${parsedFaqs.length} FAQ pair(s)!`
    );
    setBulkFaqText("");
    setTimeout(() => {
      setShowBulkFaqPaste(false);
      setBulkFaqSuccess("");
    }, 1200);
  };

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
      const data = await getPackageById(params?.id);
      if (data?.success) {
        const pkg = data.packageData;
        const hotelId = pkg?.hotel?._id || pkg?.hotel || "";

        const rawItinerary = Array.isArray(pkg?.itinerary) ? pkg.itinerary : [];
        const normalizedItinerary = rawItinerary.map((item, idx) => ({
          day: typeof item?.day === "number" ? item.day : idx + 1,
          title: item?.title || "",
          description: item?.description || "",
        }));

        const rawFaqs = Array.isArray(pkg?.faqs) ? pkg.faqs : [];
        const normalizedFaqs = rawFaqs.map((faq) => ({
          question: faq?.question || faq?.q || "",
          answer: faq?.answer || faq?.a || "",
        }));

        const rawInclusions = Array.isArray(pkg?.inclusions) ? pkg.inclusions : [];
        const rawExclusions = Array.isArray(pkg?.exclusions) ? pkg.exclusions : [];

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
          packageTotalRatings: pkg?.packageTotalRatings || 0,
          packageImages: Array.isArray(pkg?.packageImages) ? pkg.packageImages : [],
          hotel: hotelId,
          itinerary: normalizedItinerary,
          inclusionsStr: rawInclusions.join("\n"),
          exclusionsStr: rawExclusions.join("\n"),
          faqs: normalizedFaqs,
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

      const payload = {
        ...formData,
        inclusions: formData.inclusionsStr
          ? formData.inclusionsStr.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        exclusions: formData.exclusionsStr
          ? formData.exclusionsStr.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
        itinerary: Array.isArray(formData.itinerary)
          ? formData.itinerary.map((item, idx) => ({
              day: typeof item?.day === "number" ? item.day : idx + 1,
              title: String(item?.title || "").trim(),
              description: String(item?.description || "").trim(),
            }))
          : [],
        faqs: Array.isArray(formData.faqs) ? formData.faqs : [],
      };

      const data = await updatePackage(params?.id, payload);

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
                3. Overview & Custom Inclusions
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
                4. Rates & Duration
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

            {/* SECTION 5: DETAILED CONTENT (INCLUSIONS, EXCLUSIONS, ITINERARY, FAQS) */}
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                5. Public Package Details Content
              </h4>

              {/* Inclusions & Exclusions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="inclusionsStr" className="text-xs font-semibold text-slate-700">
                    Package Inclusions (One per line)
                  </label>
                  <textarea
                    id="inclusionsStr"
                    rows={4}
                    placeholder="e.g. 5 Nights Accommodation&#10;Daily Breakfast&#10;Private Airport Transfer"
                    value={formData.inclusionsStr || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="exclusionsStr" className="text-xs font-semibold text-slate-700">
                    Package Exclusions (One per line)
                  </label>
                  <textarea
                    id="exclusionsStr"
                    rows={4}
                    placeholder="e.g. International Airfare&#10;Personal Expenses & Tips&#10;Travel Insurance"
                    value={formData.exclusionsStr || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
                  />
                </div>
              </div>

              {/* Day-by-Day Itinerary Builder */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Day-by-Day Itinerary ({(formData.itinerary || []).length} Days Configured)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBulkPaste((prev) => !prev);
                        setBulkPasteError("");
                        setBulkPasteSuccess("");
                      }}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      {showBulkPaste ? "Hide Bulk Paste" : "Paste Multiple Days"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          const currentItinerary = Array.isArray(prev.itinerary) ? prev.itinerary : [];
                          const nextDayNum = currentItinerary.length + 1;
                          return {
                            ...prev,
                            itinerary: [
                              ...currentItinerary,
                              { day: nextDayNum, title: `Day ${nextDayNum} Highlights`, description: "" },
                            ],
                          };
                        });
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      + Add Day
                    </button>
                  </div>
                </div>

                {/* Bulk Itinerary Paste Collapsible Panel */}
                {showBulkPaste && (
                  <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" /> Bulk Itinerary Paste & Import
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Paste your multi-day itinerary below. Each day must be on a new line separated by pipes (<code className="font-bold text-slate-700">|</code>).
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBulkPaste(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Required Format:</div>
                      <code className="block font-mono bg-white p-1.5 rounded border border-slate-200 text-[11px] text-blue-700">
                        Day Number | Day Title | Description
                      </code>
                      <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider pt-1">Example:</div>
                      <code className="block font-mono bg-white p-1.5 rounded border border-slate-200 text-[10.5px] text-slate-700 leading-relaxed">
                        Day 1 | Arrival in Zurich | Arrive at Zurich International Airport, transfer to the hotel, check-in and enjoy the evening at leisure.<br />
                        Day 2 | Zurich City Tour | Explore Zurich's historic city centre, Bahnhofstrasse, Old Town, Lake Zurich and Lindenhof viewpoint.<br />
                        Day 3 | Zurich to Lucerne | Take a scenic train journey to Lucerne and explore Lucerne Old Town.
                      </code>
                    </div>

                    {bulkPasteError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{bulkPasteError}</span>
                      </div>
                    )}

                    {bulkPasteSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                        <span>✓</span>
                        <span>{bulkPasteSuccess}</span>
                      </div>
                    )}

                    <textarea
                      rows={6}
                      placeholder="Paste your itinerary here..."
                      value={bulkPasteText}
                      onChange={(e) => {
                        setBulkPasteText(e.target.value);
                        if (bulkPasteError) setBulkPasteError("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono placeholder:font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-y"
                    />

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkPasteText("");
                          setBulkPasteError("");
                          setShowBulkPaste(false);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkItineraryImport}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Import & Generate Day Cards
                      </button>
                    </div>
                  </div>
                )}

                {!(formData.itinerary && formData.itinerary.length > 0) ? (
                  <p className="text-[11px] text-slate-500 italic py-2">
                    No custom day-by-day itinerary days configured yet. Click "+ Add Day" or "Paste Multiple Days" to create custom daily itineraries.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.itinerary.map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wide">
                            Day {item.day || idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                itinerary: (prev.itinerary || []).filter((_, i) => i !== idx),
                              }));
                            }}
                            className="text-[10px] text-red-500 font-semibold hover:underline"
                          >
                            Remove Day
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Day Title</label>
                          <input
                            type="text"
                            placeholder="Day Title (e.g. Arrival & Desert Safari)"
                            value={item.title || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setFormData((prev) => {
                                const updated = [...(prev.itinerary || [])];
                                updated[idx] = { ...updated[idx], title: newVal };
                                return { ...prev, itinerary: updated };
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-400"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-700">Description</label>
                          <textarea
                            rows={2}
                            placeholder="Day description and itinerary details..."
                            value={item.description || ""}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setFormData((prev) => {
                                const updated = [...(prev.itinerary || [])];
                                updated[idx] = { ...updated[idx], description: newVal };
                                return { ...prev, itinerary: updated };
                              });
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 resize-none focus:outline-none focus:border-slate-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FAQs Builder */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Package FAQs ({(formData.faqs || []).length} Q&As)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBulkFaqPaste((prev) => !prev);
                        setBulkFaqError("");
                        setBulkFaqSuccess("");
                      }}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      {showBulkFaqPaste ? "Hide Bulk Paste" : "Paste Multiple FAQs"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => {
                          const currentFaqs = Array.isArray(prev.faqs) ? prev.faqs : [];
                          return {
                            ...prev,
                            faqs: [...currentFaqs, { question: "", answer: "" }],
                          };
                        });
                      }}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                    >
                      + Add FAQ
                    </button>
                  </div>
                </div>

                {/* Bulk FAQ Paste Collapsible Panel */}
                {showBulkFaqPaste && (
                  <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" /> Bulk FAQ Paste & Import
                        </h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Paste your list of questions and answers below using the <code className="font-bold text-slate-700">Q:</code> and <code className="font-bold text-slate-700">A:</code> prefix format.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBulkFaqPaste(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                      <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Required Format:</div>
                      <code className="block font-mono bg-white p-1.5 rounded border border-slate-200 text-[11px] text-blue-700">
                        Q: [Question Text]<br />
                        A: [Answer Text]
                      </code>
                      <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wider pt-1">Example:</div>
                      <code className="block font-mono bg-white p-1.5 rounded border border-slate-200 text-[10.5px] text-slate-700 leading-relaxed">
                        Q: Is the international flight included in the package?<br />
                        A: No, international flights are not included. We can assist with flight bookings upon request.<br /><br />
                        Q: Are airport transfers provided?<br />
                        A: Yes, round-trip airport transfers in a private air-conditioned vehicle are included.
                      </code>
                    </div>

                    {/* Import Mode Radio Options */}
                    <div className="flex items-center gap-4 py-1 text-xs text-slate-700 font-semibold">
                      <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Import Mode:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="bulkFaqMode"
                          value="append"
                          checked={bulkFaqMode === "append"}
                          onChange={() => setBulkFaqMode("append")}
                          className="accent-blue-600 cursor-pointer"
                        />
                        Append to existing FAQs
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="bulkFaqMode"
                          value="replace"
                          checked={bulkFaqMode === "replace"}
                          onChange={() => setBulkFaqMode("replace")}
                          className="accent-blue-600 cursor-pointer"
                        />
                        Replace existing FAQs
                      </label>
                    </div>

                    {bulkFaqError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-start gap-2">
                        <span>⚠️</span>
                        <span>{bulkFaqError}</span>
                      </div>
                    )}

                    {bulkFaqSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                        <span>✓</span>
                        <span>{bulkFaqSuccess}</span>
                      </div>
                    )}

                    <textarea
                      rows={6}
                      placeholder="Q: What is the cancellation policy?&#10;A: Free cancellation up to 14 days before arrival."
                      value={bulkFaqText}
                      onChange={(e) => {
                        setBulkFaqText(e.target.value);
                        if (bulkFaqError) setBulkFaqError("");
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono placeholder:font-sans placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-y"
                    />

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkFaqText("");
                          setBulkFaqError("");
                          setShowBulkFaqPaste(false);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleBulkFaqImport}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Import FAQs
                      </button>
                    </div>
                  </div>
                )}

                {!(formData.faqs && formData.faqs.length > 0) ? (
                  <p className="text-[11px] text-slate-500 italic py-2">
                    No custom FAQs configured yet. Click "+ Add FAQ" or "Paste Multiple FAQs" to create custom package Q&A pairs.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {formData.faqs.map((faq, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">FAQ #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                faqs: (prev.faqs || []).filter((_, i) => i !== idx),
                              }));
                            }}
                            className="text-[10px] text-red-500 font-semibold hover:underline"
                          >
                            Remove FAQ
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Question (e.g. What is the dress code for safari?)"
                          value={faq.question || ""}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            setFormData((prev) => {
                              const updated = [...(prev.faqs || [])];
                              updated[idx] = { ...updated[idx], question: newVal };
                              return { ...prev, faqs: updated };
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                        />
                        <textarea
                          rows={2}
                          placeholder="Answer..."
                          value={faq.answer || ""}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            setFormData((prev) => {
                              const updated = [...(prev.faqs || [])];
                              updated[idx] = { ...updated[idx], answer: newVal };
                              return { ...prev, faqs: updated };
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 resize-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
