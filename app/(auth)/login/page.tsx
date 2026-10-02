import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Login" };
export default function LoginPage() {
  return <div className="w-full max-w-md"><Link href="/" className="mb-8 inline-flex lg:hidden"><Logo /></Link><p className="text-sm font-bold text-aqua-700">WELCOME BACK</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Sign in to your workspace</h2><p className="mt-2 text-sm text-slate-500">Manage today’s jobs, technicians and collections.</p><div className="mt-7"><LoginForm /></div><div className="mt-6 rounded-2xl border border-aqua-100 bg-aqua-50 p-4 text-sm text-aqua-900"><p className="font-bold">Demo account</p><p className="mt-1">owner@aquadesk.app</p><p>Demo@123</p></div></div>;
}
