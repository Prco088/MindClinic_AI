/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { progressNoteAddendumSchema, ProgressNoteAddendumFormValues } from "@/lib/validations/progress-note";
import { createProgressNoteAddendum } from "@/app/actions/progress-note";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AddendumFormProps {
  progressNoteId: string;
  onSuccess?: () => void;
}

export function AddendumForm({ progressNoteId, onSuccess }: AddendumFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProgressNoteAddendumFormValues>({
    resolver: zodResolver(progressNoteAddendumSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(data: ProgressNoteAddendumFormValues) {
    setIsPending(true);
    try {
      await createProgressNoteAddendum(progressNoteId, data);
      toast.success("Adendo registrado com sucesso");
      form.reset();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar adendo";
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <FormField
          control={form.control as any}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo do Adendo</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite o complemento da evolução..." className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : "Registrar Adendo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
