"use client";

import { ClinicalInsightList } from "./clinical-insight-list";
import { ClinicalInsightType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Clock, FileWarning, AlertTriangle } from "lucide-react";

interface ClinicalInsightDashboardProps {
  insights: {
    id: string;
    type: ClinicalInsightType;
    title: string;
    description: string;
    confidence: number;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    patient?: {
      fullName: string;
    };
  }[];
}

export function ClinicalInsightDashboard({ insights }: ClinicalInsightDashboardProps) {
  const recurringThemesCount = insights.filter((i) => i.type === "RECURRING_THEMES").length;
  const followupAlertsCount = insights.filter((i) => i.type === "FOLLOWUP_ALERT").length;
  const longitudinalCount = insights.filter((i) => i.type === "LONGITUDINAL_SUMMARY").length;
  const schedulingCount = insights.filter((i) => i.type === "SCHEDULING_PATTERN").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Temas Recorrentes</CardTitle>
            <BrainCircuit className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringThemesCount}</div>
            <p className="text-xs text-muted-foreground">Padrões identificados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Resumos Longitudinais</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{longitudinalCount}</div>
            <p className="text-xs text-muted-foreground">Evoluções analisadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Alertas Administrativos</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followupAlertsCount}</div>
            <p className="text-xs text-muted-foreground">Acompanhamentos necessários</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Padrões de Agenda</CardTitle>
            <FileWarning className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedulingCount}</div>
            <p className="text-xs text-muted-foreground">Comportamentos detectados</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Todos os Insights</h3>
        <ClinicalInsightList insights={insights} />
      </div>
    </div>
  );
}
