import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CustomerForm({ isEdit = false, existingCustomer, onSave }) {
  const navigate = useNavigate();
  const { id } = useParams(); // optional if editing via route like /customers/edit/:id

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  // Prefill when editing
  useEffect(() => {
    if (isEdit && existingCustomer) {
      setFormData(existingCustomer);
    }
  }, [isEdit, existingCustomer]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(formData); // optional handler from parent
    navigate("/customers"); // back to list after save
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-12 py-10">
      {/* Top section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-semibold mt-2">
            {isEdit ? "Edit Customer" : "Add Customer"}
          </h1>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#EF4543] text-white px-5 py-2 rounded-lg hover:bg-[#e03b39]"
          >
            Save
          </button>
        </div>
      </div>

      {/* Form container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-10"
      >
        {/* Section 1: Customer Information */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Customer Information
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Most important information about the customer
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
              />
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Section 2: Customer Address */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Customer Address
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Shipping address information
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
              />
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Section 3: Customer Notes */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Customer Notes
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Add notes about customer
          </p>

          <textarea
            rows="4"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Add notes about customer"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#EF4543]/40"
          ></textarea>
        </section>
      </form>
    </div>
  );
}
