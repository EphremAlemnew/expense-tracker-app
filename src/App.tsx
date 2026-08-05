import { useState, useEffect } from "react";
import { Sidebar, type TabType } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { TransactionsList } from "./components/TransactionsList";
import { BudgetsManager } from "./components/BudgetsManager";
import { Subscriptions } from "./components/Subscriptions";
import { TransactionModal } from "./components/TransactionModal";
import { Login } from "./components/Login";
import { Toast } from "./components/ui/toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "./components/ui/alert-dialog";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  type Transaction,
  type Budget,
  type Subscription,
  type CategoryInfo,
} from "./utils/financeUtils";

export default function App() {
  // 1. Authentication State
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem("fortuna_user");
  });

  // Default tab selection shifts dynamically if unauthenticated
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedUser = localStorage.getItem("fortuna_user");
    return savedUser ? "dashboard" : "login";
  });

  // 2. Core Ledger & Analytics States (Initialized from LocalStorage with no mock data fallback)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("fortuna_transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("fortuna_budgets");
    return saved ? JSON.parse(saved) : [];
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem("fortuna_subscriptions");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    const saved = localStorage.getItem("fortuna_categories");
    if (saved) return JSON.parse(saved);
    return [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
  });

  const [currency, setCurrency] = useState<"USD" | "ETB">(() => {
    const saved = localStorage.getItem("fortuna_currency");
    return (saved === "USD" || saved === "ETB") ? saved : "USD";
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Success Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Custom Alert Dialog confirmation state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("fortuna_dark_mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Helper trigger to display toast
  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
  };

  // Helper trigger to open Alert Dialog
  const triggerConfirm = (title: string, description: string, onConfirm: () => void, actionText: string = "Proceed") => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      actionText,
      onConfirm,
    });
  };

  // 3. Real-time synchronization across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fortuna_transactions") {
        setTransactions(e.newValue ? JSON.parse(e.newValue) : []);
      } else if (e.key === "fortuna_budgets") {
        setBudgets(e.newValue ? JSON.parse(e.newValue) : []);
      } else if (e.key === "fortuna_subscriptions") {
        setSubscriptions(e.newValue ? JSON.parse(e.newValue) : []);
      } else if (e.key === "fortuna_categories") {
        setCategories(e.newValue ? JSON.parse(e.newValue) : [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]);
      } else if (e.key === "fortuna_user") {
        setUser(e.newValue);
        if (!e.newValue && activeTab !== "login") {
          setActiveTab("login");
        } else if (e.newValue && activeTab === "login") {
          setActiveTab("dashboard");
        }
      } else if (e.key === "fortuna_currency") {
        setCurrency((e.newValue === "USD" || e.newValue === "ETB") ? e.newValue : "USD");
      } else if (e.key === "fortuna_dark_mode" && e.newValue) {
        setIsDarkMode(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [activeTab]);

  // Theme effect
  useEffect(() => {
    localStorage.setItem("fortuna_dark_mode", String(isDarkMode));
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Save currency to storage
  useEffect(() => {
    localStorage.setItem("fortuna_currency", currency);
  }, [currency]);

  // 4. Handlers
  const handleSaveTransaction = (transactionData: Omit<Transaction, "id"> & { id?: string }) => {
    let savedTx = { ...transactionData };
    const isEdit = !!transactionData.id;
    if (!savedTx.id) {
      savedTx.id = Math.random().toString(36).substring(2, 9);
    }
    
    const updatedTransactions = transactionData.id
      ? transactions.map((t) => (t.id === transactionData.id ? (savedTx as Transaction) : t))
      : [savedTx as Transaction, ...transactions];
      
    setTransactions(updatedTransactions);
    localStorage.setItem("fortuna_transactions", JSON.stringify(updatedTransactions));
    
    setEditingTransaction(null);
    showToast(isEdit ? "Transaction updated successfully!" : "Transaction added successfully!", "success");
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    triggerConfirm(
      "Delete Transaction Record",
      "Are you sure you want to delete this transaction from your ledger? This action is irreversible.",
      () => {
        const updated = transactions.filter((t) => t.id !== id);
        setTransactions(updated);
        localStorage.setItem("fortuna_transactions", JSON.stringify(updated));
        showToast("Transaction deleted successfully.", "success");
      },
      "Delete"
    );
  };

  const handleClearAllTransactions = () => {
    triggerConfirm(
      "Clear Transaction Ledger",
      "Are you sure you want to delete all transaction entries? This will completely empty your audit logs.",
      () => {
        setTransactions([]);
        localStorage.setItem("fortuna_transactions", JSON.stringify([]));
        showToast("Ledger logs cleared successfully.", "success");
      },
      "Clear All"
    );
  };

  const handleSaveBudget = (budget: Budget) => {
    const updated = budgets.some((b) => b.category === budget.category)
      ? budgets.map((b) => (b.category === budget.category ? budget : b))
      : [...budgets, budget];
      
    setBudgets(updated);
    localStorage.setItem("fortuna_budgets", JSON.stringify(updated));
    showToast("Category budget limit saved successfully!", "success");
  };

  const handleRemoveBudget = (category: string) => {
    triggerConfirm(
      "Remove Budget Limit",
      `Are you sure you want to delete the spending limit allocated for category "${category}"?`,
      () => {
        const updated = budgets.filter((b) => b.category !== category);
        setBudgets(updated);
        localStorage.setItem("fortuna_budgets", JSON.stringify(updated));
        showToast("Category budget removed successfully.", "success");
      },
      "Remove Limit"
    );
  };

  const handleSaveSubscription = (sub: Subscription) => {
    const updated = [...subscriptions, sub];
    setSubscriptions(updated);
    localStorage.setItem("fortuna_subscriptions", JSON.stringify(updated));
    showToast("Subscription bill added successfully!", "success");
  };

  const handleRemoveSubscription = (id: string) => {
    triggerConfirm(
      "Cancel Subscription Tracker",
      "Are you sure you want to stop tracking this recurring bill?",
      () => {
        const updated = subscriptions.filter((s) => s.id !== id);
        setSubscriptions(updated);
        localStorage.setItem("fortuna_subscriptions", JSON.stringify(updated));
        showToast("Subscription tracker removed.", "success");
      },
      "Stop Tracking"
    );
  };

  const handleAddCategory = (newCat: CategoryInfo) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    localStorage.setItem("fortuna_categories", JSON.stringify(updated));
    showToast(`Category "${newCat.label}" created successfully!`, "success");
  };

  const handleTabNavigation = (tab: "transactions" | "budgets") => {
    setActiveTab(tab);
  };

  // Auth Controllers
  const handleLoginSuccess = (username: string) => {
    setUser(username);
    localStorage.setItem("fortuna_user", username);
    setActiveTab("dashboard");
    showToast("Welcome back! Signed in successfully.", "success");
  };

  const handleLogout = () => {
    triggerConfirm(
      "Sign Out of Fortuna",
      "Are you sure you want to end your session? This will lock expense tracker access.",
      () => {
        setUser(null);
        localStorage.removeItem("fortuna_user");
        setActiveTab("login");
        showToast("Signed out successfully.", "success");
      },
      "Sign Out"
    );
  };

  // Database Wipe Reset Trigger
  const handleResetDatabase = () => {
    triggerConfirm(
      "Reset App Database",
      "DANGER: Are you sure you want to wipe all transaction entries, budgets, dynamic categories, and tax logs? This will restore original configurations.",
      () => {
        setTransactions([]);
        setBudgets([]);
        setSubscriptions([]);
        setCategories([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]);
        
        localStorage.removeItem("fortuna_transactions");
        localStorage.removeItem("fortuna_budgets");
        localStorage.removeItem("fortuna_subscriptions");
        localStorage.removeItem("fortuna_categories");
        localStorage.removeItem("fortuna_tax_history");
        
        showToast("All databases wiped successfully.", "success");
      },
      "Wipe Everything"
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#070709] text-zinc-950 dark:text-zinc-50 flex flex-col lg:flex-row transition-colors duration-300">
      {/* Navigation panel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={user}
        onLogout={handleLogout}
        currency={currency}
        setCurrency={setCurrency}
        onResetData={handleResetDatabase}
      />

      {/* Main Panel Viewport */}
      <main className="flex-1 p-6 md:p-10 pt-24 lg:pt-10 max-w-[1200px] mx-auto w-full">
        {/* Public Login Tab */}
        {activeTab === "login" && !user && (
          <Login
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* Protected Views (only visible if logged in) */}
        {user && activeTab === "dashboard" && (
          <Dashboard
            transactions={transactions}
            budgets={budgets}
            onNavigateToTab={handleTabNavigation}
            isDarkMode={isDarkMode}
            categories={categories}
            currency={currency}
          />
        )}

        {user && activeTab === "transactions" && (
          <TransactionsList
            transactions={transactions}
            onAddClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteTransaction}
            onClearAll={handleClearAllTransactions}
            categories={categories}
            currency={currency}
          />
        )}

        {user && activeTab === "budgets" && (
          <BudgetsManager
            budgets={budgets}
            transactions={transactions}
            onSaveBudget={handleSaveBudget}
            onRemoveBudget={handleRemoveBudget}
            categories={categories}
            onAddCategory={handleAddCategory}
            currency={currency}
          />
        )}

        {user && activeTab === "subscriptions" && (
          <Subscriptions
            subscriptions={subscriptions}
            onSaveSubscription={handleSaveSubscription}
            onRemoveSubscription={handleRemoveSubscription}
            categories={categories}
            currency={currency}
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
        categories={categories}
      />

      {/* Self-dismissing Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Central Confirmation Alert Dialog */}
      {confirmDialog && (
        <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => { if (!open) setConfirmDialog(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmDialog(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
              >
                {confirmDialog.actionText || "Proceed"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
