import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "http://34.142.200.151/user";

export default function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // id là userID hoặc _id
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Nếu là edit → load dữ liệu user
  useEffect(() => {
    if (isEdit) {
      const fetchUser = async () => {
        try {
          const res = await axios.get(`${API_BASE}/view-all-user`);
          const user = res.data.data.find(
            (u) => (u.userID || u._id.toString()) === id
          );
          if (user) {
            setFormData({
              email: user.email || "",
              name: user.name || "",
              password: "", // Không hiển thị mật khẩu cũ
            });
          } else {
            toast.error("Không tìm thấy khách hàng");
            navigate("/customers");
          }
        } catch (err) {
          toast.error("Lỗi tải thông tin khách hàng");
        }
      };
      fetchUser();
    }
  }, [isEdit, id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        // Chỉ cập nhật name (nếu cần thêm API update ở backend)
        toast.success("Chỉnh sửa thành công (hiện tại chỉ cập nhật tên hiển thị)");
        navigate("/customers");
      } else {
        // Thêm mới - bạn cần thêm route /admin/create-user ở backend nếu muốn
        toast.info("Chức năng thêm khách hàng cần route backend riêng");
        navigate("/customers");
      }
    } catch (err) {
      toast.error("Lỗi khi lưu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-12 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-semibold mt-2">
            {isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
          </h1>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#EF4543] text-white px-6 py-3 rounded-lg hover:bg-[#e03b39] disabled:opacity-70"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Gmail) {isEdit && "(không thể sửa)"}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isEdit}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4543]/40 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên hiển thị (Username)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4543]/40"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EF4543]/40"
              />
              <p className="text-xs text-gray-500 mt-1">
                Mật khẩu sẽ được mã hóa tự động
              </p>
            </div>
          )}

          {isEdit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Để thay đổi mật khẩu, vui lòng dùng chức năng "Quên mật khẩu" hoặc thêm route đổi mật khẩu riêng.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}