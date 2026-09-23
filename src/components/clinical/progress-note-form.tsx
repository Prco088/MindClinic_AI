"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { progressNoteSchema, ProgressNoteFormValues } from "@/lib/validations/progress-note";
import { createProgressNote, updateProgressNote } from "@/app/actions/progress-note";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProgressNoteFormProps {
  patientId: string;
  initialData?: Partial<ProgressNoteFormValues> & { id?: string };
  onSuccess?: () => void;
}

export function ProgressNoteForm({ patientId, initialData, onSuccess }: ProgressNoteFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProgressNoteFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(progressNoteSchema) as any,
    defaultValues: {
      sessionDate: initialData?.sessionDate ? new Date(initialData.sessionDate) : new Date(),
      content: initialData?.content || "",
      clinicalAssessment: initialData?.clinicalAssessment || "",
      therapeuticPlan: initialData?.therapeuticPlan || "",
      observations: initialData?.observations || "",
    },
  });

  async function onSubmit(data: ProgressNoteFormValues) {
    try {
      setIsPending(true);
      if (initialData?.id) {
        await updateProgressNote(initialData.id, data);
        toast.success("Evolução atualizada");
      } else {
        await createProgressNote(patientId, data);
        toast.success("Evolução criada");
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
          name="sessionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data da Sessão</FormLabel>
              <FormControl>
                {/* Fallback to simple date input for simplicity */}
                <Input type="date" {...field} value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value} onChange={(e) => field.onChange(new Date(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evolução Clínica</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clinicalAssessment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avaliação Clínica</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="therapeuticPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plano Terapêutico</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </form>
    </Form>
  );
}
