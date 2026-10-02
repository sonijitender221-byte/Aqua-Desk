"use client";
import { Printer } from "lucide-react";
export function PrintButton(){return <button onClick={()=>window.print()} className="btn-secondary print:hidden"><Printer className="size-4"/>Print / Save PDF</button>}
