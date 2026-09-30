import React, { useState } from 'react';
import { ArrowLeftRight, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TransferHistory = ({ transfers = [], onOpenTransfer, isManager }) => {
  const [search, setSearch] = useState('');

  const filtered = transfers.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const prodMatch = t.product?.name?.toLowerCase().includes(q) || t.product?.sku?.toLowerCase().includes(q);
    const fromMatch = t.fromWarehouse?.name?.toLowerCase().includes(q) || t.fromWarehouse?.code?.toLowerCase().includes(q);
    const toMatch = t.toWarehouse?.name?.toLowerCase().includes(q) || t.toWarehouse?.code?.toLowerCase().includes(q);
    const txMatch = t.transactionNumber?.toLowerCase().includes(q);
    return prodMatch || fromMatch || toMatch || txMatch;
  });

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="bg-slate-850 border border-slate-750 p-4 rounded-xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transfers by TX #, SKU, or warehouse code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {isManager && (
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Initiate Transfer</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-850 border border-slate-750 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 uppercase font-bold text-slate-400 text-[11px] tracking-wider border-b border-slate-750">
              <tr>
                <th className="px-4 py-3.5">Transaction ID</th>
                <th className="px-4 py-3.5">Product / SKU</th>
                <th className="px-4 py-3.5">Source Facility</th>
                <th className="px-4 py-3.5 text-center">Movement</th>
                <th className="px-4 py-3.5">Destination Facility</th>
                <th className="px-4 py-3.5 text-right">Quantity</th>
                <th className="px-4 py-3.5">Operator</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No inter-warehouse transfer records found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-blue-400 font-semibold">
                      {tx.transactionNumber}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{tx.product?.name || 'N/A'}</div>
                      <div className="text-[10px] font-mono text-slate-400">{tx.product?.sku}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{tx.fromWarehouse?.name || 'Central'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.fromWarehouse?.code}</div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 text-blue-400">
                        ➔
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{tx.toWarehouse?.name || 'Depot'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tx.toWarehouse?.code}</div>
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-slate-100 font-mono">
                      {tx.quantity} {tx.product?.unit || 'units'}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-200 text-xs">{tx.performedBy?.name || 'System Auto'}</div>
                      <div className="text-[10px] text-slate-500">{tx.performedBy?.role || 'Admin'}</div>
                    </td>

                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
