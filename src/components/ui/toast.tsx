import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ToastProps {
  message: string;
  type?: "success" | "info" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/20 bg-emerald-500/5",
    error: "border-red-500/20 bg-red-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-55 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-sm",
      borders[type]
    )}>
      {icons[type]}
      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ml-2 cursor-pointer"
        title="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
