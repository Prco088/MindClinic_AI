"use client";

import { AiAnalysis, Patient, ProgressNote } from "@prisma/client";
import { AiAnalysisHistory } from "@/components/ai/ai-analysis-history";
import { AiAnalysisResult } from "@/components/ai/ai-analysis-result";
import { AiSummaryCard } from "@/components/ai/ai-summary-card";
import { useState, useTransition } from "react";
import { createSessionSummaryAction } from "../actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SessionSummaryClientProps {
  recentNotes: (ProgressNote & { patient: Patient })[];
  analyses: AiAnalysis[];
}

export function SessionSummaryClient({ recentNotes, analyses }: SessionSummaryClientProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AiAnalysis | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleViewResult = (analysis: AiAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsResultOpen(true);
  };

  const handleGenerate = async (patientId: string, noteId: string) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await createSessionSummaryAction(patientId, noteId);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentNotes.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma evolução clínica recente encontrada.</p>
        ) : (
          recentNotes.map((note) => (
            <AiSummaryCard
              key={note.id}
              title={note.patient.fullName}
              description={`Evolução de ${format(new Date(note.createdAt), "dd/MM/yyyy", { locale: ptBR })}`}
              buttonText="Resumir Sessão"
              disabled={isPending}
              onGenerate={() => handleGenerate(note.patientId, note.id)}
            />
          ))
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico de Resumos de Sessão</h3>
        <AiAnalysisHistory analyses={analyses} onViewResult={handleViewResult} />
      </div>

      <AiAnalysisResult
        analysis={selectedAnalysis}
        isOpen={isResultOpen}
        onOpenChange={setIsResultOpen}
      />
    </div>
  );
}
