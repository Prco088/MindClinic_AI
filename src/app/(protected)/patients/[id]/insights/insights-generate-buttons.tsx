"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { RefreshCw, FileText, Brain, Calendar, AlertTriangle } from "lucide-react";
import { 
  generateLongitudinalSummaryAction,
  generateRecurringThemesAction,
  generateAdministrativeAlertsAction,
  generateSchedulingPatternsAction
} from "@/app/actions/insights";

export function InsightsGenerateButtons({ patientId }: { patientId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (
    action: (id: string) => Promise<void>,
    successMessage: string
  ) => {
    try {
      setIsGenerating(true);
      await action(patientId);
      toast.add({
        title: "Sucesso",
        description: successMessage,
        type: "success"
      });
    } catch (error: unknown) {
      toast.add({
        title: "Erro ao gerar insight",
        description: (error instanceof Error ? error.message : "Erro desconhecido") || "Verifique se o paciente possui consentimento de IA ativo.",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button disabled={isGenerating} />}>
        <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
        {isGenerating ? "Gerando..." : "Gerar Insights"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleGenerate(generateLongitudinalSummaryAction, "Resumo longitudinal gerado com sucesso!")}>
          <FileText className="w-4 h-4 mr-2" />
          Resumo Longitudinal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGenerate(generateRecurringThemesAction, "Temas recorrentes gerados com sucesso!")}>
          <Brain className="w-4 h-4 mr-2" />
          Temas Recorrentes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGenerate(generateAdministrativeAlertsAction, "Alertas gerados com sucesso!")}>
          <AlertTriangle className="w-4 h-4 mr-2" />
          Alertas Administrativos
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGenerate(generateSchedulingPatternsAction, "Padrões de agenda gerados com sucesso!")}>
          <Calendar className="w-4 h-4 mr-2" />
          Padrões de Agenda
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
