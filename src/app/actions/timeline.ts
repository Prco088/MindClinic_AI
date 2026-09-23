"use server";

import { auth } from "@/auth";
import { getPatientTimeline as getTimelineService, TimelineEvent } from "@/services/clinical/timeline.service";

async function getSessionTenantId() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("Não autorizado. Usuário não pertence a nenhum tenant.");
  }
  return session.user.tenantId;
}

export async function getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
  try {
    const tenantId = await getSessionTenantId();
    const timeline = await getTimelineService(tenantId, patientId);
    return timeline;
  } catch (error) {
    console.error("Error fetching patient timeline:", error);
    throw new Error("Não foi possível carregar o histórico do paciente.");
  }
}
