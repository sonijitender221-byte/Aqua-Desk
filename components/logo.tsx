import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-aqua-500 to-teal-600 text-white shadow-lg shadow-cyan-200/60"><Droplets className="size-5" /></span>
      {!compact && <div><p className="text-lg font-extrabold tracking-tight text-slate-900">AquaDesk</p><p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-aqua-700">Service OS</p></div>}
    </div>
  );
}
