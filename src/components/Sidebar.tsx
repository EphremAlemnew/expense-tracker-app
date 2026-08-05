import { useState } from "react";
import { LayoutDashboard, Receipt, Target, CalendarDays, Wallet, Menu, X, Calculator, LogIn, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export type TabType = "dashboard" | "transactions" | "budgets" | "subscriptions" | "tax" | "login";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  user: string | null;
  onLogout: () => void;
  currency: "USD" | "ETB";
  setCurrency: (val: "USD" | "ETB") => void;
  onResetData: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  user,
  onLogout,
  currency,
  setCurrency,
  onResetData,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic Navigation Items based on Login state
  const navItems = user 
    ? [
        { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
        { id: "transactions" as TabType, label: "Transactions", icon: Receipt },
        { id: "budgets" as TabType, label: "Budgets", icon: Target },
        { id: "subscriptions" as TabType, label: "Subscriptions", icon: CalendarDays },
        { id: "tax" as TabType, label: "Tax Calculator", icon: Calculator },
      ]
    : [
        { id: "tax" as TabType, label: "Tax Calculator", icon: Calculator },
        { id: "login" as TabType, label: "Sign In", icon: LogIn },
      ];

  const handleNavClick = (tab: TabType) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header Bar */}
      <header className="lg:hidden w-full h-16 flex items-center justify-between px-4 bg-white dark:bg-[#0c0c12] border-b border-zinc-200/50 dark:border-zinc-800/50 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/20">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 dark:from-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
            Fortuna
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Local DB
          </span>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Container */}
      <aside
        className={`w-64 fixed lg:sticky top-0 bottom-0 left-0 z-40 bg-white dark:bg-[#0c0c12] border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col justify-between p-6 transition-transform duration-300 lg:transform-none lg:h-screen pt-20 lg:pt-6 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-8">
          {/* Logo Section */}
          <div className="hidden lg:flex items-center gap-2.5 px-2">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/10 shrink-0">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight leading-none bg-gradient-to-r from-violet-600 to-indigo-650 dark:from-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Fortuna
              </span>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                Expense Auditor
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-zinc-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Config */}
        <div className="space-y-4 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          {/* Connection Status */}
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-zinc-400">
            <span>Status</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Ready
            </span>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-zinc-400">
            <span>Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "USD" | "ETB")}
              className="h-8 px-2 rounded-lg border border-zinc-205 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="ETB">ETB (Br)</option>
            </select>
          </div>

          {/* Appearance Toggle */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-zinc-400">Appearance</span>
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </div>

          {/* User Profile Info Card */}
          {user ? (
            <div className="flex items-center justify-between px-2 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-extrabold text-sm border border-violet-200/20">
                  {user.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                    {user}
                  </p>
                  <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                    Logged In
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="p-3 text-center bg-zinc-50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                Anonymous Mode
              </p>
              <p className="text-[9px] text-zinc-500 mt-0.5 leading-relaxed">
                Log in to unlock ledger tracking
              </p>
            </div>
          )}

          {/* Reset App Trigger */}
          <button
            onClick={onResetData}
            className="w-full text-center py-2.5 text-[9px] font-black tracking-wider text-red-500 hover:text-white hover:bg-red-650 rounded-xl border border-red-500/10 hover:border-transparent transition-all duration-200 uppercase cursor-pointer"
          >
            Reset Database
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        />
      )}
    </>
  );
}
