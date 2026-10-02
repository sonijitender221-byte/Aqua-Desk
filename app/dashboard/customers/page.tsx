import Link from "next/link";
import { Download, Plus, Search, Users2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const session=await requireSession(); const params=await searchParams; const q=params.q?.trim()||""; const page=Math.max(1,Number(params.page||1)); const take=12;
  const where={businessId:session.businessId,...(q?{OR:[{name:{contains:q,mode:"insensitive" as const}},{phone:{contains:q}},{customerCode:{contains:q,mode:"insensitive" as const}},{address:{contains:q,mode:"insensitive" as const}}]}:{})};
  const [customers,total]=await Promise.all([db.customer.findMany({where,orderBy:{createdAt:"desc"},skip:(page-1)*take,take,include:{_count:{select:{purifierUnits:true,serviceRequests:true,amcs:true}}}}),db.customer.count({where})]);
  return <><PageHeader title="Customers" description={`${total.toLocaleString("en-IN")} customer records across your business.`} action={<div className="flex gap-2"><a href="/api/export/customers" className="btn-secondary"><Download className="size-4" />Export CSV</a><Link href="/dashboard/customers/new" className="btn-primary"><Plus className="size-4" />Add customer</Link></div>} />
  <form className="mb-5 flex max-w-xl gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"/><input name="q" defaultValue={q} className="input pl-9" placeholder="Search name, phone, code or address" /></div><button className="btn-secondary">Search</button></form>
  {customers.length===0?<EmptyState icon={Users2} title="No customers found" description="Add your first customer or change the search terms." action={<Link href="/dashboard/customers/new" className="btn-primary">Add customer</Link>} />:<><div className="table-wrap"><table className="table"><thead><tr><th>Customer</th><th>Phone</th><th>Type</th><th>Purifiers</th><th>Services</th><th>AMC</th><th>Next service</th><th>Lifetime value</th></tr></thead><tbody>{customers.map(c=><tr key={c.id}><td><Link href={`/dashboard/customers/${c.id}`} className="font-extrabold text-slate-900 hover:text-aqua-700">{c.name}</Link><p className="text-xs text-slate-400">{c.customerCode}</p></td><td>{c.phone}</td><td><StatusBadge value={c.customerType.toUpperCase()==="COMMERCIAL"?"HIGH":"NORMAL"} className={c.customerType==="Commercial"?"bg-violet-50 text-violet-700":""}/></td><td>{c._count.purifierUnits}</td><td>{c._count.serviceRequests}</td><td>{c._count.amcs>0?<span className="font-bold text-emerald-700">Active</span>:<span className="text-slate-400">None</span>}</td><td>{formatDate(c.nextServiceDate)}</td><td className="font-bold">{formatCurrency(Number(c.totalSpending))}</td></tr>)}</tbody></table></div><div className="mt-5 flex items-center justify-between text-sm"><p className="text-slate-500">Page {page} of {Math.max(1,Math.ceil(total/take))}</p><div className="flex gap-2">{page>1&&<Link className="btn-secondary" href={`/dashboard/customers?q=${encodeURIComponent(q)}&page=${page-1}`}>Previous</Link>}{page*take<total&&<Link className="btn-secondary" href={`/dashboard/customers?q=${encodeURIComponent(q)}&page=${page+1}`}>Next</Link>}</div></div></>}
  </>;
}
