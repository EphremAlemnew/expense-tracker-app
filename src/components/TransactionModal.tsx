import { useState, useEffect } from "react";
import { X, Calendar, DollarSign, Tag, FileText } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../utils/financeUtils";
import type { Transaction } from "../utils/financeUtils";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, "id"> & { id?: string }) => void;
  editingTransaction?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, onSave, editingTransaction }: TransactionModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state if editing a transaction
  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNotes(editingTransaction.notes || "");
      setErrors({});
    } else {
      setTitle("");
      setAmount("");
      setType("expense");
      setCategory("");
      setDate(new Date().toISOString().slice(0, 10));
      setNotes("");
      setErrors({});
    }
  }, [editingTransaction, isOpen]);

  // Set default category when type changes
  useEffect(() => {
    if (!editingTransaction) {
      const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      setCategory(categories[0]?.id || "");
    }
  }, [type, editingTransaction]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Enter a valid positive amount";
    }
    if (!category) newErrors.category = "Category is required";
    if (!date) newErrors.date = "Date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: editingTransaction?.id,
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg glass-card rounded-3xl overflow-hidden shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {editingTransaction ? "Edit Transaction" : "New Transaction"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-650 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Segmented Switch */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                type === "expense"
                  ? "bg-white dark:bg-zinc-800 text-red-500 shadow-sm border border-zinc-250/20"
                  : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
                type === "income"
                  ? "bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm border border-zinc-250/20"
                  : "text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300"
              }`}
            >
              Income
            </button>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Title
            </label>
            <div className="relative">
              <InputIcon icon={FileText} />
              <input
                type="text"
                placeholder="Rent, Grocery, Side job..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-zinc-950 border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                  errors.title ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                } text-zinc-900 dark:text-zinc-100`}
              />
            </div>
            {errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Amount
              </label>
              <div className="relative">
                <InputIcon icon={DollarSign} />
                <input
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-zinc-950 border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                    errors.amount ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                  } text-zinc-900 dark:text-zinc-100`}
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500 font-semibold">{errors.amount}</p>}
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Date
              </label>
              <div className="relative">
                <InputIcon icon={Calendar} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-zinc-950 border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                    errors.date ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                  } text-zinc-900 dark:text-zinc-100`}
                />
              </div>
              {errors.date && <p className="text-xs text-red-500 font-semibold">{errors.date}</p>}
            </div>
          </div>

          {/* Category Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Category
            </label>
            <div className="relative">
              <InputIcon icon={Tag} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-zinc-950 border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                  errors.category ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                } text-zinc-900 dark:text-zinc-100 appearance-none`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-xs text-red-500 font-semibold">{errors.category}</p>}
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add details, shopping list or description..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-zinc-900 dark:text-zinc-100 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white hover:opacity-95 shadow-md shadow-violet-500/10 transition-opacity"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
      <Icon className="h-4 w-4" />
    </div>
  );
}
