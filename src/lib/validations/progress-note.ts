import * as z from "zod";

export const progressNoteSchema = z.object({
  sessionDate: z.date({
    required_error: "A data da sessão é obrigatória",
  }),
  content: z.string().min(5, "A evolução deve ter pelo menos 5 caracteres"),
  clinicalAssessment: z.string().optional(),
  therapeuticPlan: z.string().optional(),
  observations: z.string().optional(),
});

export type ProgressNoteFormValues = z.infer<typeof progressNoteSchema>;

export const progressNoteAddendumSchema = z.object({
  content: z.string().min(5, "O adendo deve ter pelo menos 5 caracteres"),
});

export type ProgressNoteAddendumFormValues = z.infer<typeof progressNoteAddendumSchema>;
