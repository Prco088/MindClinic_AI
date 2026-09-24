"use client";

import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface TelemedicineJoinScreenProps {
  onJoin: () => void;
  isProfessional: boolean;
}

export function TelemedicineJoinScreen({ onJoin, isProfessional }: TelemedicineJoinScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-muted/40 p-4">
      <div className="max-w-md w-full bg-background rounded-xl shadow-lg border p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Video className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Sala de Espera</h2>
          <p className="text-muted-foreground">
            {isProfessional 
              ? "Pronto para iniciar o atendimento online?" 
              : "Sua consulta online está pronta. Ao entrar, sua câmera e microfone serão ativados."}
          </p>
        </div>

        <Button size="lg" className="w-full" onClick={onJoin}>
          Entrar na Consulta
        </Button>
      </div>
    </div>
  );
}
