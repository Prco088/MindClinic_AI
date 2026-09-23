"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { diagnosisSchema, DiagnosisFormValues } from "@/lib/validations/diagnosis";
import { createDiagnosis, updateDiagnosis } from "@/app/actions/diagnosis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DiagnosisFormProps {
  patientId: string;
  initialData?: Partial<DiagnosisFormValues> & { id?: string };
  onSuccess?: () => void;
}

export function DiagnosisForm({ patientId, initialData, onSuccess }: DiagnosisFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<DiagnosisFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(diagnosisSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      cidCode: initialData?.cidCode || "",
      system: initialData?.system || "",
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  async function onSubmit(data: DiagnosisFormValues) {
    try {
      setIsPending(true);
      if (initialData?.id) {
        await updateDiagnosis(initialData.id, data);
        toast.success("Diagnóstico atualizado");
      } else {
        await createDiagnosis(patientId, data);
        toast.success("Diagnóstico criado");
      }
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Transtorno de Ansiedade Generalizada" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cidCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: F41.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="system"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sistema</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: CID-10, DSM-5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição / Notas</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {initialData?.id && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Diagnóstico Ativo</FormLabel>
                </div>
              </FormItem>
            )}
          />
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </form>
    </Form>
  );
}
