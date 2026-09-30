import React from 'react';
import {
  DollarSign,
  Boxes,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  Warehouse,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const DashboardView = ({
  analytics,
  onOpenTransfer,
  onOpenCreatePO,
  setActiveTab,
}) => {
  const summary = analytics?.summary || {
    totalProducts: 0,
    totalWarehouses: 0,
    totalStockUnits: 0,
    totalInventoryValue: 0,
    totalPOs: 0,
    lowStockCount: 0,
  };

  const warehouseData = analytics?.warehouseBreakdown || [];
  const categoryData = analytics?.categoryBreakdown || [];
  const lowStockAlerts = analytics?.lowStockAlerts || [];
  const recentActivity = analytics?.recentActivity || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Valuation */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Inventory Valuation
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              ${Number(summary.totalInventoryValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">Real-time</span> across {summary.totalWarehouses} facilities
            </p>
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total On-Hand Units
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {Number(summary.totalStockUnits || 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">units</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Covering {summary.totalProducts} active master SKUs
            </p>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Critical Low Stock
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-400 tracking-tight flex items-center gap-2">
              {summary.lowStockCount}
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Below reorder threshold point
            </p>
          </div>
        </div>

        {/* Purchase Orders */}
        <div
          onClick={() => setActiveTab('purchaseOrders')}
          className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4 shadow-sm relative overflow-hidden cursor-pointer hover:border-blue-500/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Purchase Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight">
              {summary.totalPOs} <span className="text-sm font-normal text-slate-400">Orders</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Procurement pipeline & PDF docs
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warehouse Stock Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/70 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Stock Units per Warehouse Facility</h3>
              <p className="text-xs text-slate-400">Distribution of on-hand inventory across logistics centers</p>
            </div>
            <Warehouse className="w-4 h-4 text-blue-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(value) => [`${value} units`, 'Stock Units']}
                  labelFormatter={(code) => `Facility: ${code}`}
                />
                <Bar dataKey="totalUnits" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100">Category Share</h3>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xs text-slate-400">Unit breakdown by product category</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-700/60">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-300 truncate">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Low Stock Table & Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items Card */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">Low Stock Reorder Alerts</h3>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View All
            </button>
          </div>

          {lowStockAlerts.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No critical stock warnings.</p>
          ) : (
            <div className="space-y-2.5">
              {lowStockAlerts.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-750"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{item.productName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      SKU: <span className="font-mono text-slate-300">{item.sku}</span> • {item.warehouseName} ({item.warehouseCode})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-rose-400">
                      {item.currentQuantity} {item.unit}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Min Alert: {item.minStockAlert}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Audit Stream */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100">Recent Supply Chain Activity</h3>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Full Log
            </button>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent transactions recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {recentActivity.slice(0, 5).map((tx) => (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-750"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                        tx.type === 'TRANSFER'
                          ? 'bg-blue-500/20 text-blue-400'
                          : tx.type === 'RECEIPT'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {tx.type === 'TRANSFER' ? (
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      ) : tx.type === 'RECEIPT' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {tx.type} • {tx.product?.name || 'Item'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {tx.fromWarehouse ? `${tx.fromWarehouse.code} ➔ ` : ''}
                        {tx.toWarehouse ? tx.toWarehouse.code : 'System'} • {tx.quantity} units
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
