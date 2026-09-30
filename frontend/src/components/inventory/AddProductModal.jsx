import React, { useState } from 'react';
import { X, PackagePlus, AlertCircle } from 'lucide-react';
import { createProductApi } from '../../services/api';

export const AddProductModal = ({ isOpen, onClose, warehouses, onSuccess }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Electronics',
    unit: 'Units',
    unitPrice: 50,
    minStockAlert: 20,
    initialWarehouseId: warehouses[0]?._id || '',
    initialQuantity: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unit: formData.unit,
        unitPrice: Number(formData.unitPrice),
        minStockAlert: Number(formData.minStockAlert),
      };

      if (formData.initialWarehouseId && formData.initialQuantity > 0) {
        payload.initialWarehouseStock = {
          warehouseId: formData.initialWarehouseId,
          quantity: Number(formData.initialQuantity),
        };
      }

      const res = await createProductApi(payload);
      if (res.data?.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Add Master Catalog Product</h3>
              <p className="text-xs text-slate-400">Register a new product SKU across all facilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. SENS-IR-200"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Electronics">Electronics</option>
                <option value="Motors & Actuators">Motors & Actuators</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Energy Storage">Energy Storage</option>
                <option value="Hydraulics">Hydraulics</option>
                <option value="Sensors">Sensors</option>
                <option value="Hardware">Hardware</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. High Precision Ultrasonic Transducer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure</label>
              <input
                type="text"
                placeholder="Units, Boxes, Kg"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Min Reorder Alert</label>
              <input
                type="number"
                min="1"
                value={formData.minStockAlert}
                onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Initial Stock Allocation */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Initial Stock Allocation (Optional)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Warehouse</label>
                <select
                  value={formData.initialWarehouseId}
                  onChange={(e) => setFormData({ ...formData, initialWarehouseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="">No Initial Stock</option>
                  {warehouses.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.initialQuantity}
                  onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Register Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
