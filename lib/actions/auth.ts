"use server";

import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations";

export type AuthState = { error?: string };

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.active || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return { error: "Email or password is incorrect." };
  await createSession({ userId: user.id, businessId: user.businessId, name: user.name, email: user.email, role: user.role });
  redirect("/dashboard");
}

export async function registerAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Please check the form." };
  const data = parsed.data;
  const existing = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) return { error: "An account already exists with this email." };
  const slugBase = data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = `${slugBase}-${Date.now().toString().slice(-5)}`;
  const starter = await db.subscriptionPlan.findUnique({ where: { code: "STARTER" } });
  if (!starter) return { error: "Subscription plans are not seeded. Run npm run db:seed." };
  const passwordHash = await bcrypt.hash(data.password, 12);
  const business = await db.business.create({
    data: {
      name: data.businessName, slug, ownerName: data.ownerName, email: data.email.toLowerCase(), phone: data.phone,
      city: data.city, state: data.state, trialEndsAt: addDays(new Date(), 14),
      branches: { create: { name: `${data.city} Main Branch`, city: data.city, isMain: true } },
      users: { create: { name: data.ownerName, email: data.email.toLowerCase(), phone: data.phone, passwordHash, role: "OWNER" } },
      subscriptions: { create: { planId: starter.id, status: "TRIAL", endsAt: addDays(new Date(), 14) } },
    }, include: { users: true }
  });
  const user = business.users[0];
  await createSession({ userId: user.id, businessId: business.id, name: user.name, email: user.email, role: user.role });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
