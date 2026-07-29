import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Wallet, TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";
import { formatCurrency, EXPENSE_CATEGORIES, getCategoryInfo } from "../utils/financeUtils";
import type { Transaction, Budget } from "../utils/financeUtils";

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
  onNavigateToTab: (tab: "transactions" | "budgets") => void;
  isDarkMode: boolean;
}

export function Dashboard({ transactions, budgets, onNavigateToTab, isDarkMode }: DashboardProps) {
  // 1. Math Aggregations
  const stats = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach((t) => {
      if (t.type === "income") income += t.amount;
      else expenses += t.amount;
    });
    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  // 2. Expenses grouped by Category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return EXPENSE_CATEGORIES.map((cat) => ({
      name: cat.label,
      value: map[cat.id] || 0,
      color: cat.color,
    })).filter((item) => item.value > 0);
  }, [transactions]);

  // 3. Daily Spending Trend (Last 7 active days)
  const spendingTrend = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.date] = (map[t.date] || 0) + t.amount;
      });

    const sortedDates = Object.keys(map).sort().slice(-7);
    return {
      dates: sortedDates.map((d) => {
        const dateObj = new Date(d);
        return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }),
      amounts: sortedDates.map((d) => Math.round(map[d] || 0)),
    };
  }, [transactions]);

  // 4. Budget Overflows
  const budgetAlerts = useMemo(() => {
    const expenseMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
      });

    return budgets
      .map((b) => {
        const spent = expenseMap[b.category] || 0;
        const catInfo = getCategoryInfo(b.category, "expense");
        const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
        return {
          category: catInfo.label,
          spent,
          limit: b.limit,
          percent: pct,
        };
      })
      .filter((item) => item.percent >= 80);
  }, [transactions, budgets]);

  // 5. ECharts Options
  const categoryChartOption = useMemo(() => {
    const textStyle = {
      color: isDarkMode ? "#a1a1aa" : "#71717a",
      fontFamily: "Inter, sans-serif",
    };

    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: <b>${c}</b> ({d}%)",
        backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
        borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
        textStyle: {
          color: isDarkMode ? "#fafafa" : "#09090b",
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
        textStyle: textStyle,
        show: expenseByCategory.length < 8,
      },
      series: [
        {
          name: "Expenses",
          type: "pie",
          radius: ["45%", "75%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: isDarkMode ? "#0c0c12" : "#ffffff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
              formatter: "{b}\n${c}",
              color: isDarkMode ? "#ffffff" : "#000000",
            },
          },
          labelLine: {
            show: false,
          },
          data: expenseByCategory.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color },
          })),
        },
      ],
    };
  }, [expenseByCategory, isDarkMode]);

  const trendChartOption = useMemo(() => {
    const textColor = isDarkMode ? "#a1a1aa" : "#71717a";
    const lineColor = isDarkMode ? "#27272a" : "#e4e4e7";

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
        borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
        textStyle: {
          color: isDarkMode ? "#fafafa" : "#09090b",
        },
      },
      grid: {
        top: 25,
        bottom: 20,
        left: 40,
        right: 15,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: spendingTrend.dates,
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: textColor },
      },
      yAxis: {
        type: "value",
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: lineColor } },
      },
      series: [
        {
          name: "Spent",
          type: "line",
          smooth: true,
          data: spendingTrend.amounts,
          lineStyle: { width: 3, color: "#8b5cf6" },
          itemStyle: { color: "#8b5cf6" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(139, 92, 246, 0.25)" },
                { offset: 1, color: "rgba(139, 92, 246, 0.0)" },
              ],
            },
          },
        },
      ],
    };
  }, [spendingTrend, isDarkMode]);

  const topTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-sm font-semibold text-zinc-400">
            Real-time balance, budgets, and visual insights
          </p>
        </div>
      </div>

      {/* 2. Summaries Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Balance Card */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[140px] bg-gradient-to-tr from-violet-500/10 to-indigo-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Balance</span>
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
              {formatCurrency(stats.balance)}
            </h3>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
              Active ledger balance
            </p>
          </div>
        </div>

        {/* Total Income Card */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[140px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 leading-none">
              {formatCurrency(stats.income)}
            </h3>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
              Earnings bookmarked
            </p>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[140px] bg-gradient-to-tr from-red-500/10 to-orange-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none" />
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expense</span>
            <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <TrendingDown className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight text-red-500 dark:text-red-400 leading-none">
              {formatCurrency(stats.expenses)}
            </h3>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
              Debits recorded
            </p>
          </div>
        </div>
      </div>

      {/* 3. Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily spending graph */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Spending Trend (Active Days)
            </h3>
          </div>
          {spendingTrend.dates.length > 0 ? (
            <ReactECharts option={trendChartOption} style={{ height: "230px" }} />
          ) : (
            <div className="h-[230px] flex items-center justify-center text-zinc-400 text-xs font-medium">
              No transactions recorded for trend details
            </div>
          )}
        </div>

        {/* Expenses by category breakdown */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
            Expense Allocation
          </h3>
          {expenseByCategory.length > 0 ? (
            <ReactECharts option={categoryChartOption} style={{ height: "230px" }} />
          ) : (
            <div className="h-[230px] flex items-center justify-center text-zinc-400 text-xs font-medium">
              No expense data recorded
            </div>
          )}
        </div>
      </div>

      {/* 4. Split Alerts & Recent Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Health Monitoring */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-1 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-violet-500" /> Budget Alerts
              </h3>
              <button 
                onClick={() => onNavigateToTab("budgets")}
                className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline uppercase"
              >
                Manage
              </button>
            </div>
            
            {budgetAlerts.length > 0 ? (
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {budgetAlerts.map((b) => (
                  <div key={b.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-800 dark:text-zinc-200">{b.category}</span>
                      <span className={`${b.percent >= 100 ? "text-red-500" : "text-amber-500"}`}>
                        {Math.round(b.percent)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${b.percent >= 100 ? "bg-red-500" : "bg-amber-500"}`}
                        style={{ width: `${Math.min(b.percent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                      <span>Spent: {formatCurrency(b.spent)}</span>
                      <span>Limit: {formatCurrency(b.limit)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[180px] flex flex-col items-center justify-center text-center">
                <div className="p-3 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 text-zinc-400 mb-2">
                  <AlertCircle className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="text-xs text-zinc-400 font-medium">All budgets healthy or unconfigured</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent transaction rows */}
        <div className="glass-card p-6 rounded-3xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Recent Transactions
            </h3>
            <button
              onClick={() => onNavigateToTab("transactions")}
              className="text-[10px] font-bold text-violet-600 dark:text-violet-400 hover:underline uppercase"
            >
              View Ledger
            </button>
          </div>

          {topTransactions.length > 0 ? (
            <div className="divide-y divide-zinc-150/40 dark:divide-zinc-800/40">
              {topTransactions.map((t) => {
                const info = getCategoryInfo(t.category, t.type);
                return (
                  <div key={t.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: info.color }}
                      >
                        {/* Dynamic category colors */}
                        <span className="font-extrabold text-[10px] uppercase">
                          {t.category.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-zinc-850 dark:text-zinc-100 leading-tight">
                          {t.title}
                        </p>
                        <p className="text-[10px] font-semibold text-zinc-400 mt-0.5 uppercase tracking-wider">
                          {info.label} • {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black tracking-tight ${t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-800 dark:text-zinc-200"}`}>
                        {t.type === "income" ? "+" : "-"}{formatCurrency(t.amount)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-zinc-400 text-xs font-medium">
              No transactions logged yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
