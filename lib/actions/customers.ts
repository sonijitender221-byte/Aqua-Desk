"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { customerSchema } from "@/lib/validations";
import { makeCode } from "@/lib/utils";

export async function createCustomer(formData: FormData) {
  const session = await requireSession();
  const parsed = customerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid customer data");
  const data = parsed.data;
  const duplicate = await db.customer.findFirst({ where: { businessId: session.businessId, phone: data.phone } });
  if (duplicate) throw new Error("A customer with this phone number already exists.");
  const customer = await db.customer.create({ data: { businessId: session.businessId, customerCode: makeCode("CUS"), name: data.name, phone: data.phone, email: data.email || null, address: data.address, city: data.city || null, customerType: data.customerType, notes: data.notes || null, tags: data.customerType === "Commercial" ? ["Commercial Customer"] : ["New Customer"] } });
  await db.auditLog.create({ data: { businessId: session.businessId, userId: session.userId, action: "CREATE", entity: "Customer", entityId: customer.id } });
  revalidatePath("/dashboard/customers");
  redirect(`/dashboard/customers/${customer.id}`);
}

export async function deleteCustomer(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id"));
  await db.customer.delete({ where: { id, businessId: session.businessId } });
  revalidatePath("/dashboard/customers");
}

export async function createPurifier(formData: FormData) {
  const session = await requireSession();
  const customerId = String(formData.get("customerId"));
  await db.purifierUnit.create({ data: { businessId: session.businessId, customerId, purifierCode: makeCode("RO"), brand: String(formData.get("brand")), model: String(formData.get("model") || ""), purifierType: String(formData.get("purifierType")), serialNumber: String(formData.get("serialNumber") || "") || null, currentTds: Number(formData.get("currentTds") || 0) || null, installationDate: formData.get("installationDate") ? new Date(String(formData.get("installationDate"))) : null, nextServiceDate: formData.get("nextServiceDate") ? new Date(String(formData.get("nextServiceDate"))) : null } });
  revalidatePath(`/dashboard/customers/${customerId}`);
}
