import { useState, useEffect } from "react";
import { Sidebar, type TabType } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { TransactionsList } from "./components/TransactionsList";
import { BudgetsManager } from "./components/BudgetsManager";
import { Subscriptions } from "./components/Subscriptions";
import { TransactionModal } from "./components/TransactionModal";
import type { Transaction, Budget, Subscription } from "./utils/financeUtils";

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "t1", title: "Monthly Salary", amount: 4800, type: "income", category: "salary", date: "2026-07-01", notes: "Main salary payment" },
  { id: "t2", title: "Monthly Home Rent", amount: 1200, type: "expense", category: "utilities", date: "2026-07-02", notes: "Apartment rental" },
  { id: "t3", title: "Weekly Groceries", amount: 165.4, type: "expense", category: "food", date: "2026-07-05" },
  { id: "t4", title: "Website Design Project", amount: 650, type: "income", category: "freelance", date: "2026-07-10", notes: "Logo & Landing page deliverable" },
  { id: "t5", title: "Gym Membership", amount: 60, type: "expense", category: "health", date: "2026-07-12", notes: "Auto-recurring payment" },
  { id: "t6", title: "Steakhouse Dinner", amount: 84.5, type: "expense", category: "food", date: "2026-07-15" },
  { id: "t7", title: "Summer Shoes", amount: 110, type: "expense", category: "shopping", date: "2026-07-18" },
  { id: "t8", title: "Electric & Water Bill", amount: 145, type: "expense", category: "utilities", date: "2026-07-22" },
  { id: "t9", title: "Concert Ticket", amount: 75, type: "expense", category: "entertainment", date: "2026-07-25", notes: "Live band gig" },
  { id: "t10", title: "Uber Cab Ride", amount: 24, type: "expense", category: "transport", date: "2026-07-28" },
];

const MOCK_BUDGETS: Budget[] = [
  { category: "food", limit: 300 },
  { category: "entertainment", limit: 100 },
  { category: "utilities", limit: 1400 },
];

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: "s1", title: "Netflix Premium", amount: 15.99, dueDate: 10, category: "entertainment" },
  { id: "s2", title: "Spotify Family", amount: 16.99, dueDate: 15, category: "entertainment" },
  { id: "s3", title: "Rent Utilities", amount: 145, dueDate: 22, category: "utilities" },
  { id: "s4", title: "Gym Membership", amount: 60, dueDate: 12, category: "health" },
];

export default function App() {
  // 1. Core States
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("fortuna_transactions");
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("fortuna_budgets");
    return saved ? JSON.parse(saved) : MOCK_BUDGETS;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem("fortuna_subscriptions");
    return saved ? JSON.parse(saved) : MOCK_SUBSCRIPTIONS;
  });

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("fortuna_dark_mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 2. Local Storage Synchronizations
  useEffect(() => {
    localStorage.setItem("fortuna_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("fortuna_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("fortuna_subscriptions", JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem("fortuna_dark_mode", String(isDarkMode));
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // 3. Handlers
  const handleSaveTransaction = (transactionData: Omit<Transaction, "id"> & { id?: string }) => {
    if (transactionData.id) {
      // Editing Mode
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionData.id ? (transactionData as Transaction) : t)),
      );
    } else {
      // Create Mode
      const newTransaction: Transaction = {
        ...transactionData,
        id: Math.random().toString(36).substring(2, 9),
      };
      setTransactions((prev) => [newTransaction, ...prev]);
    }
    setEditingTransaction(null);
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction record?")) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleClearAllTransactions = () => {
    if (confirm("Are you sure you want to clear the entire ledger? This action is irreversible.")) {
      setTransactions([]);
    }
  };

  const handleSaveBudget = (budget: Budget) => {
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category === budget.category);
      if (idx > -1) {
        return prev.map((b, i) => (i === idx ? budget : b));
      } else {
        return [...prev, budget];
      }
    });
  };

  const handleRemoveBudget = (category: string) => {
    if (confirm("Are you sure you want to delete the budget limit for this category?")) {
      setBudgets((prev) => prev.filter((b) => b.category !== category));
    }
  };

  const handleSaveSubscription = (sub: Subscription) => {
    setSubscriptions((prev) => [...prev, sub]);
  };

  const handleRemoveSubscription = (id: string) => {
    if (confirm("Are you sure you want to delete this subscription track?")) {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Navigates tabs dynamically from components
  const handleTabNavigation = (tab: "transactions" | "budgets") => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#070709] text-zinc-950 dark:text-zinc-50 flex flex-col lg:flex-row transition-colors duration-300">
      {/* Navigation panel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Main Panel Viewport */}
      <main className="flex-1 p-6 md:p-10 pt-24 lg:pt-10 max-w-[1200px] mx-auto w-full">
        {activeTab === "dashboard" && (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            onNavigateToTab={handleTabNavigation}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsList
            transactions={transactions}
            onAddClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteTransaction}
            onClearAll={handleClearAllTransactions}
          />
        )}

        {activeTab === "budgets" && (
          <BudgetsManager
            budgets={budgets}
            transactions={transactions}
            onSaveBudget={handleSaveBudget}
            onRemoveBudget={handleRemoveBudget}
          />
        )}

        {activeTab === "subscriptions" && (
          <Subscriptions
            subscriptions={subscriptions}
            onSaveSubscription={handleSaveSubscription}
            onRemoveSubscription={handleRemoveSubscription}
          />
        )}
      </main>

      {/* Form Dialog Modal Overlay */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
