"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

interface AttachmentFormProps {
  patientId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AttachmentForm({ patientId, onSuccess, onCancel }: AttachmentFormProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.error("Upload indisponível", {
      description: "O armazenamento seguro de anexos será implementado na Fase 6.5."
    });
    
    setIsUploading(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Arquivo</Label>
        <Input 
          id="file" 
          type="file" 
          required 
          className="cursor-pointer"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Título do Documento</Label>
        <Input 
          id="title" 
          placeholder="Ex: Exame de Sangue, Relatório Psiquiátrico" 
          required 
        />
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={isUploading}
        >
          {isUploading ? (
            <>Fazendo Upload...</>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              Enviar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
