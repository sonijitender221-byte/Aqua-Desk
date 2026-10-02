import Link from "next/link";
import { Bell, Plus, Search } from "lucide-react";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import type { SessionPayload } from "@/lib/session";

export function Topbar({ session, businessName }: { session: SessionPayload; businessName: string }) {
  const initials = session.name.split(" ").map((part)=>part[0]).slice(0,2).join("").toUpperCase();
  return <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur sm:px-6"><MobileNav /><div className="hidden flex-1 sm:block"><p className="text-xs font-bold uppercase tracking-wider text-aqua-700">{businessName}</p><p className="text-sm font-semibold text-slate-600">Operations workspace</p></div><div className="relative hidden w-full max-w-sm md:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className="input pl-9" placeholder="Search customers, tickets, invoices..." /></div><Link href="/dashboard/services/new" className="btn-primary ml-auto sm:ml-0"><Plus className="size-4" /><span className="hidden sm:inline">New service</span></Link><button className="relative grid size-10 place-items-center rounded-xl border bg-white text-slate-600"><Bell className="size-4" /><span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500" /></button><div className="grid size-10 place-items-center rounded-xl bg-slate-950 text-sm font-black text-white">{initials}</div></header>;
}
