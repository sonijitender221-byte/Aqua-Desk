"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { loginAction, registerAction, type AuthState } from "@/lib/actions/auth";

const initialState: AuthState = {};

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return <button className="btn-primary w-full" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />}{label}</button>;
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return <form action={action} className="space-y-4">
    <label><span className="label">Email address</span><input className="input" name="email" type="email" placeholder="owner@aquadesk.app" required /></label>
    <label><span className="label">Password</span><input className="input" name="password" type="password" placeholder="••••••••" required /></label>
    {state.error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{state.error}</p>}
    <SubmitButton pending={pending} label="Sign in to AquaDesk" />
    <p className="text-center text-sm text-slate-500">New business? <Link href="/register" className="font-semibold text-aqua-700 hover:underline">Start free trial</Link></p>
  </form>;
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  return <form action={action} className="grid gap-4 sm:grid-cols-2">
    <label><span className="label">Business name</span><input className="input" name="businessName" placeholder="PureFlow RO Services" required /></label>
    <label><span className="label">Owner name</span><input className="input" name="ownerName" placeholder="Amit Verma" required /></label>
    <label><span className="label">Business email</span><input className="input" name="email" type="email" placeholder="owner@company.com" required /></label>
    <label><span className="label">Phone</span><input className="input" name="phone" placeholder="+91 98765 43210" required /></label>
    <label><span className="label">City</span><input className="input" name="city" placeholder="Noida" required /></label>
    <label><span className="label">State</span><input className="input" name="state" placeholder="Uttar Pradesh" required /></label>
    <label className="sm:col-span-2"><span className="label">Create password</span><input className="input" name="password" type="password" minLength={8} placeholder="Minimum 8 characters" required /></label>
    {state.error && <p className="sm:col-span-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{state.error}</p>}
    <div className="sm:col-span-2"><SubmitButton pending={pending} label="Create 14-day free trial" /></div>
    <p className="sm:col-span-2 text-center text-sm text-slate-500">Already registered? <Link href="/login" className="font-semibold text-aqua-700 hover:underline">Sign in</Link></p>
  </form>;
}
