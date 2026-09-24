import prisma from "@/lib/prisma";
import { ConsentCategory, TelemedicineStatus, Prisma } from "@prisma/client";
import { createPatientToken, createProfessionalToken } from "@/lib/livekit/tokens";

export const telemedicineService = {
  async hasActiveTelemedicineConsent(tenantId: string, patientId: string) {
    const acceptance = await prisma.consentAcceptance.findFirst({
      where: {
        tenantId,
        patientId,
        revokedAt: null,
        consentVersion: {
          category: ConsentCategory.TELEMEDICINE,
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return !!acceptance;
  },

  async createSession(
    tenantId: string,
    appointmentId: string,
    patientId: string,
    professionalId: string,
    patientName: string,
    professionalName: string
  ) {
    const hasConsent = await this.hasActiveTelemedicineConsent(tenantId, patientId);
    if (!hasConsent) {
      throw new Error("Patient does not have active TELEMEDICINE consent.");
    }

    const roomName = `room_${appointmentId}_${Date.now()}`;
    const patientToken = await createPatientToken(roomName, patientName, patientId, tenantId);
    const professionalToken = await createProfessionalToken(roomName, professionalName, professionalId, tenantId);

    const session = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ts = await tx.telemedicineSession.create({
        data: {
          tenantId,
          appointmentId,
          patientId,
          professionalId,
          roomName,
          accessTokenPatient: patientToken,
          accessTokenProfessional: professionalToken,
          status: TelemedicineStatus.SCHEDULED,
        },
      });

      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          isOnline: true,
          meetingUrl: `/telemedicine/${ts.id}`,
          telemedicineSessionId: ts.id,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId: professionalId,
          patientId,
          entity: "TelemedicineSession",
          entityId: ts.id,
          action: "TELEMEDICINE_SESSION_CREATED",
          newData: { status: ts.status, roomName },
        },
      });

      return ts;
    });

    return session;
  },

  async joinSession(tenantId: string, sessionId: string, userId: string, isPatient: boolean) {
    const session = await prisma.telemedicineSession.findUniqueOrThrow({
      where: { id: sessionId, tenantId },
      include: { appointment: true },
    });

    if (isPatient && session.patientId !== userId) {
      throw new Error("Unauthorized");
    }

    if (!isPatient && session.professionalId !== userId) {
      throw new Error("Unauthorized");
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: isPatient ? null : userId,
        patientId: session.patientId,
        entity: "TelemedicineSession",
        entityId: session.id,
        action: "TELEMEDICINE_SESSION_JOINED",
      },
    });

    return session;
  },

  async startSession(tenantId: string, sessionId: string, professionalId: string) {
    const session = await prisma.telemedicineSession.update({
      where: { id: sessionId, tenantId, professionalId },
      data: {
        status: TelemedicineStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: professionalId,
        patientId: session.patientId,
        entity: "TelemedicineSession",
        entityId: session.id,
        action: "TELEMEDICINE_SESSION_STARTED",
      },
    });

    return session;
  },

  async endSession(tenantId: string, sessionId: string, professionalId: string) {
    const existing = await prisma.telemedicineSession.findUniqueOrThrow({
      where: { id: sessionId, tenantId, professionalId },
    });

    let durationMinutes = 0;
    const endedAt = new Date();
    if (existing.startedAt) {
      durationMinutes = Math.floor((endedAt.getTime() - existing.startedAt.getTime()) / 60000);
    }

    const session = await prisma.telemedicineSession.update({
      where: { id: sessionId },
      data: {
        status: TelemedicineStatus.COMPLETED,
        endedAt,
        durationMinutes,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: professionalId,
        patientId: session.patientId,
        entity: "TelemedicineSession",
        entityId: session.id,
        action: "TELEMEDICINE_SESSION_ENDED",
      },
    });

    return session;
  },

  async cancelSession(tenantId: string, sessionId: string, professionalId: string) {
    const session = await prisma.telemedicineSession.update({
      where: { id: sessionId, tenantId, professionalId },
      data: {
        status: TelemedicineStatus.CANCELLED,
        endedAt: new Date(),
      },
    });

    if (session.appointmentId) {
      await prisma.appointment.update({
        where: { id: session.appointmentId },
        data: {
          telemedicineSessionId: null,
          meetingUrl: null,
          isOnline: false,
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: professionalId,
        patientId: session.patientId,
        entity: "TelemedicineSession",
        entityId: session.id,
        action: "TELEMEDICINE_SESSION_CANCELLED",
      },
    });

    return session;
  }
};
