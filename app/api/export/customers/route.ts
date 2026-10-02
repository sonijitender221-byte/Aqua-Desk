import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

function csvCell(value: unknown) { const text=String(value??""); return `"${text.replaceAll('"','""')}"`; }
export async function GET(){const session=await getSession();if(!session?.businessId)return NextResponse.json({error:"Unauthorized"},{status:401});const rows=await db.customer.findMany({where:{businessId:session.businessId},orderBy:{name:"asc"}});const csv=[["Customer Code","Name","Phone","Email","Type","Address","City","Next Service","Total Spending"],...rows.map(r=>[r.customerCode,r.name,r.phone,r.email||"",r.customerType,r.address,r.city||"",r.nextServiceDate?.toISOString()||"",String(r.totalSpending)])].map(row=>row.map(csvCell).join(",")).join("\n");return new NextResponse(csv,{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":"attachment; filename=aquadesk-customers.csv"}})}
