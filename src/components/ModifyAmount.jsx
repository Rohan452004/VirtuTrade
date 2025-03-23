import react, { useState, useEffect } from "react";

function ModifyAmount({ isOpen, data, onClose, onSubmit }) {
  const [modifiedPrice, setModifiedPrice] = useState("");
  const [modifiedQty, setModifiedQty] = useState("");

  useEffect(() => {
    setModifiedPrice(data?.price);
    setModifiedQty(data?.qty);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      {/* Dialog Box */}
      <div className="bg-white rounded-sm p-5 w-96 shadow-lg">
        <h2 className="text-xl font-semibold text-center mb-4">
          Modify {data?.stockName}
        </h2>

        {/* Price Input */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded-sm mb-4 focus:outline-none focus:border-gray-800"
          value={modifiedPrice}
          onChange={(e) => setModifiedPrice(e.target.value)}
          placeholder="Modify Amount"
        />

        {/* Quantity Input */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded-sm mb-6 focus:outline-none focus:border-gray-800"
          value={modifiedQty}
          onChange={(e) => setModifiedQty(e.target.value)}
          placeholder="Modify Qty"
        />

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 transition-colors"
            onClick={() => onSubmit(modifiedPrice, modifiedQty)}
          >
            Modify
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModifyAmount;
