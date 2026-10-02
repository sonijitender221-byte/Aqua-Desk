"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, Bell, Boxes, CalendarDays, ClipboardCheck, FileText, Gauge, Menu, Settings, Users2, Wrench, X } from "lucide-react";
import { Logo } from "@/components/logo";

const items = [
  ["/dashboard", "Overview", Gauge], ["/dashboard/customers", "Customers", Users2], ["/dashboard/services", "Service Tickets", CalendarDays],
  ["/dashboard/technicians", "Technicians", Wrench], ["/dashboard/amc", "AMC", ClipboardCheck], ["/dashboard/inventory", "Inventory", Boxes],
  ["/dashboard/invoices", "Invoices", FileText], ["/dashboard/reports", "Reports", BarChart3], ["/dashboard/reminders", "Reminders", Bell], ["/dashboard/settings", "Settings", Settings]
] as const;

export function MobileNav() {
  const [open,setOpen]=useState(false);
  return <><button onClick={()=>setOpen(true)} className="grid size-10 place-items-center rounded-xl border bg-white lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>{open&&<div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/45" onClick={()=>setOpen(false)} aria-label="Close navigation" /><div className="relative h-full w-[85%] max-w-sm bg-white p-4 shadow-2xl"><div className="flex items-center justify-between"><Logo /><button onClick={()=>setOpen(false)} className="grid size-10 place-items-center rounded-xl border"><X className="size-5" /></button></div><nav className="mt-6 space-y-1">{items.map(([href,label,Icon])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-aqua-50 hover:text-aqua-800"><Icon className="size-4" />{label}</Link>)}</nav></div></div>}</>;
}
