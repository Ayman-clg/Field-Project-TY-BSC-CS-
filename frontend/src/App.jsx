import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { InventoryTable } from './components/inventory/InventoryTable';
import { TransferModal } from './components/transfers/TransferModal';
import { TransferHistory } from './components/transfers/TransferHistory';
import { PurchaseOrdersView } from './components/purchaseOrders/PurchaseOrdersView';
import { WarehousesView } from './components/warehouses/WarehousesView';
import {
  getStockOverviewApi,
  getWarehousesApi,
  getProductsApi,
  getPurchaseOrdersApi,
  getTransferHistoryApi,
  getDashboardAnalyticsApi,
} from './services/api';
import { RefreshCw, Loader2, Database } from 'lucide-react';

const MainLayout = () => {
  const { user, isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // App Data States
  const [stockList, setStockList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Global Transfer Modal
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferPreselectedStock, setTransferPreselectedStock] = useState(null);

  // Data Fetching Function
  const fetchAllData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [stockRes, whRes, prodRes, poRes, trfRes, analyticsRes] = await Promise.allSettled([
        getStockOverviewApi(),
        getWarehousesApi(),
        getProductsApi(),
        getPurchaseOrdersApi(),
        getTransferHistoryApi(),
        getDashboardAnalyticsApi(),
      ]);

      if (stockRes.status === 'fulfilled' && stockRes.value.data?.success) {
        setStockList(stockRes.value.data.data);
      }
      if (whRes.status === 'fulfilled' && whRes.value.data?.success) {
        setWarehouses(whRes.value.data.data);
      }
      if (prodRes.status === 'fulfilled' && prodRes.value.data?.success) {
        setProducts(prodRes.value.data.data);
      }
      if (poRes.status === 'fulfilled' && poRes.value.data?.success) {
        setPurchaseOrders(poRes.value.data.data);
      }
      if (trfRes.status === 'fulfilled' && trfRes.value.data?.success) {
        setTransfers(trfRes.value.data.data);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data?.success) {
        setAnalytics(analyticsRes.value.data.data);
      }
    } catch (err) {
      console.error('Data Fetch Error:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenTransferForProduct = (stockItem) => {
    setTransferPreselectedStock(stockItem);
    setIsTransferOpen(true);
  };

  const handleOpenGeneralTransfer = () => {
    setTransferPreselectedStock(null);
    setIsTransferOpen(true);
  };

  const lowStockItems = analytics?.lowStockAlerts || [];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          activeTab={activeTab}
          onOpenTransfer={handleOpenGeneralTransfer}
          lowStockCount={analytics?.summary?.lowStockCount || 0}
          lowStockItems={lowStockItems}
          onSelectProduct={(item) => {
            setActiveTab('inventory');
          }}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {/* Subheader bar with refresh button */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs text-slate-400 font-medium">Live Cluster Online</span>
            </div>

            <button
              onClick={() => fetchAllData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Cluster'}</span>
            </button>
          </div>

          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs font-medium">Loading Multi-Warehouse Inventory System...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  analytics={analytics}
                  onOpenTransfer={handleOpenGeneralTransfer}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryTable
                  stockList={stockList}
                  warehouses={warehouses}
                  onRefresh={() => fetchAllData(true)}
                  onOpenTransferForProduct={handleOpenTransferForProduct}
                />
              )}

              {activeTab === 'transfers' && (
                <TransferHistory
                  transfers={transfers}
                  onOpenTransfer={handleOpenGeneralTransfer}
                  isManager={isManager}
                />
              )}

              {activeTab === 'purchaseOrders' && (
                <PurchaseOrdersView
                  purchaseOrders={purchaseOrders}
                  warehouses={warehouses}
                  products={products}
                  onRefresh={() => fetchAllData(true)}
                />
              )}

              {activeTab === 'warehouses' && (
                <WarehousesView
                  warehouses={warehouses}
                  analytics={analytics}
                  onRefresh={() => fetchAllData(true)}
                />
              )}

              {activeTab === 'history' && (
                <TransferHistory
                  transfers={transfers}
                  onOpenTransfer={handleOpenGeneralTransfer}
                  isManager={isManager}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Transfer Modal */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setTransferPreselectedStock(null);
        }}
        products={products}
        warehouses={warehouses}
        stockList={stockList}
        preselectedStock={transferPreselectedStock}
        onSuccess={() => fetchAllData(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
