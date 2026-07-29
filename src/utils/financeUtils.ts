export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Subscription {
  id: string;
  title: string;
  amount: number;
  dueDate: number; // Day of the month (1-31)
  category: string;
}

export interface CategoryInfo {
  id: string;
  label: string;
  color: string; // Hex color for ECharts
  iconName: string;
  type: "income" | "expense";
}

export const DEFAULT_EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: "food", label: "Food & Dining", color: "#ef4444", iconName: "Utensils", type: "expense" },
  { id: "shopping", label: "Shopping", color: "#f97316", iconName: "ShoppingBag", type: "expense" },
  { id: "utilities", label: "Rent & Utilities", color: "#3b82f6", iconName: "Home", type: "expense" },
  { id: "entertainment", label: "Entertainment", color: "#a855f7", iconName: "Gamepad2", type: "expense" },
  { id: "transport", label: "Transport & Travel", color: "#14b8a6", iconName: "Car", type: "expense" },
  { id: "health", label: "Health & Wellness", color: "#ec4899", iconName: "Activity", type: "expense" },
  { id: "misc", label: "Miscellaneous", color: "#6b7280", iconName: "HelpCircle", type: "expense" },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryInfo[] = [
  { id: "salary", label: "Salary & Wages", color: "#10b981", iconName: "Briefcase", type: "income" },
  { id: "freelance", label: "Freelance Work", color: "#6366f1", iconName: "Laptop", type: "income" },
  { id: "investments", label: "Investments", color: "#84cc16", iconName: "TrendingUp", type: "income" },
  { id: "gift", label: "Gifts & Others", color: "#f43f5e", iconName: "Gift", type: "income" },
];

export function getCategoryInfo(
  categoryId: string,
  type: "income" | "expense" = "expense",
  customCategories?: CategoryInfo[]
): CategoryInfo {
  const categories = customCategories || (type === "expense" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES);
  return categories.find((c) => c.id === categoryId) || {
    id: "other",
    label: "Other",
    color: "#9ca3af",
    iconName: "HelpCircle",
    type,
  };
}

export function formatCurrency(amount: number, currency: "USD" | "ETB" = "USD"): string {
  if (currency === "ETB") {
    return `${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} ETB`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function exportToCSV(transactions: Transaction[], currency: "USD" | "ETB" = "USD") {
  if (transactions.length === 0) return;

  const headers = ["Date", "Title", "Type", "Category", `Amount (${currency})`, "Notes"];
  const rows = transactions.map((t) => [
    t.date,
    `"${t.title.replace(/"/g, '""')}"`,
    t.type.toUpperCase(),
    t.category,
    t.amount.toFixed(2),
    t.notes ? `"${t.notes.replace(/"/g, '""')}"` : "",
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Fortuna_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
