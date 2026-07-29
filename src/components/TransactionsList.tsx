import { useState, useMemo } from "react";
import { Search, Trash2, Edit3, ArrowUpDown, Download, Trash, Plus, FilterX } from "lucide-react";
import { formatCurrency, getCategoryInfo, exportToCSV, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../utils/financeUtils";
import type { Transaction } from "../utils/financeUtils";

interface TransactionsListProps {
  transactions: Transaction[];
  onAddClick: () => void;
  onEditClick: (transaction: Transaction) => void;
  onDeleteClick: (id: string) => void;
  onClearAll: () => void;
}

type SortField = "date" | "amount";
type SortOrder = "asc" | "desc";

export function TransactionsList({
  transactions,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onClearAll,
}: TransactionsListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Reset category filter if it doesn't belong to the active type
  const handleTypeFilterChange = (val: "all" | "income" | "expense") => {
    setTypeFilter(val);
    setCategoryFilter("all");
  };

  // Available categories for current type filter
  const categoriesList = useMemo(() => {
    if (typeFilter === "expense") return EXPENSE_CATEGORIES;
    if (typeFilter === "income") return INCOME_CATEGORIES;
    return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  }, [typeFilter]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter and Sort Transactions
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // 1. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)),
      );
    }

    // 2. Type Filter
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter);
    }

    // 3. Category Filter
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // 4. Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        comparison = a.amount - b.amount;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortField, sortOrder]);

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setSortField("date");
    setSortOrder("desc");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Transactions Ledger
          </h2>
          <p className="text-sm font-semibold text-zinc-400">
            Audit, filter, and export transaction records
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
          {transactions.length > 0 && (
            <>
              <button
                onClick={() => exportToCSV(transactions)}
                className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors w-full sm:w-auto"
                title="Export transactions list to CSV"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={onClearAll}
                className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-red-200/20 bg-red-500/10 dark:bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/20 dark:hover:bg-red-500/10 transition-colors w-full sm:w-auto"
                title="Delete all transactions"
              >
                <Trash className="h-4 w-4" /> Clear Ledger
              </button>
            </>
          )}
          <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-violet-600 hover:bg-violet-750 text-white text-xs font-semibold shadow-md shadow-violet-500/10 transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="glass-card p-5 rounded-3xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-zinc-900 dark:text-zinc-550 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 appearance-none cursor-pointer"
            >
              <option value="all">Type: All</option>
              <option value="expense">Type: Expense</option>
              <option value="income">Type: Income</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 appearance-none cursor-pointer"
            >
              <option value="all">Category: All</option>
              {categoriesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Helper */}
        {(search || typeFilter !== "all" || categoryFilter !== "all") && (
          <div className="flex justify-end">
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <FilterX className="h-3.5 w-3.5" /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Ledger Records */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
        {processedTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-400 font-bold uppercase tracking-wider select-none">
                  <th 
                    onClick={() => handleSort("date")} 
                    className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors w-[130px]"
                  >
                    <div className="flex items-center gap-1">
                      Date <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th 
                    onClick={() => handleSort("amount")} 
                    className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-right w-[140px]"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Amount <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-4 text-center w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                {processedTransactions.map((t) => {
                  const info = getCategoryInfo(t.category, t.type);
                  return (
                    <tr 
                      key={t.id}
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors align-middle"
                    >
                      <td className="p-4 font-semibold text-zinc-500 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{t.title}</p>
                        {t.notes && <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-xs">{t.notes}</p>}
                      </td>
                      <td className="p-4">
                        <span 
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white uppercase tracking-wider"
                          style={{ backgroundColor: info.color }}
                        >
                          {info.label}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-black text-sm tracking-tight whitespace-nowrap ${
                        t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-800 dark:text-zinc-100"
                      }`}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditClick(t)}
                            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-violet-500 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteClick(t.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-400 font-medium space-y-2">
            <p className="text-sm">No transaction records match the filters</p>
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline uppercase"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
