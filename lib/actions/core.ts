"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { makeCode } from "@/lib/utils";

export async function createTechnician(formData: FormData) {
  const session = await requireSession();
  const branch = await db.branch.findFirst({ where: { businessId: session.businessId, isMain: true } });
  await db.technician.create({ data: { businessId: session.businessId, branchId: branch?.id, technicianCode: makeCode("TECH"), name: String(formData.get("name")), phone: String(formData.get("phone")), email: String(formData.get("email") || "") || null, serviceArea: String(formData.get("serviceArea") || ""), skills: String(formData.get("skills") || "Domestic RO").split(",").map((v) => v.trim()).filter(Boolean), commissionPct: Number(formData.get("commissionPct") || 0) } });
  revalidatePath("/dashboard/technicians");
}

export async function createInventoryItem(formData: FormData) {
  const session = await requireSession();
  const branch = await db.branch.findFirst({ where: { businessId: session.businessId, isMain: true } });
  const stock = Number(formData.get("currentStock") || 0);
  await db.inventoryItem.create({ data: { businessId: session.businessId, branchId: branch?.id, sku: String(formData.get("sku")), name: String(formData.get("name")), category: String(formData.get("category")), supplier: String(formData.get("supplier") || ""), purchasePrice: Number(formData.get("purchasePrice") || 0), sellingPrice: Number(formData.get("sellingPrice") || 0), currentStock: stock, minimumStock: Number(formData.get("minimumStock") || 5), reorderQuantity: Number(formData.get("reorderQuantity") || 10), movements: { create: stock > 0 ? { type: "PURCHASE", quantity: stock, reference: "OPENING-STOCK" } : undefined } } });
  revalidatePath("/dashboard/inventory");
}

export async function adjustInventory(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id"));
  const quantity = Number(formData.get("quantity"));
  if (!quantity) return;
  await db.$transaction(async (tx) => {
    await tx.inventoryItem.update({ where: { id, businessId: session.businessId }, data: { currentStock: { increment: quantity } } });
    await tx.inventoryMovement.create({ data: { inventoryItemId: id, type: "ADJUSTMENT", quantity, note: String(formData.get("note") || "Manual adjustment") } });
  });
  revalidatePath("/dashboard/inventory");
}

export async function createAmcPlan(formData: FormData) {
  const session = await requireSession();
  await db.amcPlan.create({ data: { businessId: session.businessId, name: String(formData.get("name")), durationMonths: Number(formData.get("durationMonths") || 12), price: Number(formData.get("price") || 0), freeServices: Number(formData.get("freeServices") || 3), serviceFrequencyDays: Number(formData.get("serviceFrequencyDays") || 90), includedFilters: formData.get("includedFilters") === "on", includedMembrane: formData.get("includedMembrane") === "on", emergencyVisits: Number(formData.get("emergencyVisits") || 0), terms: String(formData.get("terms") || "") } });
  revalidatePath("/dashboard/amc");
}

export async function createCustomerAmc(formData: FormData) {
  const session = await requireSession();
  const planId = String(formData.get("planId"));
  const customerId = String(formData.get("customerId"));
  const purifierUnitId = String(formData.get("purifierUnitId"));
  const plan = await db.amcPlan.findFirstOrThrow({ where: { id: planId, businessId: session.businessId } });
  const startDate = new Date(String(formData.get("startDate")));
  const expiryDate = new Date(startDate);
  expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);
  await db.customerAmc.create({ data: { businessId: session.businessId, customerId, purifierUnitId, planId, amcNumber: makeCode("AMC"), startDate, expiryDate, amount: plan.price, servicesIncluded: plan.freeServices, paymentStatus: "PAID", nextVisitAt: new Date(startDate.getTime() + plan.serviceFrequencyDays * 86400000) } });
  revalidatePath("/dashboard/amc");
}

export async function createInvoice(formData: FormData) {
  const session = await requireSession();
  const customerId = String(formData.get("customerId"));
  const description = String(formData.get("description"));
  const subtotal = Number(formData.get("subtotal") || 0);
  const taxRate = Number(formData.get("taxRate") || 18);
  const discount = Number(formData.get("discount") || 0);
  const tax = Math.round((subtotal - discount) * taxRate / 100 * 100) / 100;
  const total = subtotal - discount + tax;
  await db.invoice.create({ data: { businessId: session.businessId, customerId, invoiceNumber: makeCode("INV"), subtotal, discount, tax, total, paidAmount: 0, balanceAmount: total, paymentStatus: "UNPAID", items: { create: { description, quantity: 1, unitPrice: subtotal, taxRate, total: subtotal } } } });
  revalidatePath("/dashboard/invoices");
}

export async function recordPayment(formData: FormData) {
  const session = await requireSession();
  const invoiceId = String(formData.get("invoiceId"));
  const amount = Number(formData.get("amount") || 0);
  const method = String(formData.get("method")) as "CASH" | "UPI" | "BANK_TRANSFER" | "CARD" | "WALLET" | "CHEQUE" | "PAYMENT_LINK" | "OTHER";
  await db.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirstOrThrow({ where: { id: invoiceId, businessId: session.businessId } });
    const paid = Number(invoice.paidAmount) + amount;
    const balance = Math.max(0, Number(invoice.total) - paid);
    await tx.payment.create({ data: { businessId: session.businessId, invoiceId, amount, method, reference: String(formData.get("reference") || "") || null } });
    await tx.invoice.update({ where: { id: invoiceId }, data: { paidAmount: paid, balanceAmount: balance, paymentStatus: balance === 0 ? "PAID" : "PARTIAL" } });
  });
  revalidatePath("/dashboard/invoices");
}

export async function createComplaint(formData: FormData) {
  const session = await requireSession();
  await db.complaint.create({ data: {
    businessId: session.businessId,
    customerId: String(formData.get("customerId")),
    serviceRequestId: String(formData.get("serviceRequestId") || "") || null,
    technicianId: String(formData.get("technicianId") || "") || null,
    complaintNumber: makeCode("CMP"),
    category: String(formData.get("category")),
    description: String(formData.get("description")),
    priority: String(formData.get("priority") || "NORMAL") as "LOW" | "NORMAL" | "HIGH" | "EMERGENCY",
  } });
  revalidatePath("/dashboard/complaints");
}

export async function resolveComplaint(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id"));
  await db.complaint.update({ where: { id, businessId: session.businessId }, data: { status: "Resolved", resolutionNotes: String(formData.get("resolutionNotes") || "Resolved by manager"), resolvedAt: new Date() } });
  revalidatePath("/dashboard/complaints");
}

export async function createReminder(formData: FormData) {
  const session = await requireSession();
  await db.reminder.create({ data: {
    businessId: session.businessId,
    customerId: String(formData.get("customerId")),
    type: String(formData.get("type")),
    channel: String(formData.get("channel") || "WhatsApp"),
    scheduledAt: new Date(String(formData.get("scheduledAt"))),
    message: String(formData.get("message")),
  } });
  revalidatePath("/dashboard/reminders");
}

export async function createBranch(formData: FormData) {
  const session = await requireSession();
  await db.branch.create({ data: {
    businessId: session.businessId,
    name: String(formData.get("name")),
    phone: String(formData.get("phone") || "") || null,
    address: String(formData.get("address") || "") || null,
    city: String(formData.get("city") || "") || null,
    serviceArea: String(formData.get("serviceArea") || "") || null,
  } });
  revalidatePath("/dashboard/branches");
}

export async function updateBusinessSettings(formData: FormData) {
  const session = await requireSession();
  await db.business.update({ where: { id: session.businessId }, data: {
    name: String(formData.get("name")),
    ownerName: String(formData.get("ownerName")),
    email: String(formData.get("email")),
    phone: String(formData.get("phone")),
    address: String(formData.get("address") || "") || null,
    city: String(formData.get("city") || "") || null,
    state: String(formData.get("state") || "") || null,
    gstNumber: String(formData.get("gstNumber") || "") || null,
    currency: String(formData.get("currency") || "INR"),
    language: String(formData.get("language") || "en"),
    timezone: String(formData.get("timezone") || "Asia/Kolkata"),
  } });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}

export async function createExpense(formData: FormData) {
  const session = await requireSession();
  await db.expense.create({ data: {
    businessId: session.businessId,
    category: String(formData.get("category")),
    description: String(formData.get("description")),
    amount: Number(formData.get("amount") || 0),
    incurredAt: formData.get("incurredAt") ? new Date(String(formData.get("incurredAt"))) : new Date(),
  } });
  revalidatePath("/dashboard/reports");
}
