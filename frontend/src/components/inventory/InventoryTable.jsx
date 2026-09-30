import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowLeftRight,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle,
  Warehouse as WarehouseIcon,
  Tag,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AddProductModal } from './AddProductModal';
import { AdjustStockModal } from './AdjustStockModal';

export const InventoryTable = ({
  stockList,
  warehouses,
  onRefresh,
  onOpenTransferForProduct,
}) => {
  const { isManager } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modals state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [adjustingStockItem, setAdjustingStockItem] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    stockList.forEach((s) => {
      if (s.product?.category) set.add(s.product.category);
    });
    return ['All', ...Array.from(set)];
  }, [stockList]);

  // Filtered stocks
  const filteredStock = useMemo(() => {
    return stockList.filter((item) => {
      if (!item.product || !item.warehouse) return false;

      // Warehouse filter
      if (selectedWarehouse !== 'All' && item.warehouse._id !== selectedWarehouse) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && item.product.category !== selectedCategory) {
        return false;
      }

      // Low stock only filter
      const minAlert = item.product.minStockAlert || item.reorderLevel || 15;
      const isLow = item.quantity <= minAlert;
      if (onlyLowStock && !isLow) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = item.product.name?.toLowerCase().includes(q);
        const skuMatch = item.product.sku?.toLowerCase().includes(q);
        const whMatch = item.warehouse.name?.toLowerCase().includes(q) || item.warehouse.code?.toLowerCase().includes(q);
        return nameMatch || skuMatch || whMatch;
      }

      return true;
    });
  }, [stockList, selectedWarehouse, selectedCategory, onlyLowStock, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-slate-850 border border-slate-750 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, product name, or warehouse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        {/* Warehouse Filter */}
        <div className="flex items-center gap-2">
          <WarehouseIcon className="w-4 h-4 text-slate-400" />
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Warehouses ({warehouses.length})</option>
            {warehouses.map((w) => (
              <option key={w._id} value={w._id}>
                {w.code} - {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        {/* Low Stock Toggle */}
        <button
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            onlyLowStock
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Low Stock Only</span>
        </button>

        {/* Add Product (RBAC) */}
        {isManager && (
          <button
            onClick={() => setShowAddProduct(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        )}
      </div>

      {/* Main Stock Table */}
      <div className="bg-slate-850 border border-slate-750 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase font-bold text-slate-400 text-[11px] tracking-wider border-b border-slate-750">
              <tr>
                <th className="px-4 py-3.5">SKU & Item Details</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Warehouse Facility</th>
                <th className="px-4 py-3.5 text-right">On-Hand Stock</th>
                <th className="px-4 py-3.5 text-right">Min Threshold</th>
                <th className="px-4 py-3.5 text-right">Unit Price</th>
                <th className="px-4 py-3.5 text-right">Total Value</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No matching inventory items found for the current filters.
                  </td>
                </tr>
              ) : (
                filteredStock.map((stock) => {
                  const minAlert = stock.product.minStockAlert || stock.reorderLevel || 15;
                  const isLow = stock.quantity <= minAlert;
                  const itemValue = (stock.quantity * (stock.product.unitPrice || 0));

                  return (
                    <tr
                      key={stock._id}
                      className={`hover:bg-slate-800/60 transition-colors ${
                        isLow ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* SKU & Name */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-100">{stock.product.name}</div>
                        <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-400">
                            {stock.product.sku}
                          </span>
                          <span>• {stock.product.unit || 'Units'}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                          {stock.product.category || 'General'}
                        </span>
                      </td>

                      {/* Warehouse Facility */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{stock.warehouse.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {stock.warehouse.code} • {stock.warehouse.location}
                        </div>
                      </td>

                      {/* On-Hand Stock */}
                      <td className="px-4 py-3 text-right">
                        <div className={`font-bold text-sm ${isLow ? 'text-rose-400' : 'text-slate-100'}`}>
                          {stock.quantity.toLocaleString()}
                        </div>
                      </td>

                      {/* Threshold */}
                      <td className="px-4 py-3 text-right text-slate-400">
                        {minAlert}
                      </td>

                      {/* Unit Price */}
                      <td className="px-4 py-3 text-right text-slate-300 font-mono">
                        ${Number(stock.product.unitPrice || 0).toFixed(2)}
                      </td>

                      {/* Total Value */}
                      <td className="px-4 py-3 text-right font-semibold text-emerald-400 font-mono">
                        ${itemValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            Optimal
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setAdjustingStockItem(stock)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            title="Adjust Stock Count"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          {isManager && (
                            <button
                              onClick={() => onOpenTransferForProduct(stock)}
                              className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 transition-colors"
                              title="Initiate Inter-Warehouse Transfer"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        warehouses={warehouses}
        onSuccess={onRefresh}
      />

      <AdjustStockModal
        isOpen={!!adjustingStockItem}
        onClose={() => setAdjustingStockItem(null)}
        stockItem={adjustingStockItem}
        onSuccess={onRefresh}
      />
    </div>
  );
};
