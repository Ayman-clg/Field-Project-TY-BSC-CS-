import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  Shield,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({
  activeTab,
  onOpenTransfer,
  onOpenCreatePO,
  lowStockCount = 0,
  lowStockItems = [],
  onSelectProduct,
}) => {
  const { user, loginAsRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const titleMap = {
    dashboard: 'Supply Chain & Inventory Overview',
    inventory: 'Multi-Location Stock Management',
    transfers: 'Inter-Warehouse Inventory Transfers',
    purchaseOrders: 'Purchase Orders & PDF Generation',
    warehouses: 'Warehouse Facilities & Capacity',
    history: 'Comprehensive Transaction Audit Log',
  };

  const handleRoleChange = async (role) => {
    await loginAsRole(role);
    setShowRoleMenu(false);
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 tracking-tight">
          {titleMap[activeTab] || 'Inventory Dashboard'}
        </h2>
        <p className="text-xs text-slate-400">
          Enterprise ERP • Real-time Multi-Warehouse Synchronization
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button */}
        <button
          onClick={onOpenTransfer}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>New Transfer</span>
        </button>

        {/* Live RBAC Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-200 transition-all cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Role: <strong className="text-white">{user?.role || 'Admin'}</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Switch Live Role (RBAC Demo)
              </div>
              {[
                { role: 'Admin', desc: 'Full access + PO approvals' },
                { role: 'Manager', desc: 'Stock transfers & adjustments' },
                { role: 'Clerk', desc: 'View stock & count updates' },
              ].map(({ role, desc }) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 transition-colors ${
                    user?.role === role ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{role}</div>
                    <div className="text-[10px] text-slate-400">{desc}</div>
                  </div>
                  {user?.role === role && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Stock Warnings"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-3 bg-slate-850 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-100">Low Stock Notifications</span>
                </div>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                  {lowStockCount} critical
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-750">
                {lowStockItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    All inventory levels within nominal threshold.
                  </div>
                ) : (
                  lowStockItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setShowNotifications(false);
                        if (onSelectProduct) onSelectProduct(item);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-200">{item.productName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                          {item.warehouseCode}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-rose-400 font-bold">
                          Qty: {item.currentQuantity} {item.unit}
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          Alert Below: {item.minStockAlert}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
