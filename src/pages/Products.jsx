import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import ProductModal from "../components/ProductModal.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal.jsx";
import DeleteSuccessModal from "../components/DeleteSuccessModal.jsx";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "http://34.142.200.151/menu";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  // LẤY DỮ LIỆU SẢN PHẨM
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/all-product`);
      if (res.data.status === "Success") {
        const formatted = res.data.data.map((item) => ({
          id: item.productID,
          name: item.name,
          category:
            item.category === "cake"
              ? "Cakes"
              : item.category === "drink"
              ? "Drinks"
              : "Foods",
          rawCategory: item.category,
          price: new Intl.NumberFormat("vi-VN").format(item.price) + " đ",
          image: item.picture,
          description: item.description || "Chưa có mô tả",
          backgroundHexacode: item.backgroundHexacode || "#FFB6C1",
        }));

        const sorted = formatted.sort((a, b) => {
          const order = { Cakes: 0, Drinks: 1, Foods: 2 };
          return order[a.category] - order[b.category];
        });

        setProducts(sorted);
        setFilteredProducts(sorted);
      }
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
      toast.error("Không tải được sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Lọc theo danh mục + tìm kiếm
  useEffect(() => {
    let result = products;

    if (activeCategory !== "All") {
      result = result.filter((p) => p.category === activeCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }

    setFilteredProducts(result);
  }, [products, activeCategory, searchTerm]);

  // Search toàn cục từ TopBar
  useEffect(() => {
    const handleGlobalSearch = (e) => {
      const query = (e.detail || "").trim();
      setSearchTerm(query);
    };
    window.addEventListener("globalSearch", handleGlobalSearch);
    return () => window.removeEventListener("globalSearch", handleGlobalSearch);
  }, []);

  // Danh mục & số lượng
  const categories = ["All", "Cakes", "Drinks", "Foods"];
  const categoryCount = {
    All: products.length,
    Cakes: products.filter((p) => p.category === "Cakes").length,
    Drinks: products.filter((p) => p.category === "Drinks").length,
    Foods: products.filter((p) => p.category === "Foods").length,
  };

  // XÓA SẢN PHẨM
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/delete`, { data: { productID: toDeleteId } });
      setProducts((prev) => prev.filter((p) => p.id !== toDeleteId));
      toast.success("Xóa thành công!");
    } catch (err) {
      toast.error("Xóa thất bại");
    } finally {
      setConfirmOpen(false);
      setDoneOpen(true);
    }
  };

  // THÊM SẢN PHẨM
  const handleAddProduct = async (formData) => {
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("description", formData.description || "");
      data.append("category", formData.category);
      data.append("backgroundHexacode", formData.backgroundHexacode || "#FFB6C1");
      if (formData.image) data.append("picture", formData.image);

      await axios.post(`${API_BASE}/add`, data);
      toast.success("Thêm sản phẩm thành công!");
      fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Thêm thất bại: " + (err.response?.data?.message || "Lỗi server"));
    }
  };

  // SỬA SẢN PHẨM
  const handleEditProduct = async (formData) => {
    try {
      // Cập nhật ảnh nếu có thay đổi
      if (formData.image && typeof formData.image !== "string") {
        const imgData = new FormData();
        imgData.append("productID", editingProduct.id);
        imgData.append("picture", formData.image);
        await axios.put(`${API_BASE}/change-product-picture`, imgData);
      }

      // Cập nhật thông tin chi tiết (gồm description và backgroundHexacode để backend không lỗi)
      await axios.put(`${API_BASE}/change-product-detail`, {
        productID: editingProduct.id,
        name: formData.name,
        price: formData.price,
        description: formData.description || "",
        backgroundHexacode: formData.backgroundHexacode || "#FFB6C1",
      });

      toast.success("Cập nhật thành công!");
      fetchProducts();
      setEditingProduct(null);
    } catch (err) {
      console.error("Lỗi edit:", err.response?.data);
      toast.error("Cập nhật thất bại: " + (err.response?.data?.message || "Lỗi server"));
    }
  };

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Tabs + Search + Add Button */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="bg-pink-50 rounded-xl px-3 py-2 flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  activeCategory === cat
                    ? "bg-white text-pink-600 shadow-md"
                    : "text-gray-700 hover:bg-white/70"
                }`}
              >
                {cat} ({categoryCount[cat]})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-72 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-300 focus:border-pink-500 outline-none text-sm font-medium"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition shadow-lg"
            >
              <Plus size={20} /> Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Bảng sản phẩm */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="w-16 h-16 animate-spin text-pink-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-pink-50 text-pink-800 font-bold">
                  <tr>
                    <th className="text-left py-4 px-6">ID</th>
                    <th className="text-left py-4 px-6">Hình</th>
                    <th className="text-left py-4 px-6">Tên sản phẩm</th>
                    <th className="text-left py-4 px-6">Danh mục</th>
                    <th className="text-left py-4 px-6">Mô tả</th>
                    <th className="text-left py-4 px-6">Giá</th>
                    <th className="text-left py-4 px-6">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-20 text-gray-500 text-lg">
                        {searchTerm || activeCategory !== "All"
                          ? "Không tìm thấy sản phẩm nào"
                          : "Chưa có sản phẩm"}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-pink-50/30 transition">
                        <td className="py-4 px-6 font-medium text-pink-700">#{item.id}</td>
                        <td className="py-4 px-6">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl shadow-md border-2 border-pink-100"
                            onError={(e) => (e.target.src = "https://i.imgur.com/pN0J7wP.png")}
                          />
                        </td>
                        <td className="py-4 px-6 font-bold text-gray-800">{item.name}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                              item.category === "Cakes"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.category === "Drinks"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 max-w-md truncate">
                          {item.description}
                        </td>
                        <td className="py-4 px-6 text-pink-600 font-bold text-lg">{item.price}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-3">
                            <button
                              onClick={() => setEditingProduct(item)}
                              className="p-2.5 rounded-lg border border-gray-300 hover:bg-blue-50 transition"
                            >
                              <Edit size={18} className="text-blue-600" />
                            </button>
                            <button
                              onClick={() => {
                                setToDeleteId(item.id);
                                setConfirmOpen(true);
                              }}
                              className="p-2.5 rounded-lg border border-red-200 hover:bg-red-50 transition"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-right">
              <p className="text-sm text-gray-600 font-medium">
                Tổng: <span className="text-pink-600 font-bold text-lg">{products.length}</span> sản phẩm
                {activeCategory !== "All" && ` • Đang xem ${filteredProducts.length} ${activeCategory}`}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Các Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
      />
      {editingProduct && (
        <ProductModal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleEditProduct}
          initialData={editingProduct}
          isEdit
        />
      )}
      <ConfirmDeleteModal
        open={confirmOpen}
        title="Xóa sản phẩm"
        message="Chắc chắn xóa không?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
      <DeleteSuccessModal open={doneOpen} text="Xóa thành công!" onClose={() => setDoneOpen(false)} />
    </div>
  );
}