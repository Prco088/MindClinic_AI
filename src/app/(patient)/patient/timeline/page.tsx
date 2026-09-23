import { Metadata } from "next";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, FileText, FileCheck2, Clock } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = {
  title: "Linha do Tempo - Paciente | MindClinic AI",
  description: "Histórico da sua jornada",
};

type TimelineEvent = {
  id: string;
  type: "DOCUMENT" | "CONSENT" | "APPOINTMENT";
  date: Date;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
};

export default async function PatientTimelinePage() {
  const session = await auth();

  if (!session?.user?.id || session.user.type !== "PATIENT") {
    redirect("/patient/login");
  }

  const tenantId = session.user.tenantId;
  const patientId = session.user.id;

  const [attachments, consents, appointments] = await Promise.all([
    prisma.attachment.findMany({
      where: { tenantId, patientId, deletedAt: null },
      orderBy: { uploadedAt: "desc" }
    }),
    prisma.consentAcceptance.findMany({
      where: { tenantId, patientId },
      include: { consentVersion: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.appointment.findMany({
      where: { tenantId, patientId },
      include: { professional: true },
      orderBy: { startsAt: "desc" }
    })
  ]);

  const events: TimelineEvent[] = [];

  attachments.forEach(att => {
    events.push({
      id: `doc-${att.id}`,
      type: "DOCUMENT",
      date: att.uploadedAt,
      title: "Documento Disponibilizado",
      description: att.fileName,
      icon: FileText,
      color: "bg-blue-500",
    });
  });

  consents.forEach(con => {
    events.push({
      id: `con-${con.id}-accept`,
      type: "CONSENT",
      date: con.createdAt,
      title: "Consentimento Aceito",
      description: `${con.consentVersion.title} (v${con.consentVersion.version})`,
      icon: FileCheck2,
      color: "bg-green-500",
    });

    if (con.revokedAt) {
      events.push({
        id: `con-${con.id}-revoke`,
        type: "CONSENT",
        date: con.revokedAt,
        title: "Consentimento Revogado",
        description: `${con.consentVersion.title} (v${con.consentVersion.version})`,
        icon: FileCheck2,
        color: "bg-destructive",
      });
    }
  });

  appointments.forEach(apt => {
    if (apt.status === "COMPLETED") {
      events.push({
        id: `apt-${apt.id}-completed`,
        type: "APPOINTMENT",
        date: apt.startsAt, // Simplification, could use actual completion time if stored
        title: "Consulta Realizada",
        description: `Com ${apt.professional.name}`,
        icon: Calendar,
        color: "bg-emerald-500",
      });
    } else if (apt.status === "SCHEDULED" || apt.status === "CONFIRMED") {
      // Show scheduling event based on createdAt, or just upcoming
      // Since it's a history timeline, we might use createdAt for the scheduling action
      events.push({
        id: `apt-${apt.id}-created`,
        type: "APPOINTMENT",
        date: apt.createdAt,
        title: "Consulta Agendada",
        description: `Para ${format(apt.startsAt, "dd/MM/yyyy")} com ${apt.professional.name}`,
        icon: Calendar,
        color: "bg-purple-500",
      });
    }
  });

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Linha do Tempo</h1>
        <p className="text-muted-foreground">
          Histórico de eventos, documentos e consultas.
        </p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Nenhum evento"
          description="Sua linha do tempo está vazia no momento."
        />
      ) : (
        <div className="relative pl-6 border-l-2 border-muted space-y-8 mt-8">
          {events.map((event) => {
            const Icon = event.icon;
            return (
              <div key={event.id} className="relative">
                <div className={`absolute -left-[37px] top-1 h-6 w-6 rounded-full border-4 border-background flex items-center justify-center ${event.color}`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{event.title}</span>
                  <span className="text-sm text-muted-foreground">{event.description}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {format(event.date, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
