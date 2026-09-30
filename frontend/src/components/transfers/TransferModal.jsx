import React, { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeftRight, AlertCircle, CheckCircle2, Warehouse, Package } from 'lucide-react';
import { executeTransferApi } from '../../services/api';

export const TransferModal = ({
  isOpen,
  onClose,
  products = [],
  warehouses = [],
  stockList = [],
  preselectedStock = null,
  onSuccess,
}) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Initialize or update selection if preselectedStock provided
  useEffect(() => {
    if (preselectedStock) {
      setSelectedProductId(preselectedStock.product?._id || '');
      setFromWarehouseId(preselectedStock.warehouse?._id || '');
      // Pick first alternative warehouse for destination
      const otherWh = warehouses.find((w) => w._id !== preselectedStock.warehouse?._id);
      if (otherWh) setToWarehouseId(otherWh._id);
      setQuantity(Math.min(5, preselectedStock.quantity || 1));
    } else if (products.length && warehouses.length >= 2) {
      if (!selectedProductId) setSelectedProductId(products[0]._id);
      if (!fromWarehouseId) setFromWarehouseId(warehouses[0]._id);
      if (!toWarehouseId) setToWarehouseId(warehouses[1]._id);
    }
  }, [preselectedStock, products, warehouses, isOpen]);

  // Compute live available stock at source warehouse
  const availableSourceStock = useMemo(() => {
    if (!selectedProductId || !fromWarehouseId) return 0;
    const found = stockList.find(
      (s) =>
        s.product?._id === selectedProductId &&
        s.warehouse?._id === fromWarehouseId
    );
    return found ? found.quantity : 0;
  }, [selectedProductId, fromWarehouseId, stockList]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => p._id === selectedProductId);
  }, [selectedProductId, products]);

  if (!isOpen) return null;

  const isSameWarehouse = fromWarehouseId && toWarehouseId && fromWarehouseId === toWarehouseId;
  const isExceedingStock = Number(quantity) > availableSourceStock;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSameWarehouse) {
      setError('Source and Destination facilities cannot be identical.');
      return;
    }
    if (isExceedingStock) {
      setError(`Cannot transfer ${quantity} units. Only ${availableSourceStock} available in source facility.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await executeTransferApi({
        productId: selectedProductId,
        fromWarehouseId,
        toWarehouseId,
        quantity: Number(quantity),
        notes,
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'ACID Stock Transfer Completed Successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Inter-Warehouse Transfer</h3>
              <p className="text-xs text-slate-400">ACID-balanced real-time stock redistribution</p>
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

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Product Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Select Product to Move *</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.sku}] {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Source & Destination Warehouse Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Source Warehouse */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Warehouse className="w-3.5 h-3.5 text-blue-400" />
                <span>Source Origin</span>
              </label>
              <select
                value={fromWarehouseId}
                onChange={(e) => setFromWarehouseId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500 mb-2"
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>

              {/* Live Source Stock Indicator */}
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-750">
                <span className="text-slate-400">Available Stock:</span>
                <span
                  className={`font-bold font-mono ${
                    availableSourceStock === 0
                      ? 'text-rose-400'
                      : availableSourceStock <= 15
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {availableSourceStock} {selectedProduct?.unit || 'units'}
                </span>
              </div>
            </div>

            {/* Destination Warehouse */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
                <span>Destination Target</span>
              </label>
              <select
                value={toWarehouseId}
                onChange={(e) => setToWarehouseId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500 mb-2"
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>

              <div className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-750">
                {isSameWarehouse ? (
                  <span className="text-rose-400 font-medium">Cannot match origin</span>
                ) : (
                  <span>Ready for receipt</span>
                )}
              </div>
            </div>
          </div>

          {/* Quantity & Notes */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity *</label>
              <input
                type="number"
                min="1"
                max={availableSourceStock || 1}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg bg-slate-800 border text-slate-100 text-xs focus:outline-none font-bold ${
                  isExceedingStock ? 'border-rose-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Transfer Manifest Note</label>
              <input
                type="text"
                placeholder="e.g. Demand rebalance for Q4 orders"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Summary Callout */}
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
            <ArrowLeftRight className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
            <div>
              <span className="font-semibold text-white">Transactional Isolation:</span> Stock is decremented from origin and credited to destination atomically within a single Mongoose session.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availableSourceStock === 0 || isSameWarehouse || isExceedingStock}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Transfer...' : 'Execute Stock Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
