"use server";

import { auth } from "@/auth";
import { telemedicineService } from "@/services/telemedicine/telemedicine.service";
import { revalidatePath } from "next/cache";

export async function createTelemedicineSessionAction(
  appointmentId: string,
  patientId: string,
  patientName: string
) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!session?.user?.id || !tenantId) {
    throw new Error("Unauthorized");
  }

  const result = await telemedicineService.createSession(
    tenantId,
    appointmentId,
    patientId,
    session.user.id,
    patientName,
    session.user.name || "Professional"
  );

  revalidatePath("/appointments/calendar");
  revalidatePath(`/telemedicine/${result.id}`);
  return { success: true, sessionId: result.id };
}

export async function joinTelemedicineSessionAction(sessionId: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Se o usuário tem tenantId ele é profissional, senão pode ser paciente
  // Na verdade, pacientes tem tenantId no token?
  // O paciente acessa pelo portal do paciente e o token JWT contém informações de acesso.
  // Vamos assumir que conseguimos inferir isPatient pela role do usuário, ou pelo tipo de autenticação.
  const isPatient = session.user?.role === "PATIENT";
  const userId = session.user?.id;
  const tenantId = session?.user?.tenantId;
  
  if (!userId || !tenantId) {
    throw new Error("Unauthorized");
  }

  const result = await telemedicineService.joinSession(
    tenantId,
    sessionId,
    userId,
    isPatient
  );

  return { success: true, session: result };
}

export async function startTelemedicineSessionAction(sessionId: string) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!session?.user?.id || !tenantId || session.user.role === "PATIENT") {
    throw new Error("Unauthorized");
  }

  const result = await telemedicineService.startSession(
    tenantId,
    sessionId,
    session.user.id
  );

  revalidatePath(`/telemedicine/${sessionId}`);
  return { success: true, session: result };
}

export async function endTelemedicineSessionAction(sessionId: string) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!session?.user?.id || !tenantId || session.user.role === "PATIENT") {
    throw new Error("Unauthorized");
  }

  const result = await telemedicineService.endSession(
    tenantId,
    sessionId,
    session.user.id
  );

  revalidatePath(`/telemedicine/${sessionId}`);
  return { success: true, session: result };
}

export async function cancelTelemedicineSessionAction(sessionId: string) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;

  if (!session?.user?.id || !tenantId || session.user.role === "PATIENT") {
    throw new Error("Unauthorized");
  }

  const result = await telemedicineService.cancelSession(
    tenantId,
    sessionId,
    session.user.id
  );

  revalidatePath("/appointments/calendar");
  revalidatePath(`/telemedicine/${sessionId}`);
  return { success: true, session: result };
}
