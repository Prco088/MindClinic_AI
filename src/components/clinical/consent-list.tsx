"use client";

import { ConsentVersion, ConsentAcceptance } from "@prisma/client";
import { ConsentCard } from "./consent-card";

type ConsentWithStatus = {
  version: ConsentVersion;
  acceptance: ConsentAcceptance | null;
  isAccepted: boolean;
};

interface ConsentListProps {
  patientId: string;
  consents: ConsentWithStatus[];
}

export function ConsentList({ patientId, consents }: ConsentListProps) {
  if (!consents || consents.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg bg-muted/20 text-muted-foreground">
        Nenhum termo de consentimento configurado para esta clínica.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {consents.map((item) => (
        <ConsentCard 
          key={item.version.id}
          patientId={patientId}
          version={item.version}
          acceptance={item.acceptance}
          isAccepted={item.isAccepted}
        />
      ))}
    </div>
  );
}
