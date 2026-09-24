import prisma from "@/lib/prisma";
import { ClinicalInsightType, ConsentCategory, Prisma } from "@prisma/client";

export const insightsService = {
  async hasActiveAiConsent(tenantId: string, patientId: string) {
    const acceptance = await prisma.consentAcceptance.findFirst({
      where: {
        tenantId,
        patientId,
        revokedAt: null,
        consentVersion: {
          category: ConsentCategory.AI_ASSISTANCE,
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return !!acceptance;
  },

  async generateLongitudinalSummary(tenantId: string, patientId: string, userId: string) {
    if (!(await this.hasActiveAiConsent(tenantId, patientId))) {
      throw new Error("Patient does not have active AI consent.");
    }

    // Mock generating a longitudinal summary
    const description = "Paciente apresentou redução gradual dos temas relacionados à ansiedade ao longo das últimas sessões.";
    
    return this.createInsight(
      tenantId,
      patientId,
      userId,
      ClinicalInsightType.LONGITUDINAL_SUMMARY,
      "Resumo Longitudinal",
      description,
      0.95
    );
  },

  async generateRecurringThemes(tenantId: string, patientId: string, userId: string) {
    if (!(await this.hasActiveAiConsent(tenantId, patientId))) {
      throw new Error("Patient does not have active AI consent.");
    }

    // Mock generating recurring themes
    const themes = ["trabalho", "relacionamento", "sono", "organização"];
    const description = "Temas identificados: " + themes.join(", ");

    return this.createInsight(
      tenantId,
      patientId,
      userId,
      ClinicalInsightType.RECURRING_THEMES,
      "Temas Recorrentes",
      description,
      0.88,
      { themes }
    );
  },

  async generateAdministrativeAlerts(tenantId: string, patientId: string, userId: string) {
    if (!(await this.hasActiveAiConsent(tenantId, patientId))) {
      throw new Error("Patient does not have active AI consent.");
    }

    // Mock generating admin alerts
    const description = "Paciente sem consulta há 60 dias.";

    return this.createInsight(
      tenantId,
      patientId,
      userId,
      ClinicalInsightType.FOLLOWUP_ALERT,
      "Alerta de Acompanhamento",
      description,
      1.0
    );
  },

  async generateSchedulingPatterns(tenantId: string, patientId: string, userId: string) {
    if (!(await this.hasActiveAiConsent(tenantId, patientId))) {
      throw new Error("Patient does not have active AI consent.");
    }

    // Mock scheduling patterns
    const description = "Alto índice de reagendamento.";

    return this.createInsight(
      tenantId,
      patientId,
      userId,
      ClinicalInsightType.SCHEDULING_PATTERN,
      "Padrão de Agenda",
      description,
      0.92
    );
  },

  async createInsight(
    tenantId: string,
    patientId: string,
    userId: string,
    type: ClinicalInsightType,
    title: string,
    description: string,
    confidence: number,
    metadata?: Prisma.InputJsonValue | null
  ) {
    const insight = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const record = await tx.clinicalInsight.create({
        data: {
          tenantId,
          patientId,
          type,
          title,
          description,
          confidence,
          metadata: metadata ? metadata : Prisma.JsonNull,
        },
      });

      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          patientId,
          entity: "ClinicalInsight",
          entityId: record.id,
          action: "AI_INSIGHT_CREATED",
          newData: record as unknown as Prisma.InputJsonValue,
        },
      });

      // Also register generation audit
      await tx.auditLog.create({
        data: {
          tenantId,
          userId,
          patientId,
          entity: "ClinicalInsight",
          entityId: record.id,
          action: "AI_INSIGHT_GENERATED",
        },
      });

      return record;
    });

    return insight;
  },

  async getInsightsByPatient(tenantId: string, patientId: string) {
    return prisma.clinicalInsight.findMany({
      where: {
        tenantId,
        patientId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getInsightsByTenant(tenantId: string) {
    return prisma.clinicalInsight.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        patient: {
          select: {
            fullName: true,
          }
        }
      }
    });
  },
  
  async logInsightView(tenantId: string, patientId: string, insightId: string, userId: string) {
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        patientId,
        entity: "ClinicalInsight",
        entityId: insightId,
        action: "AI_INSIGHT_VIEWED",
      },
    });
  }
};
