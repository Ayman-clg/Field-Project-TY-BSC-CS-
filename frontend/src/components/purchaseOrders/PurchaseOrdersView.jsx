import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileDown,
  Plus,
  CheckCircle,
  Truck,
  Building2,
  Calendar,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CreatePoModal } from './CreatePoModal';
import { updatePOStatusApi, downloadPoPdfBlob } from '../../services/api';

export const PurchaseOrdersView = ({
  purchaseOrders = [],
  warehouses = [],
  products = [],
  onRefresh,
}) => {
  const { isManager } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const statuses = ['All', 'DRAFT', 'SUBMITTED', 'APPROVED', 'RECEIVED', 'CANCELLED'];

  const filteredPOs = purchaseOrders.filter((po) => {
    if (selectedStatus === 'All') return true;
    return po.status === selectedStatus;
  });

  const handleDownloadPdf = async (po) => {
    try {
      setDownloadingId(po._id);
      await downloadPoPdfBlob(po._id, po.poNumber);
    } catch (err) {
      console.error('Download PDF error:', err);
      alert('Could not download PO PDF. Please ensure backend server is active.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpdateStatus = async (poId, nextStatus) => {
    try {
      setUpdatingId(poId);
      const res = await updatePOStatusApi(poId, nextStatus);
      if (res.data?.success) {
        onRefresh();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Create Bar */}
      <div className="bg-slate-850 border border-slate-750 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedStatus === s
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New PO</span>
          </button>
        )}
      </div>

      {/* POs Grid / Table */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPOs.length === 0 ? (
          <div className="bg-slate-850 border border-slate-750 rounded-xl p-12 text-center text-slate-400 text-xs">
            No purchase orders found matching this filter criteria.
          </div>
        ) : (
          filteredPOs.map((po) => {
            const isDownloading = downloadingId === po._id;
            const isUpdating = updatingId === po._id;

            return (
              <div
                key={po._id}
                className="bg-slate-850 border border-slate-750 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">{po.poNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            po.status === 'RECEIVED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : po.status === 'APPROVED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : po.status === 'DRAFT'
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Supplier: <strong className="text-slate-300">{po.supplier?.name}</strong> • Target: {po.targetWarehouse?.name} ({po.targetWarehouse?.code})
                      </p>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2">
                    {/* PDF Download Streaming Button */}
                    <button
                      onClick={() => handleDownloadPdf(po)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      title="Download PDF generated via PDFKit"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>Download PDF</span>
                    </button>

                    {/* Status Workflow Action */}
                    {isManager && po.status === 'DRAFT' && (
                      <button
                        onClick={() => handleUpdateStatus(po._id, 'APPROVED')}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve PO</span>
                      </button>
                    )}

                    {isManager && po.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(po._id, 'RECEIVED')}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer"
                        title="Receive goods & automatically increment stock"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Receive Goods</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Items preview */}
                <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Items in Order</span>
                    <span className="font-semibold text-slate-200">{po.items?.length || 0} line items</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Expected Delivery</span>
                    <span className="font-semibold text-slate-200">
                      {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Payment Terms</span>
                    <span className="font-semibold text-slate-200">{po.paymentTerms || 'Net 30'}</span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-slate-500 text-[11px] block">Total Amount</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      ${Number(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create PO Modal */}
      <CreatePoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        products={products}
        warehouses={warehouses}
        onSuccess={onRefresh}
      />
    </div>
  );
};
