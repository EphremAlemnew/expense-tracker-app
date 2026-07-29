import { useState, useMemo } from "react";
import { Target, Trash2, Plus, ShieldAlert, AlertCircle } from "lucide-react";
import { formatCurrency, EXPENSE_CATEGORIES, getCategoryInfo } from "../utils/financeUtils";
import type { Budget, Transaction } from "../utils/financeUtils";
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
}

export function BudgetsManager({ budgets, transactions, onSaveBudget, onRemoveBudget }: BudgetsManagerProps) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]?.id || "");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState("");

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
      const catInfo = getCategoryInfo(b.category, "expense");

      return {
        ...b,
        spent,
        percent: pct,
        label: catInfo.label,
        color: catInfo.color,
      };
    });
  }, [budgets, expenseMap]);

  // Exclude categories that already have budgets configured
  const availableCategories = useMemo(() => {
    const configured = new Set(budgets.map((b) => b.category));
    return EXPENSE_CATEGORIES.filter((cat) => !configured.has(cat.id));
  }, [budgets]);

  // Update default category when budget list changes
  useMemo(() => {
    if (availableCategories.length > 0 && !availableCategories.some((c) => c.id === category)) {
      setCategory(availableCategories[0].id);
    }
  }, [availableCategories, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!category) {
      setError("Please select a category");
      return;
    }
    if (!limit.trim() || isNaN(Number(limit)) || Number(limit) <= 0) {
      setError("Please enter a valid monthly limit");
      return;
    }

    onSaveBudget({
      category,
      limit: parseFloat(limit),
    });

    setLimit("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Category Budgets
        </h2>
        <p className="text-sm font-semibold text-zinc-400">
          Enforce and monitor monthly spending boundaries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Budget Config Form Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-violet-500" /> Allocate Budget
            </h3>
            
            {availableCategories.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <Label htmlFor="b-cat">Category</Label>
                  <select
                    id="b-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer appearance-none"
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
                  <Label htmlFor="b-limit">Monthly Limit ($)</Label>
                  <Input
                    id="b-limit"
                    type="text"
                    placeholder="e.g. 500"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                </div>

                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                <Button
                  type="submit"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" /> Create Budget
                </Button>
              </form>
            ) : (
              <div className="p-4 text-center border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl text-zinc-400 text-xs font-medium">
                All available expense categories already have budgets allocated.
              </div>
            )}
          </CardContent>
        </Card>

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
                    
                    return (
                      <div 
                        key={b.category} 
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
                          isExceeded 
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
                          
                          <Button
                            onClick={() => onRemoveBudget(b.category)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:text-red-550 hover:bg-red-500/10"
                            title="Delete budget limit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-zinc-500">Progress</span>
                            <span className={isExceeded ? "text-red-500 font-bold" : isWarning ? "text-amber-500 font-bold" : "text-zinc-750 dark:text-zinc-300"}>
                              {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
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
