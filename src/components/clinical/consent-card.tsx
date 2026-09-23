"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConsentVersion, ConsentAcceptance } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { acceptConsentAction, revokeConsentAction } from "@/app/actions/consent";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

interface ConsentCardProps {
  patientId: string;
  version: ConsentVersion;
  acceptance: ConsentAcceptance | null;
  isAccepted: boolean;
}

export function ConsentCard({ patientId, version, acceptance, isAccepted }: ConsentCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      await acceptConsentAction({
        patientId,
        consentVersionId: version.id,
      });
      toast.success("Termo de consentimento aceito com sucesso!");
    } catch {
      toast.error("Erro ao aceitar termo", {
        description: "Não foi possível registrar o aceite. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!acceptance || !isAccepted) return;
    
    try {
      setIsLoading(true);
      await revokeConsentAction({
        patientId,
        consentAcceptanceId: acceptance.id,
      });
      toast.success("Termo de consentimento revogado.");
    } catch {
      toast.error("Erro ao revogar termo", {
        description: "Não foi possível registrar a revogação. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      DATA_PROCESSING: "Tratamento de Dados",
      DOCUMENT_STORAGE: "Armazenamento de Documentos",
      TELEMEDICINE: "Telemedicina",
      AI_ASSISTANCE: "Assistência por IA",
      MARKETING: "Marketing / Contato",
    };
    return labels[category] || category;
  };

  return (
    <Card className={`relative overflow-hidden ${isAccepted ? 'border-green-200 bg-green-50/10' : 'border-amber-200 bg-amber-50/10'}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${isAccepted ? 'bg-green-500' : 'bg-amber-500'}`} />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline">{getCategoryLabel(version.category)}</Badge>
              <span className="text-xs text-muted-foreground font-mono">v{version.version}</span>
            </div>
            <CardTitle className="text-lg">{version.title}</CardTitle>
          </div>
          {isAccepted ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 flex gap-1 items-center">
              <CheckCircle2 className="w-3 h-3" /> Aceito
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex gap-1 items-center">
              <XCircle className="w-3 h-3" /> Pendente
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {version.description}
        </p>
        
        {isAccepted && acceptance && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <p>Aceito em: <strong className="font-medium text-foreground">{format(new Date(acceptance.acceptedAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}</strong></p>
            {acceptance.acceptedIp && <p>Origem IP: {acceptance.acceptedIp}</p>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 bg-muted/20 border-t p-4">
        {isAccepted ? (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleRevoke}
            disabled={isLoading}
          >
            Revogar Consentimento
          </Button>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleAccept}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Aceitar Termo
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
