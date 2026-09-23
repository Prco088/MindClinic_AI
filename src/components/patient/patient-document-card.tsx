"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Download, Eye } from "lucide-react";
import { PatientDocumentPreview } from "./patient-document-preview";
import { useState } from "react";
import { getPatientDocumentDownloadUrlAction } from "@/lib/actions/patient-documents";
import { toast } from "sonner";

interface DocumentData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  mimeType: string;
}

interface PatientDocumentCardProps {
  document: DocumentData;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function PatientDocumentCard({ document }: PatientDocumentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const url = await getPatientDocumentDownloadUrlAction(document.id);
      window.open(url, "_blank");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Erro ao baixar documento.");
      } else {
        toast.error("Erro ao baixar documento.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
          <div className="flex flex-col">
            <CardTitle className="text-base font-medium line-clamp-1" title={document.fileName}>
              {document.fileName}
            </CardTitle>
            <span className="text-xs text-muted-foreground mt-1">
              {format(document.uploadedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <div className="bg-primary/10 p-2 rounded-md shrink-0">
            <FileText className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-2">
          <div className="text-xs text-muted-foreground">
            {formatBytes(document.fileSize)}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-4 border-t mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-2"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Visualizar
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="w-full gap-2"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
            Baixar
          </Button>
        </CardFooter>
      </Card>

      <PatientDocumentPreview
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        documentId={document.id}
        fileName={document.fileName}
        mimeType={document.mimeType}
      />
    </>
  );
}
