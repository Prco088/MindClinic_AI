"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { anamnesisSchema, AnamnesisFormValues } from "@/lib/validations/anamnesis";
import { createAnamnesis, updateAnamnesis } from "@/app/actions/anamnesis";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AnamnesisFormProps {
  patientId: string;
  initialData?: {
    id: string;
    formData: unknown;
  } | null;
}

export function AnamnesisForm({ patientId, initialData }: AnamnesisFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  // Cast para unknown e depois para o tipo correto para extrair defaultValues com segurança.
  const parsedFormData = initialData?.formData as Partial<AnamnesisFormValues> | undefined;

  const form = useForm<AnamnesisFormValues>({
    resolver: zodResolver(anamnesisSchema),
    defaultValues: {
      mainComplaint: parsedFormData?.mainComplaint || "",
      currentHistory: parsedFormData?.currentHistory || "",
      familyHistory: parsedFormData?.familyHistory || "",
      medicalHistory: parsedFormData?.medicalHistory || "",
      medications: parsedFormData?.medications || "",
      allergies: parsedFormData?.allergies || "",
      notes: parsedFormData?.notes || "",
    },
  });

  async function onSubmit(data: AnamnesisFormValues) {
    try {
      setIsPending(true);
      if (initialData?.id) {
        await updateAnamnesis(initialData.id, patientId, data);
        toast.success("Anamnese atualizada", {
          description: "Os dados foram salvos com sucesso.",
        });
      } else {
        await createAnamnesis(patientId, data);
        toast.success("Anamnese criada", {
          description: "Os dados foram salvos com sucesso.",
        });
      }
      router.refresh();
    } catch (error: unknown) {
      toast.error("Erro ao salvar", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="mainComplaint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Queixa Principal *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Qual o motivo principal da consulta?"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currentHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>História Atual da Doença *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o início, evolução e sintomas atuais..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="familyHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Histórico Familiar</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Doenças crônicas, transtornos mentais na família..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medicalHistory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Histórico Médico Pregresso</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Cirurgias, internações, doenças pré-existentes..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="medications"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicamentos em Uso</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Liste os medicamentos, doses e horários..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alergias</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Alergias alimentares, medicamentosas..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Gerais / Exame Mental</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Anamnese
          </Button>
        </div>
      </form>
    </Form>
  );
}
