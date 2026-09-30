import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  FileSpreadsheet,
  Warehouse,
  History,
  ShieldCheck,
  TrendingUp,
  Box,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Analytics Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Multi-Warehouse Stock', icon: Boxes },
    { id: 'transfers', label: 'Inter-Warehouse Transfers', icon: ArrowLeftRight },
    { id: 'purchaseOrders', label: 'Purchase Orders & PDFs', icon: FileSpreadsheet },
    { id: 'warehouses', label: 'Warehouses & Locations', icon: Warehouse },
    { id: 'history', label: 'Transaction Audit Trail', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Box className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
            APEX SCM <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">ENT</span>
          </h1>
          <p className="text-xs text-slate-400">Multi-Location Inventory</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Core Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info / Role Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-blue-400 text-sm">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Operator'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-slate-400 font-medium">{user?.role || 'Clerk'}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
