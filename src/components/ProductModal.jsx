import React, { useState, useEffect } from "react";
import { X, ImageIcon } from "lucide-react";

export default function ProductModal({ isOpen, onClose, onAdd, editData, isEdit }) {
  const [formData, setFormData] = useState(
    editData || { name: "", category: [], price: "", taxIncluded: "yes", image: null }
  );

  useEffect(() => {
    if (editData) setFormData(editData);
  }, [editData]);

  if (!isOpen) return null;

  const handleCheckbox = (cat) => {
    setFormData((prev) => {
      const exists = prev.category.includes(cat);
      return {
        ...prev,
        category: exists
          ? prev.category.filter((c) => c !== cat)
          : [...prev.category, cat],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-[#FFE6E6] rounded-2xl shadow-lg w-[600px] p-8 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold mb-6">
          {isEdit ? "Edit Product" : "Upload Product Image"}
        </h2>

        {/* Upload Image */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          {formData.image ? (
            <div className="flex flex-col items-center">
              <img
                src={
                  typeof formData.image === "string"
                    ? formData.image
                    : URL.createObjectURL(formData.image)
                }
                alt="Preview"
                className="w-40 h-40 object-cover rounded-lg mb-4"
              />
              <label className="cursor-pointer text-sm px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                Replace
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files[0],
                    })
                  }
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
              <ImageIcon className="text-gray-400 w-10 h-10 mb-3" />
              <label className="cursor-pointer text-sm px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                Browse
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files[0],
                    })
                  }
                />
              </label>
            </div>
          )}
        </div>

        {/* Categories */}
        <h3 className="text-xl font-semibold mb-3">Categories</h3>
        <div className="mb-6">
          <div className="flex gap-6 text-gray-700">
            {["Cakes", "Drinks", "Food"].map((cat) => (
              <label key={cat} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.category.includes(cat)}
                  onChange={() => handleCheckbox(cat)}
                  className="accent-[#EF4543] w-4 h-4"
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        {/* Basic Details */}
        <h3 className="text-xl font-semibold mb-3">Basic Details</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            placeholder="Enter product name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
          />
        </div>

        {/* Pricing */}
        <h3 className="text-xl font-semibold mb-3">Pricing</h3>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Product Price per Unit
            </label>
            <input
              type="text"
              placeholder="20.000 đ"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Tax Included
            </label>
            <div className="flex gap-6 mt-2">
              {["yes", "no"].map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tax"
                    checked={formData.taxIncluded === opt}
                    onChange={() =>
                      setFormData({ ...formData, taxIncluded: opt })
                    }
                    className="accent-[#EF4543]"
                  />
                  {opt === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-2">
          {!isEdit && (
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="bg-[#EF4543] hover:bg-[#e03b39] text-white px-5 py-2 rounded-lg font-medium"
          >
            {isEdit ? "Save Changes" : "Publish Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
