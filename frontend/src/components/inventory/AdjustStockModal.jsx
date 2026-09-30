import React, { useState } from 'react';
import { X, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { adjustStockApi } from '../../services/api';

export const AdjustStockModal = ({ isOpen, onClose, stockItem, onSuccess }) => {
  const [type, setType] = useState('ADD'); // ADD, REMOVE, SET
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !stockItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await adjustStockApi({
        productId: stockItem.product._id,
        warehouseId: stockItem.warehouse._id,
        quantity: Number(quantity),
        type,
        notes: notes || `Manual stock adjustment (${type})`,
      });

      if (res.data?.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Adjust Stock Level</h3>
              <p className="text-xs text-slate-400">Update count & record audit transaction</p>
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

          {/* Current Stock Context */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Product:</span>
              <span className="font-semibold text-slate-200">{stockItem.product?.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Location:</span>
              <span className="font-semibold text-slate-200">
                {stockItem.warehouse?.name} ({stockItem.warehouse?.code})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700">
              <span className="text-slate-400">Current On-Hand:</span>
              <span className="font-bold text-blue-400">
                {stockItem.quantity} {stockItem.product?.unit || 'units'}
              </span>
            </div>
          </div>

          {/* Adjustment Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Adjustment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ADD', label: '+ Add Stock', color: 'hover:border-emerald-500' },
                { id: 'REMOVE', label: '- Deduct Stock', color: 'hover:border-rose-500' },
                { id: 'SET', label: '= Set Count', color: 'hover:border-blue-500' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setType(m.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    type === m.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {type === 'SET' ? 'New Exact Quantity' : 'Quantity to Adjust'}
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 font-bold"
            />
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Physical cycle count discrepancy reconciliation"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
            />
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
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
