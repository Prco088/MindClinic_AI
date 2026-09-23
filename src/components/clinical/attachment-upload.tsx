"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadAttachmentAction } from "@/app/actions/attachment";
import { toast } from "sonner";

interface AttachmentUploadProps {
  patientId: string;
  onSuccess?: () => void;
}

export function AttachmentUpload({ patientId, onSuccess }: AttachmentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("patientId", patientId);
      formData.append("file", file);

      await uploadAttachmentAction(formData);

      toast.success("Documento enviado com sucesso!");
      clearFile();
      onSuccess?.();
    } catch (error: unknown) {
      toast.error("Erro no upload", {
        description: error instanceof Error ? error.message : "Não foi possível enviar o documento."
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="document">Novo Documento</Label>
        <div className="flex gap-2">
          <Input 
            id="document" 
            type="file" 
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={isUploading}
            className="flex-1"
          />
          {file && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={clearFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          PDF, PNG, JPEG ou WEBP (Max 20MB)
        </p>
      </div>

      {file && (
        <Button onClick={handleUpload} disabled={isUploading} className="w-full sm:w-auto">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Enviar Documento
            </>
          )}
        </Button>
      )}
    </div>
  );
}
