"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClinicalInsightType } from "@prisma/client";

interface ClinicalInsightCardProps {
  insight: {
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
  };
}

export function ClinicalInsightCard({ insight }: ClinicalInsightCardProps) {
  const getTypeColor = (type: ClinicalInsightType) => {
    switch (type) {
      case "LONGITUDINAL_SUMMARY":
        return "bg-blue-100 text-blue-800";
      case "RECURRING_THEMES":
        return "bg-purple-100 text-purple-800";
      case "ENGAGEMENT_PATTERN":
      case "SCHEDULING_PATTERN":
        return "bg-green-100 text-green-800";
      case "FOLLOWUP_ALERT":
      case "CONSENT_ALERT":
      case "DOCUMENT_PATTERN":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="default">Alta Confiança</Badge>;
    if (confidence >= 0.7) return <Badge variant="secondary">Média Confiança</Badge>;
    return <Badge variant="outline">Baixa Confiança</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">{insight.title}</CardTitle>
            <CardDescription className="text-xs">
              {format(new Date(insight.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardDescription>
          </div>
          <Badge className={getTypeColor(insight.type)} variant="outline">
            {insight.type.replace(/_/g, " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {insight.patient && (
          <div className="mb-2 text-sm font-medium text-muted-foreground">
            Paciente: {insight.patient.fullName}
          </div>
        )}
        <p className="text-sm">{insight.description}</p>
        
        {insight.metadata && !!(insight.metadata as Record<string, unknown>).themes && (
          <div className="mt-3 flex flex-wrap gap-2">
            {((insight.metadata as Record<string, unknown>).themes as string[]).map((theme: string) => (
              <Badge key={theme} variant="secondary" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Confiança: {(insight.confidence * 100).toFixed(0)}%
          </span>
          {getConfidenceBadge(insight.confidence)}
        </div>
      </CardContent>
    </Card>
  );
}
