"use client";

import { ClinicalInsightCard } from "./clinical-insight-card";
import { ClinicalInsightType } from "@prisma/client";

interface ClinicalInsightListProps {
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
  emptyMessage?: string;
}

export function ClinicalInsightList({ insights, emptyMessage = "Nenhum insight disponível." }: ClinicalInsightListProps) {
  if (!insights || insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-dashed">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight) => (
        <ClinicalInsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
