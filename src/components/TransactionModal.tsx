import { useState, useEffect } from "react";
import { Calendar, DollarSign, Tag, FileText } from "lucide-react";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../utils/financeUtils";
import type { Transaction } from "../utils/financeUtils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? "Edit Transaction" : "New Transaction"}
          </DialogTitle>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Segmented Switch */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl shadow-inner">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-2 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                type === "expense"
                  ? "bg-white dark:bg-zinc-800 text-red-500 shadow-sm border border-zinc-200/20"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-2 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                type === "income"
                  ? "bg-white dark:bg-zinc-800 text-emerald-500 shadow-sm border border-zinc-200/20"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              Income
            </button>
          </div>

          {/* Title Input */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-title">Title</Label>
            <div className="relative">
              <InputIcon icon={FileText} />
              <Input
                id="tx-title"
                type="text"
                placeholder="Rent, Grocery, Side job..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-red-550 focus-visible:ring-red-500/20" : ""}
              />
            </div>
            {errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount Input */}
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount">Amount</Label>
              <div className="relative">
                <InputIcon icon={DollarSign} />
                <Input
                  id="tx-amount"
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={errors.amount ? "border-red-550 focus-visible:ring-red-500/20" : ""}
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500 font-semibold">{errors.amount}</p>}
            </div>

            {/* Date Input */}
            <div className="space-y-1.5">
              <Label htmlFor="tx-date">Date</Label>
              <div className="relative">
                <InputIcon icon={Calendar} />
                <Input
                  id="tx-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={errors.date ? "border-red-550 focus-visible:ring-red-500/20" : ""}
                />
              </div>
              {errors.date && <p className="text-xs text-red-500 font-semibold">{errors.date}</p>}
            </div>
          </div>

          {/* Category Input */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-cat">Category</Label>
            <div className="relative">
              <InputIcon icon={Tag} />
              <select
                id="tx-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full h-11 pl-10 pr-4 rounded-xl bg-white dark:bg-zinc-950 border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                  errors.category ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                } text-zinc-950 dark:text-zinc-50 appearance-none cursor-pointer`}
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
            <Label htmlFor="tx-notes">Notes (Optional)</Label>
            <textarea
              id="tx-notes"
              placeholder="Add details or description..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-zinc-950 dark:text-zinc-50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InputIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none z-10">
      <Icon className="h-4 w-4" />
    </div>
  );
}
