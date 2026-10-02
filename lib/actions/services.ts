"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { serviceSchema } from "@/lib/validations";
import { makeCode } from "@/lib/utils";
import type { TicketStatus } from "@prisma/client";

export async function createService(formData: FormData) {
  const session = await requireSession();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Invalid service request");
  const data = parsed.data;
  const branch = await db.branch.findFirst({ where: { businessId: session.businessId, isMain: true } });
  const ticket = await db.serviceRequest.create({ data: { businessId: session.businessId, branchId: branch?.id, customerId: data.customerId, purifierUnitId: data.purifierUnitId || null, technicianId: data.technicianId || null, ticketNumber: makeCode("SRV"), serviceType: data.serviceType, problemDescription: data.problemDescription, priority: data.priority, status: data.technicianId ? "ASSIGNED" : "NEW", scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null, serviceFee: data.serviceFee, estimatedPartsCost: data.estimatedPartsCost, statusHistory: { create: { status: data.technicianId ? "ASSIGNED" : "NEW", changedBy: session.name } } } });
  await db.reminder.create({ data: { businessId: session.businessId, customerId: data.customerId, type: "Service Booking", scheduledAt: new Date(), message: `Your service request ${ticket.ticketNumber} has been created.`, status: "Scheduled" } });
  revalidatePath("/dashboard/services");
  redirect(`/dashboard/services/${ticket.id}`);
}

export async function updateServiceStatus(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as TicketStatus;
  const completed = status === "COMPLETED";
  await db.$transaction(async (tx) => {
    const service = await tx.serviceRequest.update({ where: { id, businessId: session.businessId }, data: { status, completedAt: completed ? new Date() : undefined, paymentStatus: status === "PAYMENT_PENDING" ? "UNPAID" : undefined } });
    await tx.serviceStatusHistory.create({ data: { serviceRequestId: id, status, changedBy: session.name } });
    if (completed && service.technicianId) await tx.technician.update({ where: { id: service.technicianId }, data: { completedJobs: { increment: 1 }, revenueGenerated: { increment: service.serviceFee } } });
  });
  revalidatePath(`/dashboard/services/${id}`);
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
}

export async function assignTechnician(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id"));
  const technicianId = String(formData.get("technicianId"));
  await db.$transaction(async (tx) => {
    await tx.serviceRequest.update({ where: { id, businessId: session.businessId }, data: { technicianId, status: "ASSIGNED" } });
    await tx.serviceStatusHistory.create({ data: { serviceRequestId: id, status: "ASSIGNED", note: "Technician assigned", changedBy: session.name } });
  });
  revalidatePath(`/dashboard/services/${id}`);
  revalidatePath("/dashboard/services");
}

export async function completeService(formData: FormData) {
  const session = await requireSession();
  const id = String(formData.get("id"));
  const beforeTds = Number(formData.get("beforeTds") || 0) || null;
  const afterTds = Number(formData.get("afterTds") || 0) || null;
  const partId = String(formData.get("partId") || "");
  const partQty = Math.max(0, Number(formData.get("partQty") || 0));
  const notes = String(formData.get("notes") || "");
  const checked = formData.getAll("checklist").map(String);

  await db.$transaction(async (tx) => {
    const service = await tx.serviceRequest.findFirstOrThrow({
      where: { id, businessId: session.businessId },
      include: { customer: true, purifierUnit: true, invoice: true },
    });
    let part: { id: string; name: string; sellingPrice: unknown; currentStock: number } | null = null;
    if (partId && partQty > 0) {
      part = await tx.inventoryItem.findFirstOrThrow({ where: { id: partId, businessId: session.businessId } });
      if (part.currentStock < partQty) throw new Error(`Only ${part.currentStock} units of ${part.name} are available.`);
      await tx.inventoryItem.update({ where: { id: part.id }, data: { currentStock: { decrement: partQty } } });
      await tx.inventoryMovement.create({ data: { inventoryItemId: part.id, type: "SERVICE_USAGE", quantity: -partQty, reference: service.ticketNumber, note: `Used for ${service.customer.name}` } });
    }
    const partsTotal = part ? Number(part.sellingPrice) * partQty : 0;
    const subtotal = Number(service.serviceFee) + partsTotal;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = subtotal + tax;
    if (!service.invoice) {
      await tx.invoice.create({ data: {
        businessId: session.businessId, customerId: service.customerId, serviceRequestId: service.id,
        invoiceNumber: makeCode("INV"), subtotal, tax, total, paidAmount: 0, balanceAmount: total,
        paymentStatus: "UNPAID", notes,
        items: { create: [
          { description: service.serviceType, quantity: 1, unitPrice: service.serviceFee, taxRate: 18, total: service.serviceFee },
          ...(part ? [{ inventoryItemId: part.id, description: part.name, quantity: partQty, unitPrice: Number(part.sellingPrice), taxRate: 18, total: partsTotal }] : []),
        ] },
      } });
    }
    const nextServiceDate = new Date(); nextServiceDate.setDate(nextServiceDate.getDate() + 90);
    await tx.serviceRequest.update({ where: { id }, data: { status: "COMPLETED", completedAt: new Date(), beforeTds, afterTds, internalNotes: notes, checklist: checked, paymentStatus: "UNPAID" } });
    await tx.serviceStatusHistory.create({ data: { serviceRequestId: id, status: "COMPLETED", note: "Checklist completed and invoice generated", changedBy: session.name } });
    await tx.customer.update({ where: { id: service.customerId }, data: { lastServiceDate: new Date(), nextServiceDate } });
    if (service.purifierUnitId) await tx.purifierUnit.update({ where: { id: service.purifierUnitId }, data: { previousTds: beforeTds, currentTds: afterTds, lastServiceDate: new Date(), nextServiceDate } });
    if (service.technicianId) await tx.technician.update({ where: { id: service.technicianId }, data: { completedJobs: { increment: 1 }, revenueGenerated: { increment: total } } });
    await tx.reminder.create({ data: { businessId: session.businessId, customerId: service.customerId, type: "Next Service", channel: "WhatsApp", scheduledAt: nextServiceDate, message: `Hello ${service.customer.name}, your next RO service is due today.`, status: "Scheduled" } });
  });
  revalidatePath(`/dashboard/services/${id}`);
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard");
}
