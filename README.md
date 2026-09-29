<div align="center">

<img src="https://img.shields.io/badge/JB%20Cafe-Management%20System-D97706?style=for-the-badge&logo=coffeescript&logoColor=white" alt="JB Cafe" height="50" />

<h1>☕ JB Cafe — Staff Management System</h1>

<p>A real-time, role-based café management platform built for the JB Cafe team.<br/>Manage orders, kitchen display, tables, stock, staff salaries, and more — all in one place.</p>

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-jb--cafe.vercel.app-D97706?style=flat-square)](https://jb-cafe.vercel.app)
[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)

</div>

---

## 📖 Overview

**JB Cafe Management System** is a full-stack Progressive Web App designed for day-to-day café operations. Every role — Admin, Waiter, and Cook — gets a tailored dashboard with real-time data sync powered by Firebase Firestore.

No more paper order slips, no more shouting across the kitchen. Everything is live, connected, and accessible from any device.

---

## 🎯 Key Features

### 👨‍🍳 Kitchen Display System (KDS)
- Live order tickets streamed in real-time
- Status tabs: **New → Preparing → Ready → Completed**
- Batch-aware additions (Addition 1, 2, 3…)
- One-tap **Mark Ready** to alert the waiter

### 🧑‍💼 Waiter Dashboard
- Table grid with live status badges (Available / Preparing / Ready to Serve / Served)
- Quick order taking with a menu picker
- Add items to existing in-progress orders
- Serve orders & collect payment (Cash / UPI / Card)

### 🛠️ Admin Panel
| Module | Capabilities |
|---|---|
| **Orders** | Full audit log, date-range filter, status filter, per-order detail modal |
| **Sales** | Daily/weekly/monthly revenue breakdown |
| **Expenses** | Track & categorize all café expenses |
| **Stock** | Inventory levels, low-stock alerts, usage logs |
| **Menu** | Add/edit items, toggle availability |
| **Tables** | Add/edit tables, view floor plan |
| **Staff Salary** | Upaad (advance) tracking, monthly salary settlement |
| **Users** | Manage staff accounts & roles |
| **Reports** | Business performance insights |

### 🔐 Authentication & Sessions
- Firebase Email/Password auth
- Persistent login — no need to log in again after refresh
- Role-based routing: each user sees only their dashboard
- Auth loading state prevents any login page flash on refresh

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 5.8 |
| **Styling** | Tailwind CSS 4.x, Vanilla CSS |
| **Icons** | Lucide React |
| **Build Tool** | Vite 6 |
| **Database** | Firebase Firestore (real-time sync) |
| **Auth** | Firebase Authentication |
| **Hosting** | Vercel |

---

## 👥 User Roles

| Role | Access |
|---|---|
| `admin` | Full access — all modules, reports, settings |
| `cook` | Kitchen Display System only |
| `waiter` | Table management, order taking, serving, payment |
| `others` | Limited / no dashboard (configurable) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ 
- A **Firebase project** with Firestore and Authentication enabled

### 1. Clone the repository
```bash
git clone https://github.com/jbcafe001/JB_Cafe.git
cd JB_Cafe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> [!NOTE]
> Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Run locally
```bash
npm run dev
```
App will be available at **http://localhost:3000**

### 5. Build for production
```bash
npm run build
```

---

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project.
2. Enable **Authentication** → Email/Password sign-in.
3. Enable **Firestore Database** in production mode.
4. Add the following Firestore **collections** (they are created automatically on first use):
   - `users` · `orders` · `tables` · `menuItems`
   - `stockItems` · `stockAdditions` · `materialUsageLogs`
   - `expenses` · `staffMembers` · `upaadRecords` · `salaryHistory` · `notifications`
5. Use the **"Initialize Demo Users (Admin)"** button on the login page to seed default staff accounts.

### Default Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@cafe.com` | `password123` |
| Cook | `cook@cafe.com` | `password123` |
| Waiter | `waiter@cafe.com` | `password123` |

> [!CAUTION]
> Change all demo passwords before deploying to production.

---

## 📁 Project Structure

```
JB_Cafe/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin panel modules
│   │   ├── auth/           # Login view
│   │   ├── common/         # Shared UI (modals, toasts)
│   │   ├── kitchen/        # KDS — Kitchen Display System
│   │   └── waiter/         # Waiter dashboard & order flow
│   ├── context/
│   │   └── CafeContext.tsx # Global state, Firebase sync, all actions
│   ├── data/
│   │   └── initialData.ts  # Seed data for demo users
│   ├── services/
│   │   └── auth.ts         # Firebase auth helpers
│   ├── firebase.ts         # Firebase app initialization
│   ├── types.ts            # TypeScript types & interfaces
│   └── App.tsx             # Root router (role-based)
├── .env                    # Firebase credentials (not committed)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔄 Order Lifecycle

```
New Order Created
       │
       ▼
  [NEW] ──── Kitchen sees it
       │
       ▼
  [PREPARING] ──── KDS: "Start Preparing" clicked
       │           Table badge updates on Waiter side
       ▼
  [READY] ──── KDS: "Mark Ready" clicked
       │        Waiter gets notified
       ▼
  [SERVED] ──── Waiter confirms food delivered
       │
       ▼
  [COMPLETED] ──── Payment collected, table freed, stock auto-deducted
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | TypeScript type-check |

---

## 🏢 About

Developed as part of an internship at **DZ Infotech** for the **JB Cafe** client.

Built with ❤️ using React, Firebase, and Tailwind CSS.