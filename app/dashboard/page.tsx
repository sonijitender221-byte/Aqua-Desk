import Link from "next/link";
import { addDays, format, startOfMonth, subDays } from "date-fns";
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, IndianRupee, PackageSearch, Users2, Wrench } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusBadge } from "@/components/status-badge";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { endOfToday, formatCurrency, formatDate, startOfToday } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requireSession();
  const businessId = session.businessId;
  const todayStart=startOfToday(), todayEnd=endOfToday();
  const [customers, todayJobs, completed, pending, activeAmcs, expiringAmcs, revenue, outstanding, lowStock, latestJobs, technicians] = await Promise.all([
    db.customer.count({where:{businessId}}),
    db.serviceRequest.count({where:{businessId,scheduledAt:{gte:todayStart,lte:todayEnd}}}),
    db.serviceRequest.count({where:{businessId,status:"COMPLETED"}}),
    db.serviceRequest.count({where:{businessId,status:{notIn:["COMPLETED","CANCELLED"]}}}),
    db.customerAmc.count({where:{businessId,status:"ACTIVE"}}),
    db.customerAmc.count({where:{businessId,expiryDate:{gte:new Date(),lte:addDays(new Date(),30)}}}),
    db.payment.aggregate({where:{businessId,receivedAt:{gte:startOfMonth(new Date())}},_sum:{amount:true}}),
    db.invoice.aggregate({where:{businessId,paymentStatus:{not:"PAID"}},_sum:{balanceAmount:true}}),
    db.inventoryItem.count({where:{businessId,currentStock:{lte:5}}}),
    db.serviceRequest.findMany({where:{businessId},orderBy:{createdAt:"desc"},take:7,include:{customer:true,technician:true}}),
    db.technician.findMany({where:{businessId},orderBy:{completedJobs:"desc"},take:4})
  ]);
  const payments = await db.payment.findMany({where:{businessId,receivedAt:{gte:subDays(new Date(),6)}},select:{receivedAt:true,amount:true}});
  const revenueData = Array.from({length:7}).map((_,index)=>{const date=subDays(new Date(),6-index);const amount=payments.filter(p=>format(p.receivedAt,"yyyy-MM-dd")===format(date,"yyyy-MM-dd")).reduce((s,p)=>s+Number(p.amount),0);return{label:format(date,"dd MMM"),revenue:amount};});
  const cards = [
    {label:"Customers",value:customers,meta:"Total active CRM records",icon:Users2,href:"/dashboard/customers",tone:"bg-cyan-50 text-cyan-700"},
    {label:"Today’s jobs",value:todayJobs,meta:`${pending} open across all dates`,icon:CalendarDays,href:"/dashboard/services",tone:"bg-indigo-50 text-indigo-700"},
    {label:"Completed jobs",value:completed,meta:"All-time completed tickets",icon:CheckCircle2,href:"/dashboard/services?status=COMPLETED",tone:"bg-emerald-50 text-emerald-700"},
    {label:"Monthly revenue",value:formatCurrency(Number(revenue._sum.amount||0)),meta:`${formatCurrency(Number(outstanding._sum.balanceAmount||0))} outstanding`,icon:IndianRupee,href:"/dashboard/invoices",tone:"bg-amber-50 text-amber-700"},
  ];
  return <>
    <PageHeader title={`Good evening, ${session.name.split(" ")[0]}`} description="Here is what is happening across your service operation." action={<div className="flex gap-2"><Link href="/dashboard/customers/new" className="btn-secondary">Add customer</Link><Link href="/dashboard/services/new" className="btn-primary">Create ticket</Link></div>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({label,value,meta,icon:Icon,href,tone})=><Link href={href} key={label} className="card p-5 transition hover:-translate-y-0.5 hover:border-aqua-200"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p></div><span className={`grid size-11 place-items-center rounded-2xl ${tone}`}><Icon className="size-5" /></span></div><p className="mt-4 text-xs text-slate-400">{meta}</p></Link>)}</div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.55fr]"><section className="card p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-extrabold text-slate-950">Revenue trend</h2><p className="text-xs text-slate-500">Payments received over the last seven days</p></div><Link href="/dashboard/reports" className="text-sm font-bold text-aqua-700">View report</Link></div><RevenueChart data={revenueData} /></section><section className="card p-5"><h2 className="font-extrabold text-slate-950">Attention needed</h2><div className="mt-4 space-y-3">{[
      {label:"AMC renewals due",value:expiringAmcs,icon:ClipboardIcon,href:"/dashboard/amc",tone:"bg-amber-50 text-amber-700"},
      {label:"Low-stock parts",value:lowStock,icon:PackageSearch,href:"/dashboard/inventory",tone:"bg-rose-50 text-rose-700"},
      {label:"Open service tickets",value:pending,icon:Wrench,href:"/dashboard/services",tone:"bg-indigo-50 text-indigo-700"},
    ].map(({label,value,icon:Icon,href,tone})=><Link href={href} key={label} className="flex items-center gap-3 rounded-2xl border p-3 transition hover:bg-slate-50"><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-slate-800">{label}</p><p className="text-xs text-slate-400">Needs review</p></div><span className="text-xl font-black">{value}</span></Link>)}</div><Link href="/dashboard/reminders" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-bold text-white">Open follow-up queue <ArrowRight className="size-4" /></Link></section></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><section className="card overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-extrabold">Recent service tickets</h2><p className="text-xs text-slate-500">Latest customer activity</p></div><Link href="/dashboard/services" className="text-sm font-bold text-aqua-700">View all</Link></div><div className="overflow-x-auto"><table className="table"><thead><tr><th>Ticket</th><th>Customer</th><th>Service</th><th>Technician</th><th>Status</th><th>Scheduled</th></tr></thead><tbody>{latestJobs.map(job=><tr key={job.id}><td><Link href={`/dashboard/services/${job.id}`} className="font-bold text-aqua-700">{job.ticketNumber}</Link></td><td className="font-semibold">{job.customer.name}</td><td>{job.serviceType}</td><td>{job.technician?.name||"Unassigned"}</td><td><StatusBadge value={job.status}/></td><td>{formatDate(job.scheduledAt)}</td></tr>)}</tbody></table></div></section><section className="card p-5"><div className="flex items-center justify-between"><h2 className="font-extrabold">Top technicians</h2><Link href="/dashboard/technicians" className="text-sm font-bold text-aqua-700">All</Link></div><div className="mt-4 space-y-4">{technicians.map((tech,index)=><div key={tech.id} className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">{index+1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{tech.name}</p><p className="text-xs text-slate-400">{tech.completedJobs} jobs • {Number(tech.rating).toFixed(1)} rating</p></div><p className="text-sm font-black text-emerald-700">{formatCurrency(Number(tech.revenueGenerated))}</p></div>)}</div></section></div>
  </>;
}

function ClipboardIcon({className}:{className?:string}){return <AlertTriangle className={className}/>}
