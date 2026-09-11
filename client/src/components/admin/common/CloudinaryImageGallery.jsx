import React, { useState } from "react";
import { Plus, Trash2, Link as LinkIcon, ImageOff, CheckCircle2, AlertCircle } from "lucide-react";

const CloudinaryImageGallery = ({ packageImages = [], onChange, maxImages = 5 }) => {
  const [newUrl, setNewUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [failedImages, setFailedImages] = useState({});

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleAddUrl = (e) => {
    e?.preventDefault();
    setUrlError("");
    const trimmed = newUrl.trim();

    if (!trimmed) {
      setUrlError("Please enter an image URL");
      return;
    }

    if (!isValidUrl(trimmed)) {
      setUrlError("Invalid URL format. Must start with http:// or https://");
      return;
    }

    if (packageImages.includes(trimmed)) {
      setUrlError("This image URL has already been added");
      return;
    }

    if (packageImages.length >= maxImages) {
      setUrlError(`Maximum limit of ${maxImages} images reached`);
      return;
    }

    const updated = [...packageImages, trimmed];
    onChange(updated);
    setNewUrl("");
    setUrlError("");
  };

  const handleRemoveUrl = (index) => {
    const updated = packageImages.filter((_, i) => i !== index);
    onChange(updated);
    // Reset failed image tracking for deleted item
    setFailedImages((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleImageError = (index) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  const isMaxReached = packageImages.length >= maxImages;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <span>4. Image Gallery (Up to {maxImages} Images)</span>
          </h4>
          <p className="text-[11px] text-slate-500">
            Enter direct Cloudinary image URLs. Local file uploads are disabled.
          </p>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isMaxReached
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {packageImages.length} / {maxImages} Images
        </span>
      </div>

      {/* URL Input Form Box */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        {!isMaxReached ? (
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  if (urlError) setUrlError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                placeholder="https://res.cloudinary.com/your-cloud/image/upload/sample.jpg"
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Image URL
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Maximum capacity of 5 Cloudinary image URLs reached. Remove an image to add a new one.</span>
          </div>
        )}

        {urlError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold px-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{urlError}</span>
          </div>
        )}
      </div>

      {/* Gallery Cards Grid */}
      {packageImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {packageImages.map((imgUrl, i) => {
            const hasFailed = failedImages[i];

            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-2.5 relative group"
              >
                {/* Image Container */}
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
                  {!hasFailed ? (
                    <img
                      src={imgUrl}
                      alt={`Package Image ${i + 1}`}
                      onError={() => handleImageError(i)}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-1">
                      <ImageOff className="w-6 h-6 text-slate-300" />
                      <span className="text-[11px] font-semibold text-slate-500">Unable to load image</span>
                      <span className="text-[9px] text-slate-400">Check URL validity</span>
                    </div>
                  )}

                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-mono font-bold backdrop-blur-xs">
                    #{i + 1}
                  </span>
                </div>

                {/* URL String & Actions */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span
                    className="text-[10px] font-mono text-slate-500 truncate flex-1 block"
                    title={imgUrl}
                  >
                    {imgUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(i)}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1 shrink-0"
                    title="Remove Image URL"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2 bg-slate-50/50">
          <LinkIcon className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">No package images added yet</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Paste Cloudinary image links above to add photos to this travel itinerary.
          </p>
        </div>
      )}
    </div>
  );
};

export default CloudinaryImageGallery;
