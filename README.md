# Enterprise Multi-Location Inventory & Supply Chain Management System

A full-stack, enterprise-grade Multi-Location Inventory and Supply Chain Management platform built with Node.js, Express, MongoDB (Mongoose with ACID Transactions), React, Vite, Tailwind CSS, and PDFKit.

---

## 🏛 System Architecture & Highlights

```
                       ┌────────────────────────────────────────┐
                       │          React + Vite + Tailwind       │
                       │   (Lucide Icons, Recharts, Axios)      │
                       └───────────────────┬────────────────────┘
                                           │ HTTP / REST APIs
                                           ▼
                       ┌────────────────────────────────────────┐
                       │          Express.js REST API           │
                       │   (JWT Auth, RBAC: Admin/Mgr/Clerk)    │
                       └─────┬──────────────┬──────────────┬────┘
                             │              │              │
              ┌──────────────┴────┐  ┌──────┴──────┐  ┌────┴─────────────┐
              │ Controllers       │  │ PDF Engine  │  │ ACID Transfers   │
              │ (Auth, Inventory, │  │ (PDFKit)    │  │ (Mongoose        │
              │  POs, Analytics)  │  │             │  │  Transactions)   │
              └──────────────┬────┘  └─────────────┘  └────┬─────────────┘
                             │                             │
                             ▼                             ▼
                       ┌────────────────────────────────────────┐
                       │           MongoDB / Mongoose           │
                       │ (Users, Products, Warehouses, Stock,   │
                       │  Transactions, PurchaseOrders)         │
                       └────────────────────────────────────────┘
```

- **ACID-Guaranteed Inter-Warehouse Transfers**: Stock moves use Mongoose session transactions with balance verification and audit trails to eliminate stock drift.
- **Dynamic PDF Generation**: High-performance streaming Purchase Orders with corporate styling directly from `pdfkit` (`/api/reports/po/:id/pdf`).
- **Role-Based Access Control (RBAC)**: Supports `Admin`, `Manager`, and `Clerk` with live in-app switcher.
- **Zero-Config Database Engine**: Automatically connects to local/remote MongoDB or launches embedded MongoMemoryServer.
- **Low-Stock Alerting**: Highlighting with real-time threshold monitoring and notification bell.
- **Analytics Dashboard**: Multi-facility stock metrics, category share (Recharts), and real-time activity stream.

---

## 🚀 Quick Start Guide

### 1. Start Backend API
```bash
cd backend
npm install
npm run dev
```
*API runs on `http://localhost:5000` with automated health check at `http://localhost:5000/api/health`.*

### 2. Start Frontend UI
```bash
cd frontend
npm install
npm run dev
```
*Vite Dev Server runs on `http://localhost:5173`.*

---

## 👥 Demo User Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@apex.com` | `password123` | Full access, PO approvals, facility creation, user management |
| **Manager** | `manager@apex.com` | `password123` | Inter-warehouse transfers, stock adjustments, PO generation |
| **Clerk** | `clerk@apex.com` | `password123` | Inventory viewing, cycle count updates |

*(Use the live Role Switcher dropdown in the top navigation bar to test RBAC dynamics in real-time.)*

---

## 📡 REST API Summary

- `POST /api/auth/login` - Authenticate user & issue JWT
- `GET /api/inventory/stock` - Retrieve multi-location stock balances with filters
- `POST /api/inventory/stock/adjust` - Manual stock cycle count adjustment
- `POST /api/transfers` - Execute ACID inter-warehouse inventory transfer
- `GET /api/transfers` - Retrieve transfer audit logs
- `GET /api/purchase-orders` - List purchase orders
- `POST /api/purchase-orders` - Create new purchase order
- `PATCH /api/purchase-orders/:id/status` - Update PO status (auto-credits stock on `RECEIVED`)
- `GET /api/reports/po/:id/pdf` - Stream Purchase Order PDF via `pdfkit`
- `GET /api/analytics/dashboard` - Dashboard KPIs, warehouse distribution, and low-stock alerts
