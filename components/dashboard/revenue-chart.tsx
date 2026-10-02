"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: { label: string; revenue: number }[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{left:-20,right:8,top:8,bottom:0}}><defs><linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0891b2" stopOpacity={0.32}/><stop offset="95%" stopColor="#0891b2" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#64748b"}} /><YAxis axisLine={false} tickLine={false} tick={{fontSize:12,fill:"#64748b"}} /><Tooltip contentStyle={{borderRadius:12,border:"1px solid #e2e8f0"}} formatter={(value)=>[`₹${Number(value).toLocaleString("en-IN")}`,"Revenue"]} /><Area type="monotone" dataKey="revenue" stroke="#0891b2" strokeWidth={3} fill="url(#fillRevenue)" /></AreaChart></ResponsiveContainer></div>;
}
