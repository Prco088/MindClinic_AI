import prisma from "@/lib/prisma";

export type TimelineEventType = "ANAMNESIS" | "PROGRESS_NOTE" | "ADDENDUM" | "DIAGNOSIS" | "ATTACHMENT" | "CONSENT_TERM" | "TELEMEDICINE_SESSION";

export interface TimelineEvent {
  id: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  date: Date; // The relevant sorting date
  createdAt: Date;
  createdBy?: { id: string; name: string } | null;
  patientId: string;
  tenantId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // The raw data of the entity
}

export async function getPatientTimeline(
  tenantId: string,
  patientId: string
): Promise<TimelineEvent[]> {
  const [
    anamneses,
    progressNotes,
    addendums,
    diagnoses,
    attachments,
    consentTerms,
    telemedicineSessions,
  ] = await Promise.all([
    prisma.anamnesis.findMany({
      where: { tenantId, patientId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.progressNote.findMany({
      where: { tenantId, patientId, deletedAt: null },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { sessionDate: "desc" },
    }),
    prisma.progressNoteAddendum.findMany({
      where: { tenantId, progressNote: { patientId } },
      include: { user: { select: { id: true, name: true } }, progressNote: { select: { sessionDate: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.diagnosis.findMany({
      where: { tenantId, patientId, deletedAt: null },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attachment.findMany({
      where: { tenantId, patientId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.consentTerm.findMany({
      where: { tenantId, patientId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.telemedicineSession.findMany({
      where: { tenantId, patientId },
      include: { professional: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const timeline: TimelineEvent[] = [];

  for (const a of anamneses) {
    timeline.push({
      id: a.id,
      eventType: "ANAMNESIS",
      title: "Anamnese Realizada",
      description: "Registro inicial do paciente",
      date: a.createdAt,
      createdAt: a.createdAt,
      patientId: a.patientId,
      tenantId: a.tenantId,
      data: a,
    });
  }

  for (const p of progressNotes) {
    timeline.push({
      id: p.id,
      eventType: "PROGRESS_NOTE",
      title: "Evolução Clínica",
      description: p.content.substring(0, 100) + (p.content.length > 100 ? "..." : ""),
      date: p.sessionDate, // sort by session date
      createdAt: p.createdAt,
      createdBy: p.user,
      patientId: p.patientId,
      tenantId: p.tenantId,
      data: p,
    });
  }

  for (const ad of addendums) {
    timeline.push({
      id: ad.id,
      eventType: "ADDENDUM",
      title: "Adendo a Evolução",
      description: ad.content.substring(0, 100) + (ad.content.length > 100 ? "..." : ""),
      date: ad.createdAt,
      createdAt: ad.createdAt,
      createdBy: ad.user,
      patientId: patientId, // we know it's for this patient
      tenantId: ad.tenantId,
      data: ad,
    });
  }

  for (const d of diagnoses) {
    timeline.push({
      id: d.id,
      eventType: "DIAGNOSIS",
      title: d.title,
      description: d.description ? d.description.substring(0, 100) + (d.description.length > 100 ? "..." : "") : (d.cidCode || "Sem descrição"),
      date: d.createdAt,
      createdAt: d.createdAt,
      createdBy: d.user,
      patientId: d.patientId,
      tenantId: d.tenantId,
      data: d,
    });
  }

  for (const at of attachments) {
    timeline.push({
      id: at.id,
      eventType: "ATTACHMENT",
      title: "Documento Anexado",
      description: at.fileName,
      date: at.createdAt,
      createdAt: at.createdAt,
      patientId: at.patientId,
      tenantId: at.tenantId,
      data: at,
    });
  }

  for (const c of consentTerms) {
    timeline.push({
      id: c.id,
      eventType: "CONSENT_TERM",
      title: "Termo de Consentimento",
      description: c.accepted ? "Consentimento Aceito" : "Consentimento Pendente",
      date: c.createdAt,
      createdAt: c.createdAt,
      patientId: c.patientId,
      tenantId: c.tenantId,
      data: c,
    });
  }

  for (const t of telemedicineSessions) {
    let title = "Sessão de Telemedicina Criada";
    if (t.status === "COMPLETED") title = "Sessão de Telemedicina Encerrada";
    if (t.status === "IN_PROGRESS") title = "Sessão de Telemedicina Iniciada";
    if (t.status === "CANCELLED") title = "Sessão de Telemedicina Cancelada";

    timeline.push({
      id: t.id,
      eventType: "TELEMEDICINE_SESSION",
      title: "🎥 " + title,
      description: `Status: ${t.status}` + (t.durationMinutes ? ` (${t.durationMinutes} min)` : ""),
      date: t.startedAt || t.createdAt,
      createdAt: t.createdAt,
      createdBy: t.professional,
      patientId: t.patientId,
      tenantId: t.tenantId,
      data: t,
    });
  }

  // Sort descending by date
  return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
}
