"use client";

import { AiAnalysis, Attachment } from "@prisma/client";
import { AiAnalysisHistory } from "@/components/ai/ai-analysis-history";
import { AiAnalysisResult } from "@/components/ai/ai-analysis-result";
import { AiSummaryCard } from "@/components/ai/ai-summary-card";
import { useState, useTransition } from "react";
import { createDocumentSummaryAction } from "../actions";

interface DocumentSummaryClientProps {
  attachments: Attachment[];
  analyses: AiAnalysis[];
}

export function DocumentSummaryClient({ attachments, analyses }: DocumentSummaryClientProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AiAnalysis | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleViewResult = (analysis: AiAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsResultOpen(true);
  };

  const handleGenerate = async (patientId: string, attachmentId: string) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await createDocumentSummaryAction(patientId, attachmentId);
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
        {attachments.length === 0 ? (
          <p className="text-muted-foreground">Nenhum documento encontrado.</p>
        ) : (
          attachments.map((doc) => (
            <AiSummaryCard
              key={doc.id}
              title={doc.fileName}
              description={`${doc.mimeType} - ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`}
              buttonText="Extrair & Resumir"
              disabled={isPending}
              onGenerate={() => handleGenerate(doc.patientId, doc.id)}
            />
          ))
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico de Resumos de Documentos</h3>
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
