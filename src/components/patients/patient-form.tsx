"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "@/lib/validations/patient";
import { z } from "zod";

type PatientFormInput = z.input<typeof patientSchema>;
type PatientFormOutput = z.infer<typeof patientSchema>;
import { createPatient, updatePatient } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PatientFormProps {
  initialData?: PatientFormInput & { id?: string };
}

export function PatientForm({ initialData }: PatientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormInput>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData || {
      fullName: "",
      preferredName: "",
      cpf: "",
      rg: "",
      phone: "",
      email: "",
      occupation: "",
      maritalStatus: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      notes: "",
      isActive: true,
    },
  });

  const onSubmit = (data: PatientFormInput) => {
    setError(null);
    startTransition(async () => {
      try {
        if (initialData?.id) {
          await updatePatient(initialData.id, data as PatientFormOutput);
        } else {
          await createPatient(data as PatientFormOutput);
        }
        router.push("/patients");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro ao salvar o paciente.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome Completo *</Label>
          <Input id="fullName" {...register("fullName")} disabled={isPending} />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredName">Nome Social / Apelido</Label>
          <Input id="preferredName" {...register("preferredName")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...register("cpf")} disabled={isPending} placeholder="Apenas números" />
          {errors.cpf && <p className="text-sm text-red-500">{errors.cpf.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input id="rg" {...register("rg")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register("phone")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} disabled={isPending} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Profissão</Label>
          <Input id="occupation" {...register("occupation")} disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Estado Civil</Label>
          <Input id="maritalStatus" {...register("maritalStatus")} disabled={isPending} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço Completo</Label>
        <Input id="address" {...register("address")} disabled={isPending} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContactName">Contato de Emergência (Nome)</Label>
          <Input id="emergencyContactName" {...register("emergencyContactName")} disabled={isPending} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyContactPhone">Contato de Emergência (Telefone)</Label>
          <Input id="emergencyContactPhone" {...register("emergencyContactPhone")} disabled={isPending} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações Iniciais</Label>
        <Textarea id="notes" {...register("notes")} disabled={isPending} rows={4} />
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" disabled={isPending} onClick={() => router.push("/patients")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar Paciente"}
        </Button>
      </div>
    </form>
  );
}
