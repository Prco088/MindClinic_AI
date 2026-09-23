"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { acceptPatientConsentAction, revokePatientConsentAction } from "@/lib/actions/patient-consents";

interface ConsentData {
  id: string; // ConsentVersion id
  title: string;
  description: string;
  version: string;
  category: string;
  acceptanceId?: string;
  status: "PENDING" | "ACCEPTED" | "REVOKED";
  actionDate?: Date;
}

interface PatientConsentCardProps {
  consent: ConsentData;
}

const statusMap = {
  PENDING: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
  ACCEPTED: { label: "Aceito", color: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
  REVOKED: { label: "Revogado", color: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
};

export function PatientConsentCard({ consent }: PatientConsentCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      await acceptPatientConsentAction(consent.id);
      toast.success("Consentimento aceito com sucesso.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao aceitar consentimento.");
      } else {
        toast.error("Erro ao aceitar consentimento.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async () => {
    try {
      if (!consent.acceptanceId) return;
      setIsProcessing(true);
      await revokePatientConsentAction(consent.acceptanceId);
      toast.success("Consentimento revogado com sucesso.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao revogar consentimento.");
      } else {
        toast.error("Erro ao revogar consentimento.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
        <div className="flex flex-col">
          <CardTitle className="text-base font-medium">
            {consent.title}
          </CardTitle>
          <span className="text-xs text-muted-foreground mt-1">
            Versão {consent.version} • {consent.category}
          </span>
        </div>
        <Badge variant="outline" className={statusMap[consent.status].color}>
          {statusMap[consent.status].label}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 pb-2 pt-4">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
          {consent.description}
        </p>
        
        {consent.actionDate && (
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            {consent.status === "ACCEPTED" ? "Aceito em" : "Revogado em"}: {format(consent.actionDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-4 border-t mt-auto">
        {(consent.status === "PENDING" || consent.status === "REVOKED") && (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleAccept}
            disabled={isProcessing}
          >
            <Check className="h-4 w-4" />
            Aceitar Termo
          </Button>
        )}
        
        {consent.status === "ACCEPTED" && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleRevoke}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
            Revogar
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
