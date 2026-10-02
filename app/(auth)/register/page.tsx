import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { RegisterForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Start free trial" };
export default function RegisterPage() {
  return <div className="w-full max-w-xl"><Link href="/" className="mb-8 inline-flex lg:hidden"><Logo /></Link><p className="text-sm font-bold text-aqua-700">START FREE</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Create your AquaDesk workspace</h2><p className="mt-2 text-sm text-slate-500">Your first branch and Starter trial will be created automatically.</p><div className="mt-7"><RegisterForm /></div></div>;
}
