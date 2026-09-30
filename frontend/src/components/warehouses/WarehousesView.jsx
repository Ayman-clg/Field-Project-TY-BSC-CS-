import React, { useState } from 'react';
import { Warehouse, MapPin, Mail, Phone, Plus, Server, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createWarehouseApi } from '../../services/api';

export const WarehousesView = ({ warehouses = [], analytics, onRefresh }) => {
  const { isAdmin } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    capacity: 20000,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [loading, setLoading] = useState(false);

  const warehouseStats = {};
  if (analytics?.warehouseBreakdown) {
    analytics.warehouseBreakdown.forEach((w) => {
      warehouseStats[w.code] = w;
    });
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createWarehouseApi({
        name: formData.name,
        code: formData.code.toUpperCase(),
        location: formData.location,
        capacity: Number(formData.capacity),
        contactPerson: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
      });
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add warehouse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-850 border border-slate-750 p-4 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Enterprise Warehouse Network</h3>
          <p className="text-xs text-slate-400">Manage multi-location logistic hubs and capacity</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Facility</span>
          </button>
        )}
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {warehouses.map((w) => {
          const stats = warehouseStats[w.code] || { totalUnits: 0, totalValue: 0, itemCount: 0 };
          const usedPercent = Math.min(100, Math.round(((stats.totalUnits || 0) / (w.capacity || 10000)) * 100));

          return (
            <div
              key={w._id}
              className="bg-slate-850 border border-slate-750 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{w.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                        {w.code}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {w.location}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Capacity Utilization</span>
                  <span className="font-bold text-slate-200">
                    {stats.totalUnits.toLocaleString()} / {w.capacity.toLocaleString()} units ({usedPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usedPercent > 80 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Facility Value</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    ${Number(stats.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">Contact Lead</span>
                  <span className="font-medium text-slate-300 truncate block">
                    {w.contactPerson?.name || 'Operations Lead'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Add New Warehouse Facility</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Texas Logistics Hub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="WH-HOU"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Capacity (units)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Location City/State *</label>
                <input
                  type="text"
                  required
                  placeholder="Houston, TX"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="Facility Manager Name"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  {loading ? 'Creating...' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
