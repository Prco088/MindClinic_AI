"use client";

import { TimelineEvent } from "@/services/clinical/timeline.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SignProgressNoteButton } from "./sign-progress-note-button";
import { AddendumModal } from "./addendum-modal";
import { DiagnosisModal } from "./diagnosis-modal";
import { AttachmentPreview } from "./attachment-preview";
import { Button } from "@/components/ui/button";

interface TimelineViewProps {
  events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Nenhum evento clínico registrado na timeline deste paciente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => (
        <Card key={`${event.eventType}-${event.id}`} className="relative">
          <div className="absolute -left-3 top-6 h-6 w-6 rounded-full border-4 border-background bg-primary" />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {event.title}
                </CardTitle>
                <CardDescription>
                  {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  {event.createdBy && ` • Por ${event.createdBy.name}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderEventContent(event)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function renderEventContent(event: TimelineEvent) {
  switch (event.eventType) {
    case "PROGRESS_NOTE":
      return (
        <div className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">{event.data.content}</p>
          <div className="flex items-center gap-2 mt-4">
            <span className={`text-xs px-2 py-1 rounded-full ${event.data.isSigned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {event.data.isSigned ? "Assinada" : "Pendente de Assinatura"}
            </span>
            {!event.data.isSigned && (
              <SignProgressNoteButton progressNoteId={event.id} />
            )}
            {event.data.isSigned && (
              <AddendumModal progressNoteId={event.id} />
            )}
          </div>
        </div>
      );
    case "ADDENDUM":
      return (
        <div className="space-y-2">
          <p className="text-sm whitespace-pre-wrap">{event.data.content}</p>
        </div>
      );
    case "DIAGNOSIS":
      return (
        <div className="space-y-2">
          <p className="font-medium">{event.data.title}</p>
          {event.data.cidCode && (
            <p className="text-xs text-muted-foreground">
              {event.data.system ? `${event.data.system}: ` : 'Código: '}
              {event.data.cidCode}
            </p>
          )}
          {event.data.description && <p className="text-sm">{event.data.description}</p>}
          <div className="mt-4">
            <span className={`text-xs px-2 py-1 rounded-full ${event.data.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {event.data.isActive ? "Ativo" : "Inativo"}
            </span>
            <div className="mt-3">
              <DiagnosisModal 
                patientId={event.patientId} 
                initialData={{
                  id: event.data.id,
                  title: event.data.title,
                  cidCode: event.data.cidCode || undefined,
                  system: event.data.system || undefined,
                  description: event.data.description || undefined,
                  isActive: event.data.isActive,
                }}
                title="Editar Diagnóstico"
                trigger={<Button variant="outline" size="sm">Editar</Button>}
              />
            </div>
          </div>
        </div>
      );
    case "ANAMNESIS":
      return (
        <div>
          <p className="text-sm text-muted-foreground">Anamnese preenchida e arquivada no sistema.</p>
        </div>
      );
    case "ATTACHMENT":
      return (
        <AttachmentPreview 
          attachmentId={event.id} 
          fileName={event.data.fileName || "Anexo"} 
        />
      );
    case "CONSENT_TERM":
      return (
        <div>
          <p className="text-sm">
            {event.data.accepted ? "Consentimento Aceito" : "Consentimento Pendente"}
          </p>
        </div>
      );
    case "TELEMEDICINE_SESSION":
      return (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{event.description}</p>
          {event.data.durationMinutes !== null && event.data.durationMinutes > 0 && (
            <p className="text-xs">Duração: {event.data.durationMinutes} minutos</p>
          )}
        </div>
      );
    default:
      return null;
  }
}
