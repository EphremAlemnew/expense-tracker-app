import { useState, useMemo, useEffect } from "react";
import { Target, Trash2, Plus, ShieldAlert, AlertCircle, Tag, Pencil, X, Save } from "lucide-react";
import { formatCurrency, getCategoryInfo } from "../utils/financeUtils";
import type { Budget, Transaction, CategoryInfo } from "../utils/financeUtils";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";

interface BudgetsManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onSaveBudget: (budget: Budget) => void;
  onRemoveBudget: (category: string) => void;
  categories: CategoryInfo[];
  onAddCategory: (category: CategoryInfo) => void;
  currency: "USD" | "ETB";
}

const PRESET_COLORS = [
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#a855f7", // Purple
  "#eab308", // Yellow
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#64748b", // Slate
];

export function BudgetsManager({
  budgets,
  transactions,
  onSaveBudget,
  onRemoveBudget,
  categories,
  onAddCategory,
  currency,
}: BudgetsManagerProps) {
  // Budget Form
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [budgetError, setBudgetError] = useState("");
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Category Form
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [catError, setCatError] = useState("");

  // Calculate actual spending per category
  const expenseMap = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  // Aggregate budgets details with current spent calculations
  const budgetList = useMemo(() => {
    return budgets.map((b) => {
      const spent = expenseMap[b.category] || 0;
      const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      const catInfo = getCategoryInfo(b.category, "expense", categories);

      return {
        ...b,
        spent,
        percent: pct,
        label: catInfo.label,
        color: catInfo.color,
      };
    });
  }, [budgets, expenseMap, categories]);

  // Exclude categories that already have budgets configured
  const availableCategories = useMemo(() => {
    const configured = new Set(budgets.map((b) => b.category));
    const expenseCats = categories.filter((c) => c.type === "expense");
    return expenseCats.filter(
      (cat) => !configured.has(cat.id) || (editingBudget && cat.id === editingBudget.category)
    );
  }, [budgets, categories, editingBudget]);

  // Update default category when budget list changes
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.some((c) => c.id === budgetCategory)) {
      setBudgetCategory(availableCategories[0].id);
    }
  }, [availableCategories, budgetCategory]);

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetCategory(budget.category);
    setBudgetLimit(String(budget.limit));
    setBudgetError("");
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setBudgetLimit("");
    setBudgetError("");
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetError("");

    if (!budgetCategory) {
      setBudgetError("Please select a category");
      return;
    }
    if (!budgetLimit.trim() || isNaN(Number(budgetLimit)) || Number(budgetLimit) <= 0) {
      setBudgetError("Please enter a valid monthly limit");
      return;
    }

    onSaveBudget({
      category: budgetCategory,
      limit: parseFloat(budgetLimit),
    });

    setBudgetLimit("");
    setEditingBudget(null);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError("");

    if (!newCatLabel.trim()) {
      setCatError("Category label is required");
      return;
    }

    const catId = newCatLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    // Check for duplicate ID
    if (categories.some((c) => c.id === catId)) {
      setCatError("A category with a similar name already exists");
      return;
    }

    onAddCategory({
      id: catId,
      label: newCatLabel.trim(),
      color: newCatColor,
      iconName: newCatType === "expense" ? "Tag" : "TrendingUp",
      type: newCatType,
    });

    setNewCatLabel("");
    alert(`Category "${newCatLabel.trim()}" created successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Budgets & Categories
        </h2>
        <p className="text-sm font-semibold text-zinc-400">
          Enforce monthly boundaries and manage custom expense types
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Hand side configuration cards */}
        <div className="space-y-6 lg:col-span-1">
          {/* Budget Config Form Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-violet-500" /> {editingBudget ? "Edit Budget Limit" : "Allocate Budget"}
              </h3>
              
              {availableCategories.length > 0 || editingBudget ? (
                <form onSubmit={handleBudgetSubmit} className="space-y-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <Label htmlFor="b-cat">Category</Label>
                    <select
                      id="b-cat"
                      value={budgetCategory}
                      onChange={(e) => setBudgetCategory(e.target.value)}
                      disabled={!!editingBudget}
                      className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {availableCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Monthly Limit */}
                  <div className="space-y-1.5">
                    <Label htmlFor="b-limit">Monthly Limit</Label>
                    <Input
                      id="b-limit"
                      type="text"
                      placeholder="e.g. 500"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                    />
                  </div>

                  {budgetError && <p className="text-xs text-red-500 font-semibold">{budgetError}</p>}

                  <div className="flex gap-2">
                    {editingBudget && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-1/2">
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                    )}
                    <Button type="submit" className={editingBudget ? "w-1/2" : "w-full"}>
                      {editingBudget ? (
                        <>
                          <Save className="h-4 w-4 mr-1" /> Save
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" /> Create Budget
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 text-center border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl text-zinc-400 text-xs font-medium">
                  All categories already have budgets allocated.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic Categories Builder Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-violet-500" /> Create Custom Category
              </h3>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                {/* Category Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="c-name">Category Name</Label>
                  <Input
                    id="c-name"
                    type="text"
                    placeholder="e.g. Subscriptions, Gifts"
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                  />
                </div>

                {/* Category Type */}
                <div className="space-y-1.5">
                  <Label htmlFor="c-type">Type</Label>
                  <select
                    id="c-type"
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as "expense" | "income")}
                    className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer appearance-none"
                  >
                    <option value="expense">Expense Type</option>
                    <option value="income">Income Type</option>
                  </select>
                </div>

                {/* Color Selector dots */}
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewCatColor(col)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 ${
                          newCatColor === col 
                            ? "border-zinc-900 dark:border-white scale-110 shadow-sm" 
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>

                {catError && <p className="text-xs text-red-500 font-semibold">{catError}</p>}

                <Button type="submit" variant="outline" className="w-full h-10 text-xs">
                  <Plus className="h-4 w-4 mr-1" /> Add Category
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Budgets Progress Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Allocated Budgets
              </h3>

              {budgetList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {budgetList.map((b) => {
                    const isExceeded = b.percent >= 100;
                    const isWarning = b.percent >= 80 && b.percent < 100;
                    const isEditing = editingBudget?.category === b.category;
                    
                    return (
                      <div 
                        key={b.category} 
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
                          isEditing
                            ? "border-violet-500 bg-violet-550/5 dark:bg-violet-550/10"
                            : isExceeded 
                              ? "bg-red-500/5 border-red-500/30" 
                              : isWarning 
                                ? "bg-amber-500/5 border-amber-500/30" 
                                : "bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3.5 h-3.5 rounded-full shrink-0"
                              style={{ backgroundColor: b.color }}
                            />
                            <span className="font-bold text-sm text-zinc-850 dark:text-zinc-150">
                              {b.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => handleEditClick(b)}
                              variant="ghost"
                              size="icon"
                              className={`h-8 w-8 rounded-lg transition-colors ${
                                isEditing
                                  ? "text-violet-500 hover:bg-violet-500/10 bg-violet-500/10"
                                  : "text-zinc-400 hover:text-violet-500 hover:bg-violet-500/10 dark:text-zinc-500"
                              }`}
                              title="Edit budget limit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              onClick={() => onRemoveBudget(b.category)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-550 hover:bg-red-500/10 dark:text-zinc-500"
                              title="Delete budget limit"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-500">Progress</span>
                            <span className={isExceeded ? "text-red-500 font-bold" : isWarning ? "text-amber-500 font-bold" : "text-zinc-750 dark:text-zinc-300"}>
                              {formatCurrency(b.spent, currency)} / {formatCurrency(b.limit, currency)}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <Progress
                            value={Math.min(b.percent, 100)}
                            indicatorClassName={
                              isExceeded 
                                ? "bg-red-500" 
                                : isWarning 
                                  ? "bg-amber-500" 
                                  : "bg-emerald-500"
                            }
                            className="h-2"
                          />

                          {/* Overflow alerts indicators */}
                          <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                            <span>{Math.round(b.percent)}% Used</span>
                            {isExceeded ? (
                              <span className="text-red-500 flex items-center gap-0.5">
                                <ShieldAlert className="h-3.5 w-3.5" /> Budget Overrun
                              </span>
                            ) : isWarning ? (
                              <span className="text-amber-500 flex items-center gap-0.5">
                                <AlertCircle className="h-3.5 w-3.5" /> Warning Threshold
                              </span>
                            ) : (
                              <span className="text-emerald-500 font-bold">Within Budget</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-400 font-medium space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <p className="text-xs">No monthly budgets have been allocated yet</p>
                  <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
                    Set limits to receive safety warnings when category spending gets high.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
