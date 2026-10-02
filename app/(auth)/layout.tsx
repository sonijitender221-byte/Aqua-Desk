import Link from "next/link";
import { Logo } from "@/components/logo";
import { CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-950 p-4 sm:p-8"><div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[1.05fr_.95fr] sm:min-h-[calc(100vh-4rem)]">
    <section className="hidden bg-gradient-to-br from-slate-950 via-slate-900 to-aqua-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
      <Link href="/"><Logo className="[&_p]:text-white" /></Link>
      <div><span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">Built for RO service teams</span><h1 className="mt-5 max-w-lg text-4xl font-black leading-tight">Every customer, service, filter and payment in one place.</h1><p className="mt-4 max-w-lg text-slate-300">Replace spreadsheets and scattered WhatsApp chats with a structured service operation.</p><div className="mt-8 space-y-3 text-sm text-slate-200">{["14-day free trial", "No credit card required", "Mobile technician workflow", "Tenant-isolated business data"].map((item)=><p key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-cyan-300" />{item}</p>)}</div></div>
      <p className="text-xs text-slate-400">AquaDesk • Smart Service Management for RO Businesses</p>
    </section>
    <section className="flex items-center justify-center p-6 sm:p-10">{children}</section>
  </div></main>;
}
