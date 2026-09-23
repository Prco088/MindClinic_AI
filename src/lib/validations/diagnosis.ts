import * as z from "zod";

export const diagnosisSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  cidCode: z.string().optional(),
  system: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type DiagnosisFormValues = z.infer<typeof diagnosisSchema>;
