"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getPatientDocumentPreviewUrlAction } from "@/lib/actions/patient-documents";
import { toast } from "sonner";

interface PatientDocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  fileName: string;
  mimeType: string;
}

export function PatientDocumentPreview({
  open,
  onOpenChange,
  documentId,
  fileName,
  mimeType,
}: PatientDocumentPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchPreview = async () => {
        try {
          setIsLoading(true);
          const previewUrl = await getPatientDocumentPreviewUrlAction(documentId);
          setUrl(previewUrl);
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(error.message || "Erro ao carregar visualização.");
          } else {
            toast.error("Erro ao carregar visualização.");
          }
          onOpenChange(false);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPreview();
    }
  }, [open, documentId, onOpenChange]);

  // Reset url when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => setUrl(null), 300);
    }
  }, [open]);

  const canPreview = mimeType.startsWith("image/") || mimeType === "application/pdf";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative flex items-center justify-center bg-muted/30 rounded-md overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && url && (
            <>
              {canPreview ? (
                <iframe
                  src={url}
                  className="w-full h-full border-0"
                  title={fileName}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground mb-4">
                    Visualização não disponível para este tipo de arquivo.
                  </p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    Clique aqui para fazer o download
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
