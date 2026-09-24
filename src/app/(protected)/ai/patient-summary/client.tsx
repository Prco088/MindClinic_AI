"use client";

import { AiAnalysis, Patient } from "@prisma/client";
import { AiAnalysisHistory } from "@/components/ai/ai-analysis-history";
import { AiAnalysisResult } from "@/components/ai/ai-analysis-result";
import { AiSummaryCard } from "@/components/ai/ai-summary-card";
import { useState, useTransition } from "react";
import { createPatientSummaryAction } from "../actions";

interface PatientSummaryClientProps {
  patients: Patient[];
  analyses: AiAnalysis[];
}

export function PatientSummaryClient({ patients, analyses }: PatientSummaryClientProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<AiAnalysis | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleViewResult = (analysis: AiAnalysis) => {
    setSelectedAnalysis(analysis);
    setIsResultOpen(true);
  };

  const handleGenerate = async (patientId: string) => {
    return new Promise<void>((resolve, reject) => {
      startTransition(async () => {
        try {
          await createPatientSummaryAction(patientId);
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
        {patients.length === 0 ? (
          <p className="text-muted-foreground">Nenhum paciente cadastrado.</p>
        ) : (
          patients.map((patient) => (
            <AiSummaryCard
              key={patient.id}
              title={patient.fullName}
              description={`CPF: ${patient.cpf || "Não informado"}`}
              buttonText="Resumir Paciente"
              disabled={isPending}
              onGenerate={() => handleGenerate(patient.id)}
            />
          ))
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Histórico de Visão Consolidada</h3>
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
