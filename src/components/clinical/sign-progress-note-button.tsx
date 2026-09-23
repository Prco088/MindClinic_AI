"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signProgressNote } from "@/app/actions/progress-note";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SignProgressNoteButtonProps {
  progressNoteId: string;
}

export function SignProgressNoteButton({ progressNoteId }: SignProgressNoteButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSign() {
    setIsPending(true);
    try {
      await signProgressNote(progressNoteId);
      toast.success("Evolução assinada com sucesso. Agora ela é somente leitura.");
      router.refresh();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao assinar evolução";
      toast.error(msg);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button 
      variant="secondary" 
      size="sm" 
      onClick={handleSign} 
      disabled={isPending}
    >
      {isPending ? "Assinando..." : "Assinar Evolução"}
    </Button>
  );
}
