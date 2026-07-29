import { useState, useMemo, useEffect, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { Calculator, History, Save, ArrowDownToLine, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/financeUtils";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface TaxRecord {
  id: string;
  date: string;
  title: string;
  basicSalary: number;
  transportAllowance: number;
  otherAllowances: number;
  nonTaxableAllowances: number;
  pensionExempted: boolean;
  grossSalary: number;
  pensionAmount: number;
  taxableIncome: number;
  incomeTax: number;
  netPay: number;
}

interface TaxCalculatorProps {
  onAddTransaction: (title: string, amount: number, type: "income" | "expense", category: string, date: string) => void;
  isDarkMode: boolean;
  serverUrl: string;
  isOnline: boolean;
}

export function TaxCalculator({ onAddTransaction, isDarkMode, serverUrl, isOnline }: TaxCalculatorProps) {
  // Inputs
  const [title, setTitle] = useState("July Salary");
  const [basicSalary, setBasicSalary] = useState("15000");
  const [transportAllowance, setTransportAllowance] = useState("1000");
  const [otherAllowances, setOtherAllowances] = useState("0");
  const [nonTaxableAllowances, setNonTaxableAllowances] = useState("0");
  const [pensionExempted, setPensionExempted] = useState(true);

  // History List
  const [history, setHistory] = useState<TaxRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch History from API or LocalStorage
  const fetchTaxHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      if (isOnline) {
        const response = await fetch(`${serverUrl}/tax-calculations`);
        const data = await response.json();
        setHistory(data);
      } else {
        const saved = localStorage.getItem("fortuna_tax_history");
        setHistory(saved ? JSON.parse(saved) : []);
      }
    } catch (err) {
      console.error("Failed to load tax history:", err);
      const saved = localStorage.getItem("fortuna_tax_history");
      setHistory(saved ? JSON.parse(saved) : []);
    } finally {
      setLoadingHistory(false);
    }
  }, [isOnline, serverUrl]);

  useEffect(() => {
    fetchTaxHistory();
  }, [fetchTaxHistory]);

  // Sync to local storage for offline redundancy
  const saveHistoryLocally = (newHistory: TaxRecord[]) => {
    localStorage.setItem("fortuna_tax_history", JSON.stringify(newHistory));
  };

  // Perform Calculations
  const results = useMemo(() => {
    const basic = parseFloat(basicSalary) || 0;
    const transport = parseFloat(transportAllowance) || 0;
    const other = parseFloat(otherAllowances) || 0;
    const nonTaxable = parseFloat(nonTaxableAllowances) || 0;

    // 1. Employee Pension (7% of Basic Salary)
    const pension = pensionExempted ? basic * 0.07 : 0;

    // 2. Transport Allowance Exemption Calculation:
    // Under Ethiopian Tax Directive: Transport allowance is exempt up to 600 ETB or 1/4 of basic salary (whichever is lower).
    const transportLimit = Math.min(600, basic * 0.25);
    const taxableTransport = Math.max(0, transport - transportLimit);

    // 3. Taxable Income
    const taxableIncome = Math.max(0, basic + taxableTransport + other - pension);

    // 4. Bracket Tax Calculations
    let tax = 0;
    let bracketDetails = "";
    let deduction = 0;

    if (taxableIncome <= 600) {
      tax = 0;
      deduction = 0;
      bracketDetails = "0 - 600 ETB (0% Tax)";
    } else if (taxableIncome <= 1650) {
      tax = taxableIncome * 0.10 - 60;
      deduction = 60;
      bracketDetails = "601 - 1,650 ETB (10% Tax)";
    } else if (taxableIncome <= 3200) {
      tax = taxableIncome * 0.15 - 142.50;
      deduction = 142.50;
      bracketDetails = "1,651 - 3,200 ETB (15% Tax)";
    } else if (taxableIncome <= 5250) {
      tax = taxableIncome * 0.20 - 302.50;
      deduction = 302.50;
      bracketDetails = "3,201 - 5,250 ETB (20% Tax)";
    } else if (taxableIncome <= 7800) {
      tax = taxableIncome * 0.25 - 565;
      deduction = 565;
      bracketDetails = "5,251 - 7,800 ETB (25% Tax)";
    } else if (taxableIncome <= 10900) {
      tax = taxableIncome * 0.30 - 955;
      deduction = 955;
      bracketDetails = "7,801 - 10,900 ETB (30% Tax)";
    } else {
      tax = taxableIncome * 0.35 - 1500;
      deduction = 1500;
      bracketDetails = "Above 10,900 ETB (35% Tax)";
    }

    tax = Math.max(0, tax);
    const gross = basic + transport + other + nonTaxable;
    const net = gross - pension - tax;

    return {
      grossSalary: gross,
      pensionAmount: pension,
      taxableIncome,
      incomeTax: tax,
      netPay: net,
      bracket: bracketDetails,
      deductionAmount: deduction,
      exemptedTransport: Math.min(transport, transportLimit),
    };
  }, [basicSalary, transportAllowance, otherAllowances, nonTaxableAllowances, pensionExempted]);

  // ECharts visual option
  const chartOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: <b>{c} ETB</b> ({d}%)",
        backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
        borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
        textStyle: {
          color: isDarkMode ? "#fafafa" : "#09090b",
        },
      },
      series: [
        {
          name: "Income Distribution",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: isDarkMode ? "#070709" : "#ffffff",
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: "bold",
              formatter: "{b}\n{c} ETB",
              color: isDarkMode ? "#ffffff" : "#000000",
            },
          },
          data: [
            { name: "Net Pay", value: Math.round(results.netPay), itemStyle: { color: "#10b981" } },
            { name: "Income Tax", value: Math.round(results.incomeTax), itemStyle: { color: "#ef4444" } },
            { name: "Pension (7%)", value: Math.round(results.pensionAmount), itemStyle: { color: "#f59e0b" } },
          ].filter(item => item.value > 0),
        },
      ],
    };
  }, [results, isDarkMode]);

  // Actions
  const handleSaveCalculation = async () => {
    const newRecord: Omit<TaxRecord, "id"> = {
      date: new Date().toISOString().slice(0, 10),
      title: title.trim() || "Salary Calculation",
      basicSalary: parseFloat(basicSalary) || 0,
      transportAllowance: parseFloat(transportAllowance) || 0,
      otherAllowances: parseFloat(otherAllowances) || 0,
      nonTaxableAllowances: parseFloat(nonTaxableAllowances) || 0,
      pensionExempted,
      grossSalary: results.grossSalary,
      pensionAmount: results.pensionAmount,
      taxableIncome: results.taxableIncome,
      incomeTax: results.incomeTax,
      netPay: results.netPay,
    };

    try {
      if (isOnline) {
        const response = await fetch(`${serverUrl}/tax-calculations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRecord),
        });
        const savedRecord = await response.json();
        const updated = [savedRecord, ...history];
        setHistory(updated);
        saveHistoryLocally(updated);
      } else {
        const localRecord = { ...newRecord, id: Math.random().toString(36).substring(2, 9) };
        const updated = [localRecord, ...history];
        setHistory(updated);
        saveHistoryLocally(updated);
      }
      alert("Tax calculation log saved successfully!");
    } catch (err) {
      console.error("Failed to save tax record:", err);
      // Fallback
      const localRecord = { ...newRecord, id: Math.random().toString(36).substring(2, 9) };
      const updated = [localRecord, ...history];
      setHistory(updated);
      saveHistoryLocally(updated);
      alert("Saved locally (offline mode)");
    }
  };

  const handleLogAsIncome = () => {
    const today = new Date().toISOString().slice(0, 10);
    onAddTransaction(
      `${title.trim() || "Salary Pay"} (Net)`,
      parseFloat(results.netPay.toFixed(2)),
      "income",
      "salary",
      today,
    );
    alert("Net pay logged successfully as an income transaction in your main ledger!");
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tax record?")) return;

    try {
      if (isOnline) {
        await fetch(`${serverUrl}/tax-calculations/${id}`, { method: "DELETE" });
      }
      const updated = history.filter((h) => h.id !== id);
      setHistory(updated);
      saveHistoryLocally(updated);
    } catch (err) {
      console.error("Failed to delete record:", err);
      const updated = history.filter((h) => h.id !== id);
      setHistory(updated);
      saveHistoryLocally(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
          Ethiopian Income Tax Calculator
        </h2>
        <p className="text-sm font-semibold text-zinc-400">
          Compute monthly employment income tax in accordance with Proclamation No. 979/2016 (Schedule A)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form Inputs Panel */}
        <Card className="lg:col-span-1 p-6 space-y-4 shadow-sm">
          <CardHeader className="p-0 flex flex-row items-center gap-2 mb-4">
            <Calculator className="h-4.5 w-4.5 text-violet-500" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">
              Tax Parameters
            </CardTitle>
          </CardHeader>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tax-title">Title / Period</Label>
              <Input
                id="tax-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. July Salary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-basic">Basic Salary (ETB)</Label>
              <Input
                id="tax-basic"
                type="number"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-transport">Transport Allowance (ETB)</Label>
              <Input
                id="tax-transport"
                type="number"
                value={transportAllowance}
                onChange={(e) => setTransportAllowance(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-other">Other Taxable Allowances (ETB)</Label>
              <Input
                id="tax-other"
                type="number"
                value={otherAllowances}
                onChange={(e) => setOtherAllowances(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tax-nontax">Non-taxable Allowances (ETB)</Label>
              <Input
                id="tax-nontax"
                type="number"
                value={nonTaxableAllowances}
                onChange={(e) => setNonTaxableAllowances(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <input
                id="tax-pension"
                type="checkbox"
                checked={pensionExempted}
                onChange={(e) => setPensionExempted(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-200 dark:border-zinc-800 text-violet-600 focus:ring-violet-500 cursor-pointer"
              />
              <Label htmlFor="tax-pension" className="cursor-pointer select-none">
                Deduct Employee Pension (7%)
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveCalculation}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs"
              >
                <Save className="h-4 w-4" /> Save Log
              </Button>
              <Button
                onClick={handleLogAsIncome}
                className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs"
              >
                <ArrowDownToLine className="h-4 w-4" /> Log Income
              </Button>
            </div>
          </div>
        </Card>

        {/* Calculations Results Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Numeric Table Summary Card */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Calculation Sheet (ETB)
              </h3>
              
              <div className="divide-y divide-zinc-150/40 dark:divide-zinc-800/40 text-xs font-semibold">
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500">Gross Salary</span>
                  <span className="text-zinc-850 dark:text-zinc-100">{formatCurrency(results.grossSalary).replace("$", "ETB ")}</span>
                </div>
                {pensionExempted && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-zinc-500">Employee Pension (7%)</span>
                    <span className="text-amber-500">-{formatCurrency(results.pensionAmount).replace("$", "ETB ")}</span>
                  </div>
                )}
                {parseFloat(transportAllowance) > 0 && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-zinc-500">Exempted Transport Allow.</span>
                    <span className="text-emerald-500">{formatCurrency(results.exemptedTransport).replace("$", "ETB ")}</span>
                  </div>
                )}
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500">Total Taxable Income</span>
                  <span className="text-zinc-850 dark:text-zinc-100">{formatCurrency(results.taxableIncome).replace("$", "ETB ")}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500">Tax Bracket Match</span>
                  <span className="text-violet-600 dark:text-violet-400 text-[10px] uppercase font-bold">{results.bracket}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-500">Income Tax Charge</span>
                  <span className="text-red-500">-{formatCurrency(results.incomeTax).replace("$", "ETB ")}</span>
                </div>
                <div className="py-2.5 flex justify-between text-sm font-black border-t-2 border-zinc-200 dark:border-zinc-800 pt-3">
                  <span className="text-zinc-800 dark:text-zinc-200">Net Take-Home Pay</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(results.netPay).replace("$", "ETB ")}</span>
                </div>
              </div>
            </Card>

            {/* Doughnut Distribution Chart Card */}
            <Card className="p-6 flex flex-col justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Income Distribution
              </h3>
              <div className="flex-1 flex items-center justify-center">
                <ReactECharts option={chartOption} style={{ height: "180px", width: "100%" }} />
              </div>
            </Card>
          </div>

          {/* History Calculations Logs */}
          <Card className="p-6">
            <CardHeader className="p-0 flex flex-row items-center gap-2 mb-4">
              <History className="h-4.5 w-4.5 text-zinc-500" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                Calculation History {loadingHistory && "(Loading...)"}
              </CardTitle>
            </CardHeader>

            {history.length > 0 ? (
              <div className="overflow-x-auto max-h-[220px] scrollbar-thin">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-400 font-bold uppercase tracking-wider">
                      <th className="p-3">Date</th>
                      <th className="p-3">Title</th>
                      <th className="p-3 text-right">Basic Salary</th>
                      <th className="p-3 text-right">Tax Charged</th>
                      <th className="p-3 text-right">Net Take-Home</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                        <td className="p-3 font-semibold text-zinc-500 whitespace-nowrap">
                          {new Date(h.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">{h.title}</td>
                        <td className="p-3 text-right font-semibold">{h.basicSalary.toLocaleString()} ETB</td>
                        <td className="p-3 text-right font-semibold text-red-500">{h.incomeTax.toLocaleString()} ETB</td>
                        <td className="p-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {h.netPay.toLocaleString()} ETB
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteRecord(h.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400 font-medium text-xs">
                No saved tax logs recorded
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
