import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  NEW: "bg-sky-50 text-sky-700", CONFIRMED: "bg-indigo-50 text-indigo-700", ASSIGNED: "bg-violet-50 text-violet-700",
  ON_THE_WAY: "bg-cyan-50 text-cyan-700", REACHED_CUSTOMER: "bg-blue-50 text-blue-700", IN_PROGRESS: "bg-amber-50 text-amber-700",
  WAITING_FOR_PART: "bg-orange-50 text-orange-700", COMPLETED: "bg-emerald-50 text-emerald-700", PAYMENT_PENDING: "bg-rose-50 text-rose-700",
  RESCHEDULED: "bg-yellow-50 text-yellow-700", CANCELLED: "bg-slate-100 text-slate-600", PAID: "bg-emerald-50 text-emerald-700",
  PARTIAL: "bg-amber-50 text-amber-700", UNPAID: "bg-rose-50 text-rose-700", ACTIVE: "bg-emerald-50 text-emerald-700",
  EXPIRING: "bg-amber-50 text-amber-700", EXPIRED: "bg-rose-50 text-rose-700", HIGH: "bg-orange-50 text-orange-700",
  EMERGENCY: "bg-red-50 text-red-700", NORMAL: "bg-slate-100 text-slate-700", LOW: "bg-blue-50 text-blue-700"
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const label = value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return <span className={cn("badge", styles[value] || "bg-slate-100 text-slate-700", className)}>{label}</span>;
}
