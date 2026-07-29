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
}

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { id: "food", label: "Food & Dining", color: "#ef4444", iconName: "Utensils" },
  { id: "shopping", label: "Shopping", color: "#f97316", iconName: "ShoppingBag" },
  { id: "utilities", label: "Rent & Utilities", color: "#3b82f6", iconName: "Home" },
  { id: "entertainment", label: "Entertainment", color: "#a855f7", iconName: "Gamepad2" },
  { id: "transport", label: "Transport & Travel", color: "#14b8a6", iconName: "Car" },
  { id: "health", label: "Health & Wellness", color: "#ec4899", iconName: "Activity" },
  { id: "misc", label: "Miscellaneous", color: "#6b7280", iconName: "HelpCircle" },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { id: "salary", label: "Salary & Wages", color: "#10b981", iconName: "Briefcase" },
  { id: "freelance", label: "Freelance/Side Hustle", color: "#6366f1", iconName: "Laptop" },
  { id: "investment", label: "Investments", color: "#84cc16", iconName: "TrendingUp" },
  { id: "gift", label: "Gifts & Others", color: "#f43f5e", iconName: "Gift" },
];

export function getCategoryInfo(categoryId: string, type: "income" | "expense" = "expense"): CategoryInfo {
  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  return categories.find((c) => c.id === categoryId) || {
    id: "other",
    label: "Other",
    color: "#9ca3af",
    iconName: "HelpCircle",
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function exportToCSV(transactions: Transaction[]) {
  if (transactions.length === 0) return;

  const headers = ["Date", "Title", "Type", "Category", "Amount ($)", "Notes"];
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
