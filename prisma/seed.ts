import { PrismaClient, PaymentMethod, PaymentStatus, Priority, SubscriptionStatus, TicketStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, addMonths, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.customerAmc.deleteMany();
  await prisma.amcPlan.deleteMany();
  await prisma.serviceStatusHistory.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.purifierUnit.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();
  await prisma.subscriptionPlan.deleteMany();

  const starter = await prisma.subscriptionPlan.create({
    data: {
      code: "STARTER", name: "Starter", monthlyPrice: 999, annualPrice: 9990,
      branchLimit: 1, technicianLimit: 2, customerLimit: 500, ticketLimit: 100,
      features: ["Customers", "Service tickets", "Basic AMC", "Invoicing", "Reminders"]
    }
  });
  await prisma.subscriptionPlan.createMany({ data: [
    { code: "GROWTH", name: "Growth", monthlyPrice: 2499, annualPrice: 24990, branchLimit: 3, technicianLimit: 10, customerLimit: 5000, ticketLimit: 999999, features: ["Inventory", "WhatsApp-ready", "Customer portal", "Advanced reports"] },
    { code: "BUSINESS", name: "Business", monthlyPrice: 4999, annualPrice: 49990, branchLimit: 999, technicianLimit: 999, customerLimit: 999999, ticketLimit: 999999, features: ["Multi-branch", "Advanced roles", "API-ready", "Priority support"] }
  ]});

  const business = await prisma.business.create({
    data: {
      name: "PureFlow RO Services", slug: "pureflow-ro-services", ownerName: "Amit Verma",
      email: "owner@aquadesk.app", phone: "+91 98765 43210", address: "Sector 62",
      city: "Noida", state: "Uttar Pradesh", trialEndsAt: addDays(new Date(), 14)
    }
  });
  const passwordHash = await bcrypt.hash("Demo@123", 12);
  await prisma.user.create({ data: { businessId: business.id, name: "Amit Verma", email: "owner@aquadesk.app", phone: "+91 98765 43210", passwordHash, role: UserRole.OWNER } });
  await prisma.subscription.create({ data: { businessId: business.id, planId: starter.id, status: SubscriptionStatus.TRIAL, endsAt: addDays(new Date(), 14) } });

  const mainBranch = await prisma.branch.create({ data: { businessId: business.id, name: "Noida Main Branch", phone: "+91 98765 43210", address: "Sector 62, Noida", city: "Noida", serviceArea: "Noida, Greater Noida", isMain: true } });

  const technicians = await Promise.all([
    ["TECH-001", "Rahul Sharma", "+91 98990 11001", ["Domestic RO", "Installation", "Plumbing"]],
    ["TECH-002", "Imran Khan", "+91 98990 11002", ["Commercial RO", "Electrical repair", "Membrane replacement"]],
    ["TECH-003", "Ajay Kumar", "+91 98990 11003", ["Domestic RO", "UV purifier", "Water softener"]],
    ["TECH-004", "Sandeep Verma", "+91 98990 11004", ["Commercial RO", "Industrial RO", "Installation"]],
  ].map(async ([technicianCode, name, phone, skills], index) => prisma.technician.create({
    data: { businessId: business.id, branchId: mainBranch.id, technicianCode: technicianCode as string, name: name as string, phone: phone as string, skills: skills as string[], serviceArea: index % 2 ? "Greater Noida" : "Noida", rating: 4.5 + index * 0.1, completedJobs: 70 + index * 16, revenueGenerated: 42000 + index * 8300 }
  })));

  const customerData = [
    ["CUS-1001", "Amit Gupta", "+91 98111 11001", "B-1204, Supertech Capetown, Sector 74, Noida", "Residential"],
    ["CUS-1002", "Priya Sharma", "+91 98111 11002", "C-802, ATS Greens, Sector 93, Noida", "Residential"],
    ["CUS-1003", "Neha Singh", "+91 98111 11003", "A-407, Gaur City, Greater Noida", "Residential"],
    ["CUS-1004", "Rakesh Kumar", "+91 98111 11004", "House 32, Sector 50, Noida", "Residential"],
    ["CUS-1005", "Green Valley Restaurant", "+91 98111 11005", "Sector 18 Market, Noida", "Commercial"],
    ["CUS-1006", "Sunrise Hospital", "+91 98111 11006", "Knowledge Park, Greater Noida", "Commercial"],
    ["CUS-1007", "Metro Office Solutions", "+91 98111 11007", "Electronic City, Noida", "Commercial"]
  ];
  const customers = [];
  for (const [customerCode, name, phone, address, customerType] of customerData) {
    customers.push(await prisma.customer.create({ data: { businessId: business.id, customerCode, name, phone, address, city: "Noida", customerType, tags: customerType === "Commercial" ? ["Commercial Customer", "High-Value Customer"] : ["AMC Customer"], totalSpending: customerType === "Commercial" ? 18000 : 4200 } }));
  }

  const purifiers = [];
  const brands = ["Kent", "Aquaguard", "Livpure", "Pureit", "Blue Star", "Ion Exchange", "AO Smith"];
  for (let i = 0; i < customers.length; i++) {
    purifiers.push(await prisma.purifierUnit.create({ data: { businessId: business.id, customerId: customers[i].id, purifierCode: `RO-${String(i+1).padStart(4, "0")}`, brand: brands[i], model: i % 2 ? "Aura RO+UV" : "Grand Plus", purifierType: i >= 4 ? "Commercial RO plant" : "RO + UV + UF", installationDate: subDays(new Date(), 200 + i * 32), lastServiceDate: subDays(new Date(), 35 + i * 4), nextServiceDate: addDays(new Date(), 40 + i * 6), currentTds: 72 + i * 4, previousTds: 88 + i * 3, storageCapacity: i >= 4 ? "100 LPH" : "8 Litres", membraneType: "75 GPD" } }));
  }

  const serviceTypes = ["General service", "Filter replacement", "Leakage issue", "AMC visit", "High TDS", "Installation", "Membrane replacement"];
  const statuses = [TicketStatus.COMPLETED, TicketStatus.ASSIGNED, TicketStatus.NEW, TicketStatus.IN_PROGRESS, TicketStatus.PAYMENT_PENDING, TicketStatus.CONFIRMED, TicketStatus.WAITING_FOR_PART];
  for (let i = 0; i < 18; i++) {
    const c = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    const ticket = await prisma.serviceRequest.create({ data: {
      businessId: business.id, branchId: mainBranch.id, customerId: c.id, purifierUnitId: purifiers[i % purifiers.length].id,
      technicianId: technicians[i % technicians.length].id, ticketNumber: `SRV-${2026001+i}`, serviceType: serviceTypes[i % serviceTypes.length],
      problemDescription: i % 3 === 0 ? "Water flow is low and filters may need replacement." : "Scheduled purifier inspection and preventive maintenance.",
      priority: i % 6 === 0 ? Priority.HIGH : Priority.NORMAL, status, scheduledAt: addDays(new Date(), (i % 7) - 3), serviceFee: 499 + (i % 4) * 150,
      estimatedPartsCost: i % 2 ? 850 : 0, paymentStatus: status === TicketStatus.COMPLETED ? PaymentStatus.PAID : PaymentStatus.UNPAID,
      completedAt: status === TicketStatus.COMPLETED ? subDays(new Date(), i % 3) : null,
    }});
    await prisma.serviceStatusHistory.create({ data: { serviceRequestId: ticket.id, status, changedBy: "Seed data" } });
  }

  const basicPlan = await prisma.amcPlan.create({ data: { businessId: business.id, name: "Basic AMC", durationMonths: 12, price: 2499, freeServices: 3, serviceFrequencyDays: 120, includedFilters: false, terms: "Three preventive service visits. Parts billed separately." } });
  const premiumPlan = await prisma.amcPlan.create({ data: { businessId: business.id, name: "Premium AMC", durationMonths: 12, price: 5999, freeServices: 4, serviceFrequencyDays: 90, includedFilters: true, includedMembrane: true, emergencyVisits: 2, terms: "Four service visits with standard filters and one membrane replacement." } });
  for (let i = 0; i < 5; i++) {
    const plan = i < 3 ? basicPlan : premiumPlan;
    await prisma.customerAmc.create({ data: { businessId: business.id, customerId: customers[i].id, purifierUnitId: purifiers[i].id, planId: plan.id, amcNumber: `AMC-${2026100+i}`, startDate: subDays(new Date(), 200-i*10), expiryDate: addDays(new Date(), 45+i*35), amount: plan.price, paymentStatus: PaymentStatus.PAID, servicesIncluded: plan.freeServices, servicesUsed: i % 3, nextVisitAt: addDays(new Date(), 25+i*10) } });
  }

  const items = [
    ["FLT-SED-10", "10-inch Sediment Filter", "Filters", 95, 250, 4],
    ["FLT-CARB-10", "Pre Carbon Filter", "Filters", 180, 450, 18],
    ["MEM-75-GPD", "75 GPD RO Membrane", "Membranes", 950, 1900, 3],
    ["PUMP-100", "100 GPD Booster Pump", "Pumps", 1150, 2250, 7],
    ["SMPS-24V", "24V RO SMPS", "Electrical", 420, 950, 12],
    ["UV-11W", "11W UV Lamp", "UV Parts", 310, 750, 2],
    ["SV-24V", "24V Solenoid Valve", "Valves", 260, 600, 9]
  ];
  for (const [sku, name, category, purchasePrice, sellingPrice, currentStock] of items) {
    const item = await prisma.inventoryItem.create({ data: { businessId: business.id, branchId: mainBranch.id, sku: sku as string, name: name as string, category: category as string, purchasePrice: Number(purchasePrice), sellingPrice: Number(sellingPrice), currentStock: Number(currentStock), minimumStock: 5, reorderQuantity: 15, supplier: "Aqua Parts India" } });
    await prisma.inventoryMovement.create({ data: { inventoryItemId: item.id, type: "PURCHASE", quantity: Number(currentStock), reference: "OPENING-STOCK" } });
  }

  const completed = await prisma.serviceRequest.findMany({ where: { businessId: business.id, status: TicketStatus.COMPLETED }, take: 3, include: { customer: true } });
  for (let i=0; i<completed.length; i++) {
    const subtotal = 999 + i * 450;
    const tax = Math.round(subtotal * 0.18);
    const invoice = await prisma.invoice.create({ data: { businessId: business.id, customerId: completed[i].customerId, serviceRequestId: completed[i].id, invoiceNumber: `INV-2026-${1001+i}`, subtotal, tax, total: subtotal+tax, paidAmount: subtotal+tax, balanceAmount: 0, paymentStatus: PaymentStatus.PAID, items: { create: [{ description: completed[i].serviceType, quantity: 1, unitPrice: subtotal, taxRate: 18, total: subtotal }] } } });
    await prisma.payment.create({ data: { businessId: business.id, invoiceId: invoice.id, amount: subtotal+tax, method: i % 2 ? PaymentMethod.UPI : PaymentMethod.CASH, reference: i % 2 ? `UPI-DEMO-${i}` : undefined } });
  }

  await prisma.expense.createMany({ data: [
    { businessId: business.id, category: "Fuel", description: "Technician travel fuel", amount: 6200, incurredAt: subDays(new Date(), 3) },
    { businessId: business.id, category: "Inventory", description: "Filters and membrane purchase", amount: 18400, incurredAt: subDays(new Date(), 7) },
    { businessId: business.id, category: "Salary", description: "Technician advance", amount: 28000, incurredAt: subDays(new Date(), 10) }
  ]});

  for (let i=0; i<4; i++) await prisma.reminder.create({ data: { businessId: business.id, customerId: customers[i].id, type: i%2 ? "AMC Expiry" : "Next Service", scheduledAt: addDays(new Date(), 3+i*2), message: `Hello ${customers[i].name}, your RO ${i%2 ? "AMC renewal" : "service"} is due soon.`, status: "Scheduled" } });

  console.log("AquaDesk demo database seeded.");
  console.log("Login: owner@aquadesk.app / Demo@123");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
