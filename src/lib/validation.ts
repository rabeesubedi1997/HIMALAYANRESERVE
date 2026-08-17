import { z } from "zod";

export const allocationSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(190),
  phone: z.string().trim().min(6, "Please enter a valid phone / WhatsApp number").max(60),
  countryCity: z.string().trim().min(2, "Please enter country / city").max(120),
  inquiryType: z.enum(["private_collection", "royal_gifting", "atmosphere_reservation"]),
  message: z.string().trim().max(2000).optional().default(""),
  channel: z.enum(["form", "whatsapp", "mailto"]).default("form"),
});

export type AllocationInput = z.infer<typeof allocationSchema>;