"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAttachmentDownloadUrlAction, getAttachmentPreviewUrlAction } from "@/app/actions/attachment";
import { toast } from "sonner";

interface AttachmentPreviewProps {
  attachmentId: string;
  fileName: string;
}

export function AttachmentPreview({ attachmentId, fileName }: AttachmentPreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = await getAttachmentDownloadUrlAction(attachmentId);
      
      // Create a temporary link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      // We don't use 'download' attribute directly because it's cross-origin, 
      // but opening it in a new tab will prompt a download if content-disposition is set or if it's not viewable
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Download iniciado");
    } catch (error: unknown) {
      toast.error("Erro ao baixar anexo", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const url = await getAttachmentPreviewUrlAction(attachmentId);
      window.open(url, '_blank');
    } catch (error: unknown) {
      toast.error("Erro ao visualizar anexo", {
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-md border">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" title={fileName}>
          {fileName}
        </p>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handlePreview} 
        disabled={isPreviewing}
      >
        {isPreviewing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Visualizar"
        )}
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleDownload} 
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
