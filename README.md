# Fortuna - Premium Expense Auditor & Ethiopian Tax Calculator

**Fortuna** is a premium, offline-first dashboard for financial tracking, budget enforcement, and tax calculations. Built with a modern glassmorphic interface, it integrates custom **shadcn-compatible UI primitives** (Radix UI), **Apache ECharts** for analytics, and a resilient **Node.js/Express backend** featuring automatic **LocalStorage fallbacks** when offline.

---

## 🚀 Key Features

### 📊 1. Financial Dashboard
- **Aggregate Metrics**: Real-time balance calculations, total income, and total expenses.
- **Weekly Trend**: Area/Line graphs detailing active spending trends via ECharts.
- **Expense Allocation**: Interactive doughnut charts for category breakdowns.
- **Budget Alerts**: Visual notification cards when category limits reach 80% (Warning) or 100%+ (Exceeded).
- **Recent Ledger**: Overview of the latest logged transactions.

### 🧾 2. Ledger & Transaction Manager
- **CRUD Operations**: Log, update, or remove entries (Title, Amount, Date, Type, Category, and Notes).
- **Advanced Filtering**: Search queries, type selector, and category tags.
- **Header Sorting**: Order ledger records by Date or Amount.
- **CSV Exporter**: Generates formatted logs for instant spreadsheet imports.
- **Data Flush**: Clear ledger actions.
- **Mobile Responsive**: Dynamically switches from wide tables to card lists on mobile screens.

### 🎯 3. Budget Limits & Dynamic Categories
- Allocate monthly thresholds for specific expense categories.
- Tracks real-time spending progress with color-coded safety meters (Green -> Amber -> Red).
- **Custom Categories Builder**: Create custom expense and income categories with specific labels and color presets dynamically.

### 🗓️ 4. Recurring Bills & Subscriptions
- Logs recurring monthly commitments (SaaS, Gym memberships, rent, utility bills).
- Visual countdown badges indicating payment urgency (Due Today, Due Tomorrow, In X days).

### 🇪🇹 5. Ethiopian Income Tax Calculator
- **Schedule A Compliance (Proclamation No. 1395/2025)**:
  - **Employee Pension**: 7% Basic Salary (exempted from taxable income).
  - **Transport Allowance Exemption**: Automatically deducts exempt portion (up to 600 ETB or 1/4 of basic salary, whichever is lower) before tax calculations.
  - **Tax Bracket Breakdowns**: Precise calculations displaying exact brackets and deductions (15% to 35%).
- **Interactive Graphs**: Visualizes Gross Salary distribution (Net Take-home, Tax, Pension) in real-time.
- **Integration**: Instant button to log Net Pay directly into your main transactions ledger.
  - *Note: Converts ETB salary to USD using a standard exchange rate (1 USD = 120 ETB) if your profile currency is set to USD.*
- **History Logs**: Save past calculation sheets to an audit history.

---

## 🔒 Authentication & Public Access

- **Public Access**: The **Tax Calculator** is fully operational without authentication. Users can compute monthly salaries, analyze breakdowns, and view histories.
- **Protected Access**: The Dashboard, Ledger, Budgets, and Subscriptions views require logging in.
- **Default Credentials**:
  - **Username**: `ephrem`
  - **Password**: `password123`
  - *Note: Login endpoint `/api/login` will fall back to local validation if the server is offline.*

---

## 💵 Currency Settings
- Supports **USD ($)** and **ETB (Br)**.
- Can be switched instantly from the Sidebar footer.
- Adapts all visual stats, graphs, transaction amounts, budgets, and countdown details dynamically.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4.0, Radix UI Primitives (shadcn UI), Lucide Icons, Apache ECharts.
- **Backend**: Node.js, Express, ES Modules, JSON file-based database for simple deployment.
- **Resilience**: Operates in "Syncing" mode when connected to the server, and automatically fails over to "Offline" mode (utilizing `localStorage` and syncing changes locally) if the server becomes unreachable.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm package manager

### 1. Run the Backend Server
```bash
# Navigate to the server folder
cd server

# Install dependencies (express, cors, nodemon)
npm install

# Start the dev server (runs on port 3001)
npm run dev
```

### 2. Run the Frontend App
Open a new terminal window at the project root (`/expense-tracker`):
```bash
# Install packages (radix-ui, echarts, tailwindcss, lucide-react)
npm install

# Start the Vite dev server (runs on port 5173 by default)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ⚖️ Ethiopian Employment Income Tax Brackets (Proclamation 1395/2025)

| Taxable Income Bracket (ETB) | Tax Rate | Deductible Amount (ETB) |
| :--- | :--- | :--- |
| 0 - 2,000 | 0% | 0 |
| 2,001 - 4,000 | 15% | 300 |
| 4,001 - 7,000 | 20% | 500 |
| 7,001 - 10,000 | 25% | 850 |
| 10,001 - 14,000 | 30% | 1,350 |
| Above 14,000 | 35% | 2,050 |
