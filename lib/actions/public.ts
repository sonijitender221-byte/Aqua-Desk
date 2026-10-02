"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { makeCode } from "@/lib/utils";

export async function publicBookingAction(formData: FormData) {
  const slug = String(formData.get("slug"));
  const business = await db.business.findUnique({ where: { slug }, include: { branches: { where: { isMain: true }, take: 1 } } });
  if (!business) throw new Error("Business not found.");
  const phone = String(formData.get("phone"));
  let customer = await db.customer.findFirst({ where: { businessId: business.id, phone } });
  if (!customer) {
    customer = await db.customer.create({ data: {
      businessId: business.id, customerCode: makeCode("CUS"), name: String(formData.get("name")), phone,
      address: String(formData.get("address")), city: String(formData.get("city") || "") || null,
      customerType: String(formData.get("customerType") || "Residential"), tags: ["Online Booking"],
    } });
  }
  const ticket = await db.serviceRequest.create({ data: {
    businessId: business.id, branchId: business.branches[0]?.id, customerId: customer.id, ticketNumber: makeCode("SRV"),
    serviceType: String(formData.get("serviceType")), problemDescription: String(formData.get("problemDescription")),
    priority: "NORMAL", status: "NEW", preferredDate: formData.get("preferredDate") ? new Date(String(formData.get("preferredDate"))) : null,
    preferredTime: String(formData.get("preferredTime") || ""), serviceFee: Number(formData.get("serviceFee") || 499),
    customerNotes: `Purifier brand: ${String(formData.get("brand") || "Not provided")}`,
    statusHistory: { create: { status: "NEW", changedBy: "Public booking page" } },
  } });
  await db.reminder.create({ data: { businessId: business.id, customerId: customer.id, type: "Booking Confirmation", scheduledAt: new Date(), message: `Hello ${customer.name}, your service request ${ticket.ticketNumber} has been received.`, status: "Scheduled" } });
  redirect(`/${slug}/book/success?ticket=${encodeURIComponent(ticket.ticketNumber)}`);
}
