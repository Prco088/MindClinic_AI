import { z } from "zod";

export const anamnesisSchema = z.object({
  mainComplaint: z.string().min(1, "A queixa principal é obrigatória"),
  currentHistory: z.string().min(1, "A história atual é obrigatória"),
  familyHistory: z.string().optional(),
  medicalHistory: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

export type AnamnesisFormValues = z.infer<typeof anamnesisSchema>;
