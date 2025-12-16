import React, { useState, useEffect } from "react";
import { X, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";

const CATEGORY_MAP = {
  Cakes: "cake",
  Drinks: "drink",
  Foods: "launch",
};

export default function ProductModal({ isOpen, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState({
    name: "",
    category: [],
    price: "",
    description: "",
    backgroundHexacode: "#FFB6C1", // giữ để backend không lỗi
    image: null,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && isEdit) {
        const displayCategory =
          initialData.rawCategory === "launch"
            ? "Foods"
            : initialData.rawCategory === "cake"
            ? "Cakes"
            : initialData.rawCategory === "drink"
            ? "Drinks"
            : "Foods";

        setFormData({
          name: initialData.name || "",
          category: [displayCategory],
          price: initialData.price ? String(initialData.price).replace(/[^\d]/g, "") : "",
          description: initialData.description || "",
          backgroundHexacode: initialData.backgroundHexacode || "#FFB6C1",
          image: initialData.image || null,
        });
      } else {
        setFormData({
          name: "",
          category: [],
          price: "",
          description: "",
          backgroundHexacode: "#FFB6C1",
          image: null,
        });
      }
    }
  }, [isOpen, initialData, isEdit]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat) => {
    setFormData((prev) => ({
      ...prev,
      category: prev.category.includes(cat) ? prev.category.filter((c) => c !== cat) : [cat],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toast.error("Nhập tên sản phẩm nha");
    if (formData.category.length === 0) return toast.error("Chọn danh mục nha");
    if (!formData.price || Number(formData.price) <= 0) return toast.error("Giá phải lớn hơn 0 nha");

    const submitData = {
      name: formData.name.trim(),
      price: Number(formData.price),
      description: formData.description.trim(),
      category: CATEGORY_MAP[formData.category[0]],
      backgroundHexacode: formData.backgroundHexacode, // vẫn gửi để backend không lỗi
      image: formData.image,
    };

    onSubmit(submitData);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-pink-800">
              {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X size={28} className="text-gray-600" />
            </button>
          </div>

          {/* Ảnh + Preview */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 mb-8 text-center border-2 border-dashed border-pink-300">
            {formData.image ? (
              <div className="space-y-6">
                <div className="w-64 h-64 mx-auto rounded-3xl shadow-2xl border-8 border-white overflow-hidden">
                  <img
                    src={typeof formData.image === "string" ? formData.image : URL.createObjectURL(formData.image)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="cursor-pointer inline-block px-8 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition">
                  Đổi ảnh
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => e.target.files[0] && setFormData({ ...formData, image: e.target.files[0] })}
                  />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="py-16">
                  <ImageIcon className="mx-auto w-20 h-20 text-pink-500 mb-4" />
                  <p className="text-2xl font-bold text-pink-700">Click để upload ảnh sản phẩm</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => e.target.files[0] && setFormData({ ...formData, image: e.target.files[0] })}
                />
              </label>
            )}
          </div>

          {/* Danh mục */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Danh mục</h3>
            <div className="grid grid-cols-3 gap-6">
              {["Cakes", "Drinks", "Foods"].map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-4 cursor-pointer p-5 rounded-2xl hover:bg-pink-50 transition bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.category.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                    className="w-7 h-7 accent-pink-600 rounded"
                  />
                  <span className="text-xl font-bold text-gray-800">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tên + Giá */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-xl font-bold mb-3 text-gray-800">Tên sản phẩm</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Trà sữa trân châu Hermosa"
                className="w-full px-6 py-4 text-xl border-2 border-pink-200 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xl font-bold mb-3 text-gray-800">Giá (VNĐ)</label>
              <input
                type="text"
                value={formData.price ? Number(formData.price).toLocaleString("vi-VN") : ""}
                onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/[^\d]/g, "") })}
                placeholder="99.000"
                className="w-full px-6 py-4 text-xl font-mono border-2 border-pink-200 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none"
              />
            </div>
          </div>

          {/* Mô tả sản phẩm */}
          <div className="mb-10">
            <label className="block text-xl font-bold mb-3 text-gray-800">Mô tả sản phẩm</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả chi tiết về sản phẩm (nguyên liệu, hương vị, kích thước...)"
              rows="5"
              className="w-full px-6 py-4 text-lg border-2 border-pink-200 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none resize-none"
            />
          </div>

          {/* Nút bấm */}
          <div className="flex justify-end gap-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-10 py-4 text-xl font-bold bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl hover:from-pink-600 hover:to-rose-600 transition shadow-2xl"
            >
              {isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}