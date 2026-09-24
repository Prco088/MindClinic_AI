"use client";

import { AiAnalysis, AiJobStatus } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface AiAnalysisHistoryProps {
  analyses: AiAnalysis[];
  onViewResult?: (analysis: AiAnalysis) => void;
}

export function AiAnalysisHistory({ analyses, onViewResult }: AiAnalysisHistoryProps) {
  const getStatusBadge = (status: AiJobStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-600">Concluído</Badge>;
      case "RUNNING":
        return <Badge variant="secondary">Processando</Badge>;
      case "PENDING":
        return <Badge variant="outline">Na Fila</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {analyses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                Nenhuma análise encontrada.
              </TableCell>
            </TableRow>
          ) : (
            analyses.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell className="font-medium">{analysis.title}</TableCell>
                <TableCell>{analysis.type.replace("_", " ")}</TableCell>
                <TableCell>
                  {format(new Date(analysis.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>{getStatusBadge(analysis.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={analysis.status !== "COMPLETED" || !analysis.result}
                    onClick={() => onViewResult && onViewResult(analysis)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Resultado
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
