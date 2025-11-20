import React, { useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import ProductModal from "../components/ProductModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import DeleteSuccessModal from "../components/DeleteSuccessModal";

export default function ProductManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // 👈 for edit mode
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [products, setProducts] = useState([
    {
      id: "#CAK001",
      image: "https://images.unsplash.com/photo-1605478571661-8a4e4b56a8e5?w=80",
      name: "Yellow Lemon Cheese",
      category: "Cakes",
      price: "90.000 đ",
    },
    {
      id: "#CAK002",
      image: "https://images.unsplash.com/photo-1612197527762-9c6c8e2e36f7?w=80",
      name: "Tiramisu Chocolate",
      category: "Cakes",
      price: "75.000 đ",
    },
    {
      id: "#CAK003",
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=80",
      name: "Original Crosstaint",
      category: "Cakes",
      price: "35.000 đ",
    },
    {
      id: "#CAK004",
      image: "https://images.unsplash.com/photo-1605478571661-8a4e4b56a8e5?w=80",
      name: "Strawberry Donut",
      category: "Cakes",
      price: "50.000 đ",
    },
    {
      id: "#DRI001",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80",
      name: "Matcha Latte",
      category: "Drinks",
      price: "100.000 đ",
    },
    {
      id: "#FOO001",
      image: "https://images.unsplash.com/photo-1606755962773-3b35c161af2b?w=80",
      name: "Fried Chicken Burger",
      category: "Foods",
      price: "60.000 đ",
    },
  ]);

  const askDelete = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = () => {
  console.log("Deleting:", toDeleteId);
  setProducts((prev) => prev.filter((r) => r.id !== toDeleteId)); // ✅ use setProducts
  setConfirmOpen(false);
  setDoneOpen(true);
  console.log("Delete doneOpen now true");
  };




  const handleAddProduct = (newProduct) => {
    const id = `#NEW${String(products.length + 1).padStart(3, "0")}`;
    setProducts([
      ...products,
      {
        id,
        image: newProduct.image ? URL.createObjectURL(newProduct.image) : "",
        name: newProduct.name,
        category: newProduct.category.join(", "),
        price: newProduct.price,
      },
    ]);
    setIsModalOpen(false);
    setIsSuccessOpen(true);
  };

  const handleEditProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      )
    );
    setEditingProduct(null);
  };

  return (
    <div className="bg-surface min-h-screen px-8 py-4">
      <h1 className="text-3xl font-semibold text-gray-900 mb-5 mt-1">
        Product management
      </h1>

      {/* Outer white container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* Top bar */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search product"
              className="bg-white pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-[#EF4543]/40 focus:outline-none w-full"
            />
          </div>

          {/* Add Product button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FBE7E7] hover:bg-[#f9dcdc] text-gray-800 text-sm font-medium rounded-lg transition"
          >
            <Plus size={16} className="text-[#EF4543]" />
            Add Product
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-[#FBE7E7] text-gray-800 font-medium">
              <tr>
                <th className="text-left py-3 px-6">Product ID</th>
                <th className="text-left py-3 px-6">Image</th>
                <th className="text-left py-3 px-6">Name</th>
                <th className="text-left py-3 px-6">Category</th>
                <th className="text-left py-3 px-6">Price</th>
                <th className="text-left py-3 px-6">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-100 hover:bg-[#FBE7E7]/20 transition"
                >
                  <td className="py-3 px-6">{item.id}</td>
                  <td className="py-3 px-6">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                    />
                  </td>
                  <td className="py-3 px-6">{item.name}</td>
                  <td className="py-3 px-6">{item.category}</td>
                  <td className="py-3 px-6">{item.price}</td>
                  <td className="py-3 px-6">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditingProduct(item)} // 👈 open edit modal
                        className="p-2 rounded-lg border border-gray-200 hover:bg-[#FBE7E7]/60 transition"
                      >
                        <Edit size={16} className="text-gray-700" />
                      </button>
                      <button
                        onClick={() => askDelete(item.id)}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-[#FBE7E7]/60 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-[#EF4543]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProduct}
      />

      <ConfirmDeleteModal
        open={confirmOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />
      <DeleteSuccessModal
        open={doneOpen}
        text="Delete Successful"
        onClose={() => setDoneOpen(false)}
      />

      {/* EDIT modal */}
      {editingProduct && (
        <ProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onAdd={handleEditProduct}
          editData={editingProduct} // 👈 pass product to prefill
          isEdit
        />
      )}

      {/* SUCCESS popup */}
      {isSuccessOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg w-[400px]">
            <div className="flex flex-col items-center">
              <div className="bg-[#FBE7E7] w-14 h-14 flex items-center justify-center rounded-full mb-4">
                <span className="text-[#EF4543] text-3xl">✔</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Import Successful</h2>
              <p className="text-gray-600 mb-6">
                Added new products to your store
              </p>
              <button
                onClick={() => setIsSuccessOpen(false)}
                className="bg-[#EF4543] text-white px-6 py-2 rounded-lg hover:bg-[#e03b39]"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
