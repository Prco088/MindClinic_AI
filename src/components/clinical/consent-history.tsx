"use client";

import { ConsentAcceptance, ConsentVersion } from "@prisma/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface ConsentHistoryProps {
  history: (ConsentAcceptance & { consentVersion: ConsentVersion })[];
}

export function ConsentHistory({ history }: ConsentHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-muted/20 text-muted-foreground">
        Nenhum histórico de consentimento encontrado.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
      {history.map((record) => {
        const isRevoked = !!record.revokedAt;
        const date = isRevoked ? record.revokedAt : record.acceptedAt;
        const statusText = isRevoked ? "Revogado" : "Aceito";
        const colorClass = isRevoked ? "text-red-500" : "text-green-500";
        const dotClass = isRevoked ? "bg-red-500" : "bg-green-500";

        return (
          <div key={record.id} className="relative pl-6">
            <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-background ${dotClass}`} />
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${colorClass}`}>{statusText}</span>
                <span className="text-sm text-muted-foreground">
                  em {format(new Date(date!), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                </span>
              </div>
              
              <div className="bg-muted/30 p-3 rounded-md mt-1 border">
                <div className="font-medium text-sm flex items-center gap-2 mb-1">
                  {record.consentVersion.title}
                  <Badge variant="outline" className="text-[10px] h-5">
                    v{record.consentVersion.version}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {record.acceptedIp && (
                    <div><span className="font-medium">IP:</span> {record.acceptedIp}</div>
                  )}
                  {record.acceptedUserAgent && (
                    <div className="truncate" title={record.acceptedUserAgent}>
                      <span className="font-medium">Dispositivo:</span> {record.acceptedUserAgent}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
