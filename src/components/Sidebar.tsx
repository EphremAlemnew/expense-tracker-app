import { useState } from "react";
import { LayoutDashboard, Receipt, Target, CalendarDays, Wallet, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export type TabType = "dashboard" | "transactions" | "budgets" | "subscriptions";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isDarkMode, setIsDarkMode }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions" as TabType, label: "Transactions", icon: Receipt },
    { id: "budgets" as TabType, label: "Budgets", icon: Target },
    { id: "subscriptions" as TabType, label: "Subscriptions", icon: CalendarDays },
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
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
              <span className="font-black text-xl tracking-tight leading-none bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-300 bg-clip-text text-transparent">
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
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
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
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-semibold text-zinc-400">Appearance</span>
            <ThemeToggle isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center font-extrabold text-sm border border-violet-200/20">
              E
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                Ephrem Alemnew
              </p>
              <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
                Premium User
              </p>
            </div>
          </div>
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
