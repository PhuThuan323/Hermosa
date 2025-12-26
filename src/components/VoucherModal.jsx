import React, { useState, useEffect } from "react";
import { X, Percent, DollarSign } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "http://34.142.200.151/voucher";

export default function VoucherModal({ isOpen, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState({
    description: "",
    discountType: "percentage",
    discountValue: "",
    minPurchaseAmount: "",
    validFrom: "",
    validTo: "",
    usageLimit: "",
  });

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({
        description: initialData.description || "",
        discountType: initialData.discountType || "percentage",
        discountValue: initialData.discountValue?.toString() || "",
        minPurchaseAmount: initialData.minPurchaseAmount?.toString() || "",
        validFrom: initialData.validFrom ? format(new Date(initialData.validFrom), "yyyy-MM-dd") : "",
        validTo: initialData.validTo ? format(new Date(initialData.validTo), "yyyy-MM-dd") : "",
        usageLimit: initialData.usageLimit?.toString() || "",
      });
    } else if (!isOpen) {
      // Reset form khi đóng
      setFormData({
        description: "",
        discountType: "percentage",
        discountValue: "",
        minPurchaseAmount: "",
        validFrom: "",
        validTo: "",
        usageLimit: "",
      });
    }
  }, [initialData, isEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
      return;
    }

    try {
      if (isEdit) {
        await axios.put(`${API_BASE}/update`, {
          voucherCode: initialData.voucherCode,
          ...formData,
        });
        toast.success("Cập nhật voucher thành công!");
      } else {
        await axios.post(`${API_BASE}/create`, formData);
        toast.success("Tạo voucher thành công!");
      }
      onSubmit();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(isEdit ? "Cập nhật thất bại" : "Tạo voucher thất bại");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
          <h2 className="text-2xl font-bold">
            {isEdit ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả voucher</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
              placeholder="VD: Giảm 20% cho đơn từ 300k"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Loại giảm giá</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discountType: "percentage" })}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                    formData.discountType === "percentage"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Percent size={20} /> Phần trăm
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discountType: "fixed" })}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                    formData.discountType === "fixed"
                      ? "bg-pink-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <DollarSign size={20} /> Tiền mặt
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {formData.discountType === "percentage" ? "Giảm (%)" : "Giảm (VNĐ)"}
              </label>
              <input
                type="number"
                required
                min="1"
                max={formData.discountType === "percentage" ? 100 : undefined}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Đơn tối thiểu (VNĐ)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.minPurchaseAmount}
              onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Hiệu lực từ</label>
              <input
                type="date"
                required
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Đến ngày</label>
              <input
                type="date"
                required
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Giới hạn sử dụng (0 = không giới hạn)
            </label>
            <input
              type="number"
              min="0"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none"
              placeholder="Ví dụ: 100"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition shadow-lg"
            >
              {isEdit ? "Cập nhật" : "Tạo ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}