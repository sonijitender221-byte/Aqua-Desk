import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const business = await db.business.findUniqueOrThrow({ where: { id: session.businessId }, select: { name: true } });
  return <div className="min-h-screen bg-slate-50 lg:flex"><Sidebar /><div className="min-w-0 flex-1"><Topbar session={session} businessName={business.name} /><main className="p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
