"use client";

import { AiAnalysis } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AiAnalysisResultProps {
  analysis: AiAnalysis | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiAnalysisResult({ analysis, isOpen, onOpenChange }: AiAnalysisResultProps) {
  if (!analysis) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{analysis.title}</DialogTitle>
          <DialogDescription>
            Gerado em {format(new Date(analysis.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4 mt-4">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {analysis.result || "Nenhum resultado gerado."}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
