import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('scm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const loginApi = (email, password) => API.post('/auth/login', { email, password });
export const getProfileApi = () => API.get('/auth/profile');
export const getUsersApi = () => API.get('/auth/users');

// Inventory & Products
export const getProductsApi = (params) => API.get('/inventory/products', { params });
export const createProductApi = (data) => API.post('/inventory/products', data);
export const updateProductApi = (id, data) => API.put(`/inventory/products/${id}`, data);

// Warehouses
export const getWarehousesApi = () => API.get('/inventory/warehouses');
export const createWarehouseApi = (data) => API.post('/inventory/warehouses', data);

// Stock
export const getStockOverviewApi = (params) => API.get('/inventory/stock', { params });
export const adjustStockApi = (data) => API.post('/inventory/stock/adjust', data);

// Transfers (ACID)
export const executeTransferApi = (data) => API.post('/transfers', data);
export const getTransferHistoryApi = (params) => API.get('/transfers', { params });

// Purchase Orders
export const getPurchaseOrdersApi = (params) => API.get('/purchase-orders', { params });
export const getPurchaseOrderByIdApi = (id) => API.get(`/purchase-orders/${id}`);
export const createPurchaseOrderApi = (data) => API.post('/purchase-orders', data);
export const updatePOStatusApi = (id, status) => API.patch(`/purchase-orders/${id}/status`, { status });

// Analytics
export const getDashboardAnalyticsApi = () => API.get('/analytics/dashboard');

// PDF Report Download
export const downloadPoPdfUrl = (poId) => {
  const token = localStorage.getItem('scm_token');
  return `/api/reports/po/${poId}/pdf${token ? `?token=${token}` : ''}`;
};

export const downloadPoPdfBlob = async (poId, poNumber) => {
  const response = await API.get(`/reports/po/${poId}/pdf`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `PurchaseOrder_${poNumber || poId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default API;
