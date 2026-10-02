import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return <div className="card grid min-h-64 place-items-center p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-aqua-50 text-aqua-700"><Icon className="size-6" /></span><h3 className="mt-4 font-bold text-slate-900">{title}</h3><p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{description}</p>{action && <div className="mt-5">{action}</div>}</div></div>;
}
