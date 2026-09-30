import React, { useState } from 'react';
import { X, FilePlus2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { createPurchaseOrderApi } from '../../services/api';

export const CreatePoModal = ({ isOpen, onClose, products = [], warehouses = [], onSuccess }) => {
  const [supplier, setSupplier] = useState({
    name: 'Apex Industrial Dynamics Inc.',
    email: 'orders@apexind.com',
    phone: '+1-800-555-4001',
    address: '742 Foundry Blvd, Detroit, MI 48201',
  });
  const [targetWarehouse, setTargetWarehouse] = useState(warehouses[0]?._id || '');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('Urgent stock replenishment order.');
  const [items, setItems] = useState([
    {
      product: products[0]?._id || '',
      quantity: 10,
      unitPrice: products[0]?.unitPrice || 100,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleProductChange = (index, prodId) => {
    const selectedProd = products.find((p) => p._id === prodId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      product: prodId,
      unitPrice: selectedProd ? selectedProd.unitPrice : 0,
    };
    setItems(newItems);
  };

  const handleQtyChange = (index, qty) => {
    const newItems = [...items];
    newItems[index].quantity = Number(qty);
    setItems(newItems);
  };

  const handlePriceChange = (index, price) => {
    const newItems = [...items];
    newItems[index].unitPrice = Number(price);
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        product: products[0]?._id || '',
        quantity: 5,
        unitPrice: products[0]?.unitPrice || 50,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const taxAmount = subtotal * 0.05;
  const grandTotal = subtotal + taxAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetWarehouse) {
      setError('Please select a destination warehouse.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createPurchaseOrderApi({
        supplier,
        targetWarehouse,
        paymentTerms,
        notes,
        taxRate: 5,
        items,
      });

      if (res.data?.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create Purchase Order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base">Generate Purchase Order</h3>
              <p className="text-xs text-slate-400">Create vendor order with live pricing and PDF streaming</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Supplier details */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Vendor / Supplier Information
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={supplier.name}
                  onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={supplier.email}
                  onChange={(e) => setSupplier({ ...supplier, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Logistics Target */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Target Warehouse *</label>
              <select
                value={targetWarehouse}
                onChange={(e) => setTargetWarehouse(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Order Line Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-slate-800/80 border border-slate-700"
                  >
                    <div className="col-span-5">
                      <select
                        value={item.product}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      >
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            [{p.sku}] {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500 text-right"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500 text-right font-mono"
                      />
                    </div>

                    <div className="col-span-2 text-right font-mono text-xs font-bold text-emerald-400">
                      ${lineTotal.toFixed(2)}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Tax (5%):</span>
              <span className="font-mono text-slate-200">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-700">
              <span>Grand Total:</span>
              <span className="font-mono text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
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
              {loading ? 'Creating PO...' : 'Create & Submit Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
