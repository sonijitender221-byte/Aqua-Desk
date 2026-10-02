import { z } from "zod";

export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
export const registerSchema = z.object({
  businessName: z.string().min(2), ownerName: z.string().min(2), email: z.string().email(),
  phone: z.string().min(8), password: z.string().min(8), city: z.string().min(2), state: z.string().min(2),
});
export const customerSchema = z.object({
  name: z.string().min(2), phone: z.string().min(8), email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(4), city: z.string().optional(), customerType: z.string().default("Residential"), notes: z.string().optional(),
});
export const serviceSchema = z.object({
  customerId: z.string().min(1), purifierUnitId: z.string().optional(), technicianId: z.string().optional(),
  serviceType: z.string().min(2), problemDescription: z.string().min(4), priority: z.enum(["LOW", "NORMAL", "HIGH", "EMERGENCY"]),
  scheduledAt: z.string().optional(), serviceFee: z.coerce.number().min(0), estimatedPartsCost: z.coerce.number().min(0),
});
