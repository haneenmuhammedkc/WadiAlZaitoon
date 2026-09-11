import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Hotel,
  Search,
  Plus,
  Edit,
  Power,
  Star,
  MapPin,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import {
  fetchHotels,
  createHotelApi,
  updateHotelApi,
  deleteHotelApi,
} from "../../services/hotelService";
import { StaggerContainer, StaggerItem } from "../../components/animations/Motion";

const AllHotels = () => {
  const { user: currentUser } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    hotelName: "",
    location: "",
    destination: "",
    stay: "5 Nights",
    roomType: "Deluxe Room",
    mealPlan: "Breakfast Included",
    rating: 4.8,
    reviewsCount: 0,
    badge: "LUXURY STAY",
    description: "",
    amenitiesStr: "Free Wi-Fi, Swimming Pool, Restaurant, 24/7 Reception, Air Conditioning",
    roomFeaturesStr: "King/Twin Bed, Private Bathroom, TV, Mini Refrigerator",
    imagesStr: "",
    isActive: true,
  });

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchHotels({ adminView: true });
      if (data?.success) {
        setHotels(data.hotels || []);
      } else {
        setError(data?.message || "Failed to load hotels list.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingHotel(null);
    setFormData({
      hotelName: "",
      location: "",
      destination: "",
      stay: "5 Nights",
      roomType: "Deluxe Room",
      mealPlan: "Breakfast Included",
      rating: 4.8,
      reviewsCount: 0,
      badge: "LUXURY STAY",
      description: "",
      amenitiesStr: "Free Wi-Fi, Swimming Pool, Restaurant, 24/7 Reception, Air Conditioning",
      roomFeaturesStr: "King/Twin Bed, Private Bathroom, TV, Mini Refrigerator",
      imagesStr: "https://res.cloudinary.com/mjqklz7x/image/upload/v1788540802/ChatGPT_Image_Sep_4_2026_09_48_42_PM.png",
      isActive: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (hotel) => {
    setEditingHotel(hotel);
    const imgUrls = Array.isArray(hotel.images) ? hotel.images.map((i) => i.url || i.src).join("\n") : "";
    const amenStr = Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : "";
    const rfStr = Array.isArray(hotel.roomFeatures) ? hotel.roomFeatures.join(", ") : "";

    setFormData({
      hotelName: hotel.hotelName || "",
      location: hotel.location || "",
      destination: hotel.destination || "",
      stay: hotel.stay || "5 Nights",
      roomType: hotel.roomType || "Deluxe Room",
      mealPlan: hotel.mealPlan || "Breakfast Included",
      rating: hotel.rating !== undefined ? hotel.rating : 4.8,
      reviewsCount: hotel.reviewsCount || 0,
      badge: hotel.badge || "LUXURY STAY",
      description: hotel.description || "",
      amenitiesStr: amenStr,
      roomFeaturesStr: rfStr,
      imagesStr: imgUrls,
      isActive: hotel.isActive !== undefined ? hotel.isActive : true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleToggleActiveStatus = async (hotel) => {
    const actionName = hotel.isActive ? "deactivate" : "activate";
    const confirmToggle = window.confirm(`Are you sure you want to ${actionName} "${hotel.hotelName}"?`);
    if (!confirmToggle) return;

    try {
      setLoading(true);
      if (hotel.isActive) {
        await deleteHotelApi(hotel._id);
      } else {
        await updateHotelApi(hotel._id, { isActive: true });
      }
      await loadHotels();
    } catch (err) {
      alert("Failed to update status: " + err.message);
      setLoading(false);
    }
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.hotelName.trim() || !formData.location.trim() || !formData.destination.trim() || !formData.description.trim()) {
      setModalError("Hotel name, location, destination, and description are required.");
      return;
    }

    const imageLines = formData.imagesStr
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (imageLines.length === 0) {
      setModalError("Please provide at least one valid image URL (one per line).");
      return;
    }

    const payload = {
      hotelName: formData.hotelName.trim(),
      location: formData.location.trim(),
      destination: formData.destination.trim(),
      stay: formData.stay.trim(),
      roomType: formData.roomType.trim(),
      mealPlan: formData.mealPlan.trim(),
      rating: Number(formData.rating),
      reviewsCount: Number(formData.reviewsCount),
      badge: formData.badge.trim(),
      description: formData.description.trim(),
      amenities: formData.amenitiesStr.split(",").map((s) => s.trim()).filter(Boolean),
      roomFeatures: formData.roomFeaturesStr.split(",").map((s) => s.trim()).filter(Boolean),
      images: imageLines.map((url, idx) => ({
        url,
        label: `Hotel Photo #${idx + 1}`,
        alt: `${formData.hotelName} photo #${idx + 1}`,
      })),
      isActive: Boolean(formData.isActive),
    };

    try {
      setModalLoading(true);
      let res;
      if (editingHotel) {
        res = await updateHotelApi(editingHotel._id, payload);
      } else {
        res = await createHotelApi(payload);
      }

      if (res?.success) {
        setIsModalOpen(false);
        await loadHotels();
      } else {
        setModalError(res?.message || "Failed to save hotel.");
      }
    } catch (err) {
      setModalError(err.message || "An unexpected error occurred.");
    } finally {
      setModalLoading(false);
    }
  };

  const filteredHotels = hotels.filter((h) => {
    if (statusFilter === "active" && !h.isActive) return false;
    if (statusFilter === "inactive" && h.isActive) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchName = h.hotelName?.toLowerCase().includes(q);
      const matchLoc = h.location?.toLowerCase().includes(q);
      const matchDest = h.destination?.toLowerCase().includes(q);
      return matchName || matchLoc || matchDest;
    }
    return true;
  });

  return (
    <div className="w-full space-y-6 font-sans">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
            <Hotel className="w-5 h-5 text-blue-600" /> Accommodation Directory
          </h3>
          <p className="text-xs text-slate-500">Manage hotel stays and package accommodation assignments</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search hotel, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Hotel
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 text-red-700 text-xs text-center rounded-xl border border-red-200 font-medium">
          {error}
        </div>
      )}

      {!loading && !error && filteredHotels.length === 0 && (
        <div className="py-12 text-center text-xs text-slate-400 font-medium">
          No hotel accommodations match your criteria.
        </div>
      )}

      {/* Hotels List */}
      {!loading && !error && filteredHotels.length > 0 && (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHotels.map((hotel) => (
            <StaggerItem key={hotel._id}>
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{hotel.hotelName}</h4>
                      {hotel.isActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {hotel.location} &bull; {hotel.destination}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(hotel)}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit Hotel Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActiveStatus(hotel)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        hotel.isActive
                          ? "text-red-600 hover:bg-red-50"
                          : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={hotel.isActive ? "Deactivate Hotel" : "Activate Hotel"}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 line-clamp-2 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {hotel.description}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Room: <strong className="text-slate-800">{hotel.roomType}</strong></span>
                  <span>Stay: <strong className="text-slate-800">{hotel.stay}</strong></span>
                  <span>Rating: <strong className="text-slate-800">{hotel.rating} ★</strong></span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* CREATE / EDIT HOTEL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-bold text-base text-slate-900 tracking-tight">
                {editingHotel ? `Edit Hotel: ${editingHotel.hotelName}` : "Create New Hotel Accommodation"}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveHotel} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Hotel Name</label>
                  <input
                    type="text"
                    value={formData.hotelName}
                    onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50"
                    placeholder="e.g. Grand Al-Aqsa Stay"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Location / Address</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50"
                    placeholder="e.g. Old City, Jerusalem"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Destination</label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50"
                    placeholder="e.g. Jerusalem"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stay Duration</label>
                  <input
                    type="text"
                    value={formData.stay}
                    onChange={(e) => setFormData({ ...formData, stay: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50"
                    placeholder="e.g. 5 Nights"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Room Type</label>
                  <input
                    type="text"
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50"
                    placeholder="e.g. Deluxe Suite"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Meal Plan</label>
                  <input
                    type="text"
                    value={formData.mealPlan}
                    onChange={(e) => setFormData({ ...formData, mealPlan: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50"
                    placeholder="e.g. Breakfast Included"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50 resize-none"
                  placeholder="Describe hotel amenities and location features..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Image URLs (One per line)</label>
                <textarea
                  rows={3}
                  value={formData.imagesStr}
                  onChange={(e) => setFormData({ ...formData, imagesStr: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-slate-50 font-mono text-[11px] resize-none"
                  placeholder="https://res.cloudinary.com/..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
                >
                  {modalLoading ? "Saving..." : "Save Hotel Accommodation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AllHotels;
