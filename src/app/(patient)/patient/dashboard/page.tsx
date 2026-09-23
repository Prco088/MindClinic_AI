import { Metadata } from "next";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PatientDashboardCard } from "@/components/patient/patient-dashboard-card";
import { Calendar, FileText, FileCheck2, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Dashboard - Paciente | MindClinic AI",
  description: "Seu portal de paciente",
};

export default async function PatientDashboardPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.type !== "PATIENT") {
    redirect("/patient/login");
  }

  const tenantId = session.user.tenantId;
  const patientId = session.user.id;

  // Log dashboard view
  await prisma.auditLog.create({
    data: {
      tenantId,
      patientId,
      entity: "PATIENT_DASHBOARD",
      entityId: patientId,
      action: "PATIENT_DASHBOARD_VIEW",
    }
  });

  const nextAppointment = await prisma.appointment.findFirst({
    where: {
      tenantId,
      patientId,
      startsAt: { gte: new Date() }
    },
    orderBy: { startsAt: 'asc' }
  });

  const totalDocuments = await prisma.attachment.count({
    where: {
      tenantId,
      patientId,
      deletedAt: null
    }
  });

  const activeConsents = await prisma.consentAcceptance.count({
    where: {
      tenantId,
      patientId,
      revokedAt: null
    }
  });

  const patientAccount = await prisma.patientAccount.findUnique({
    where: {
      patientId
    }
  });

  const formattedNextAppointment = nextAppointment
    ? format(nextAppointment.startsAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : "Nenhuma agendada";

  const formattedLastAccess = patientAccount?.lastLoginAt
    ? format(patientAccount.lastLoginAt, "dd/MM/yyyy HH:mm", { locale: ptBR })
    : "Primeiro acesso";

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao seu portal de paciente. Aqui você encontra um resumo de suas informações.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PatientDashboardCard
          title="Próxima Consulta"
          value={formattedNextAppointment}
          icon={Calendar}
          description="Sua consulta mais próxima"
        />
        <PatientDashboardCard
          title="Documentos"
          value={totalDocuments}
          icon={FileText}
          description="Arquivos compartilhados"
        />
        <PatientDashboardCard
          title="Consentimentos"
          value={activeConsents}
          icon={FileCheck2}
          description="Consentimentos ativos"
        />
        <PatientDashboardCard
          title="Último Acesso"
          value={formattedLastAccess}
          icon={Clock}
        />
      </div>
    </div>
  );
}
