"use client";

import Link from "next/link";
import { BarChart3, Bell, Boxes, Building2, CalendarDays, ClipboardCheck, CreditCard, FileText, Gauge, Headphones, LogOut, Settings, ShieldAlert, Users2, Wrench } from "lucide-react";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Smartphone } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: Gauge },
  { href: "/dashboard/customers", label: "Customers", icon: Users2 },
  { href: "/dashboard/services", label: "Service Tickets", icon: CalendarDays },
  { href: "/dashboard/technicians", label: "Technicians", icon: Wrench },
  { href: "/dashboard/amc", label: "AMC Management", icon: ClipboardCheck },
  { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
  { href: "/dashboard/invoices", label: "Invoices & Payments", icon: FileText },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/complaints", label: "Complaints", icon: ShieldAlert },
  { href: "/dashboard/reminders", label: "Reminders", icon: Bell },
  { href: "/dashboard/branches", label: "Branches", icon: Building2 },
  { href: "/dashboard/technician-app", label: "Technician App", icon: Smartphone },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex">
    <div className="flex h-20 items-center border-b px-6"><Link href="/dashboard"><Logo /></Link></div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">{nav.map(({href,label,icon:Icon})=>{
      const active = pathname ? (href === "/dashboard" ? pathname === href : pathname.startsWith(href)) : false;
      return <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "bg-aqua-50 text-aqua-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950")}><Icon className={cn("size-4.5", active&&"text-aqua-600")} />{label}</Link>;
    })}</nav>
    <div className="border-t p-3"><Link href="/dashboard/subscription" className="mb-2 flex items-center gap-3 rounded-xl bg-slate-950 px-3 py-3 text-sm font-semibold text-white"><CreditCard className="size-4" /><span className="flex-1">Starter Trial</span><span className="text-xs text-cyan-300">14d</span></Link><form action={logoutAction}><button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700"><LogOut className="size-4" />Sign out</button></form></div>
  </aside>;
}
