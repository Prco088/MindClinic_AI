import { Attachment } from "@prisma/client";
import { AttachmentUpload } from "./attachment-upload";
import { AttachmentPreview } from "./attachment-preview";

interface AttachmentListProps {
  patientId: string;
  attachments: Attachment[];
}

export function AttachmentList({ patientId, attachments }: AttachmentListProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Anexos e Documentos</h3>
        <AttachmentUpload patientId={patientId} />
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-muted-foreground">Documentos Salvos</h4>
        
        {attachments.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Nenhum documento anexado.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachmentId={attachment.id}
                fileName={attachment.fileName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
