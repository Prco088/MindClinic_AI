import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório e deve ter no mínimo 3 caracteres."),
  preferredName: z.string().optional().nullable(),
  birthDate: z.date({
    required_error: "Data de nascimento é obrigatória.",
    invalid_type_error: "Data de nascimento inválida.",
  }).optional().nullable().or(z.string().transform(str => str ? new Date(str) : null).optional().nullable()),
  gender: z.string().optional().nullable(),
  cpf: z.string().regex(/^\d{11}$/, "O CPF deve conter exatamente 11 dígitos numéricos.").optional().or(z.literal('')).nullable(),
  rg: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido.").optional().or(z.literal('')).nullable(),
  occupation: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
