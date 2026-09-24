"use server";

import { auth } from "@/auth";
import { insightsService } from "@/services/clinical/insights.service";
import { revalidatePath } from "next/cache";

async function getSessionInfo() {
  const session = await auth();
  if (!session?.user?.tenantId || !session?.user?.id) {
    throw new Error("Não autorizado.");
  }
  return {
    tenantId: session.user.tenantId,
    userId: session.user.id,
  };
}

export async function generateLongitudinalSummaryAction(patientId: string) {
  const { tenantId, userId } = await getSessionInfo();
  await insightsService.generateLongitudinalSummary(tenantId, patientId, userId);
  revalidatePath(`/patients/${patientId}/insights`);
  revalidatePath(`/ai/insights`);
}

export async function generateRecurringThemesAction(patientId: string) {
  const { tenantId, userId } = await getSessionInfo();
  await insightsService.generateRecurringThemes(tenantId, patientId, userId);
  revalidatePath(`/patients/${patientId}/insights`);
  revalidatePath(`/ai/insights`);
}

export async function generateAdministrativeAlertsAction(patientId: string) {
  const { tenantId, userId } = await getSessionInfo();
  await insightsService.generateAdministrativeAlerts(tenantId, patientId, userId);
  revalidatePath(`/patients/${patientId}/insights`);
  revalidatePath(`/ai/insights`);
}

export async function generateSchedulingPatternsAction(patientId: string) {
  const { tenantId, userId } = await getSessionInfo();
  await insightsService.generateSchedulingPatterns(tenantId, patientId, userId);
  revalidatePath(`/patients/${patientId}/insights`);
  revalidatePath(`/ai/insights`);
}

export async function getInsightsByPatientAction(patientId: string) {
  const { tenantId } = await getSessionInfo();
  return insightsService.getInsightsByPatient(tenantId, patientId);
}

export async function getInsightsByTenantAction() {
  const { tenantId } = await getSessionInfo();
  return insightsService.getInsightsByTenant(tenantId);
}

export async function logInsightViewAction(patientId: string, insightId: string) {
  const { tenantId, userId } = await getSessionInfo();
  await insightsService.logInsightView(tenantId, patientId, insightId, userId);
}
