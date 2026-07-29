# Fortuna - Premium Expense Auditor & Ethiopian Tax Calculator

**Fortuna** is a premium, offline-first dashboard for financial tracking, budget enforcement, and tax calculations. Built with a modern glassmorphic interface, it integrates custom **shadcn-compatible UI primitives** (Radix UI), **Apache ECharts** for analytics, and a resilient **Node.js/Express backend** featuring automatic **LocalStorage fallbacks** when offline.

It also includes a dedicated **Ethiopian Income Tax Calculator** based on Federal Income Tax Proclamation No. 979/2016 (Schedule A).

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

### 🎯 3. Budget limits Enforcer
- Allocate monthly thresholds for specific expense categories.
- Tracks real-time spending progress with color-coded safety meters:
  - 🟢 **Green**: Under control
  - 🟡 **Amber**: Warning threshold reached (>=80% usage)
  - 🔴 **Red**: Budget overrun (>=100% usage)

### 🗓️ 4. Recurring Bills & Subscriptions
- Logs recurring monthly commitments (SaaS, Gym memberships, rent, utility bills).
- Visual countdown badges indicating payment urgency:
  - 🚨 **Pulsing Red**: "Due Today" (day 0)
  - 🟠 **Orange**: "Due Tomorrow" (day 1)
  - 🟡 **Amber**: "Due in X days" (days 2 to 5)
  - ⚪ **Gray**: "In X days" (days 6+)

### 🇪🇹 5. Ethiopian Income Tax Calculator
- **Schedule A Compliance (Proclamation No. 979/2016)**:
  - **Employee Pension**: 7% Basic Salary (exempted from taxable income).
  - **Transport Allowance Exemption**: Automatically deducts exempt portion (up to 600 ETB or 1/4 of basic salary, whichever is lower) before tax calculations.
  - **Tax Bracket Breakdowns**: Precise calculations displaying exact brackets and deductions (10% to 35%).
- **Interactive Graphs**: Visualizes Gross Salary distribution (Net Take-home, Tax, Pension) in real-time.
- **Integration**: Instant button to log Net Pay directly into your main transactions ledger.
- **History Logs**: Save past calculation sheets to an audit history.

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

## ⚖️ Ethiopian Employment Income Tax Brackets (Proclamation 979/2016)

| Taxable Income Bracket (ETB) | Tax Rate | Deductible Amount (ETB) |
| :--- | :--- | :--- |
| 0 - 600 | 0% | 0 |
| 601 - 1,650 | 10% | 60 |
| 1,651 - 3,200 | 15% | 142.50 |
| 3,201 - 5,250 | 20% | 302.50 |
| 5,251 - 7,800 | 25% | 565 |
| 7,801 - 10,900 | 30% | 955 |
| Above 10,900 | 35% | 1,500 |
