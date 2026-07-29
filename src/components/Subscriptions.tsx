import { useState, useMemo } from "react";
import { CalendarDays, Trash2, Plus, Clock, CreditCard } from "lucide-react";
import { formatCurrency, EXPENSE_CATEGORIES, getCategoryInfo } from "../utils/financeUtils";
import type { Subscription } from "../utils/financeUtils";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface SubscriptionsProps {
  subscriptions: Subscription[];
  onSaveSubscription: (sub: Subscription) => void;
  onRemoveSubscription: (id: string) => void;
}

export function Subscriptions({ subscriptions, onSaveSubscription, onRemoveSubscription }: SubscriptionsProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]?.id || "");
  const [error, setError] = useState("");

  const totalCost = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + s.amount, 0);
  }, [subscriptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Subscription name is required");
      return;
    }
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    const dueDay = parseInt(dueDate);
    if (isNaN(dueDay) || dueDay < 1 || dueDay > 31) {
      setError("Enter a valid day of the month (1-31)");
      return;
    }

    onSaveSubscription({
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      amount: parseFloat(amount),
      dueDate: dueDay,
      category,
    });

    setTitle("");
    setAmount("");
    setDueDate("");
  };

  // Helper to calculate days remaining until payment date
  const getDaysRemaining = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();

    if (currentDay === dueDay) {
      return 0;
    }
    if (currentDay < dueDay) {
      return dueDay - currentDay;
    }
    // Calculates days remaining when date rolls over to next month
    const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return (daysInCurrentMonth - currentDay) + dueDay;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Recurring Bills & Subscriptions
          </h2>
          <p className="text-sm font-semibold text-zinc-400">
            Track and anticipate monthly payment commitments
          </p>
        </div>
        
        {/* Total Cost Badge */}
        {subscriptions.length > 0 && (
          <div className="h-10 px-4 rounded-xl border border-zinc-205 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center gap-2 shadow-sm shrink-0">
            <CreditCard className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Total: <span className="text-violet-650 dark:text-violet-400">{formatCurrency(totalCost)}</span>/mo
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Subscriptions Form Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-violet-500" /> Add Recurring Bill
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="sub-name">Name</Label>
                <Input
                  id="sub-name"
                  type="text"
                  placeholder="e.g. Netflix, Spotify, Rent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Cost */}
                <div className="space-y-1.5">
                  <Label htmlFor="sub-cost">Cost ($)</Label>
                  <Input
                    id="sub-cost"
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="sub-day">Due Day (1-31)</Label>
                  <Input
                    id="sub-day"
                    type="text"
                    placeholder="e.g. 15"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="sub-cat">Category</Label>
                <select
                  id="sub-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer appearance-none"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

              <Button
                type="submit"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Bill
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Subscriptions Progress Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Active Recurring Bills
              </h3>

              {subscriptions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((s) => {
                    const daysRemaining = getDaysRemaining(s.dueDate);
                    const info = getCategoryInfo(s.category, "expense");

                    // Determine color-coded countdown warning badge
                    let badgeClass = "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-800/50";
                    let badgeText = `In ${daysRemaining} days`;

                    if (daysRemaining === 0) {
                      badgeClass = "bg-red-500/10 text-red-500 border-red-500/20 font-bold animate-pulse";
                      badgeText = "Due Today";
                    } else if (daysRemaining === 1) {
                      badgeClass = "bg-orange-500/10 text-orange-505 border-orange-500/20 font-bold";
                      badgeText = "Due Tomorrow";
                    } else if (daysRemaining <= 5) {
                      badgeClass = "bg-amber-500/10 text-amber-550 border-amber-500/20 font-semibold";
                      badgeText = `Due in ${daysRemaining} days`;
                    }

                    return (
                      <div 
                        key={s.id} 
                        className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex flex-col justify-between min-h-[120px]"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                              style={{ backgroundColor: info.color }}
                            >
                              <span className="font-extrabold text-[10px] uppercase">
                                {s.title.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-zinc-850 dark:text-zinc-150 leading-tight">
                                {s.title}
                              </h4>
                              <p className="text-[10px] font-semibold text-zinc-450 uppercase mt-0.5 tracking-wider">
                                {info.label}
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() => onRemoveSubscription(s.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:text-red-550 hover:bg-red-500/10"
                            title="Delete recurring bill record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Monthly Cost</p>
                            <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 mt-0.5 tracking-tight">
                              {formatCurrency(s.amount)}
                            </p>
                          </div>

                          {/* Due Badge */}
                          <div className="text-right flex flex-col items-end gap-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">
                              Due on Day {s.dueDate}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] ${badgeClass}`}>
                              <Clock className="h-3 w-3 shrink-0" /> {badgeText}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-400 font-medium space-y-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <p className="text-xs">No recurring bills logged yet</p>
                  <p className="text-[10px] text-zinc-505 max-w-xs mx-auto">
                    Add monthly utilities, software packages, rent or commitments to track countdowns.
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
