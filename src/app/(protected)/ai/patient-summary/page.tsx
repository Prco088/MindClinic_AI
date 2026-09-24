import { PageHeader } from "@/components/dashboard/page-header";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PatientSummaryClient } from "./client";
import { redirect } from "next/navigation";

export default async function PatientSummaryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenantId = session.user.tenantId;

  const patients = await prisma.patient.findMany({
    where: { tenantId, isActive: true },
    orderBy: { fullName: "asc" },
    take: 6, // limiting for demo
  });

  const analyses = await prisma.aiAnalysis.findMany({
    where: { tenantId, type: "PATIENT_SUMMARY" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Visão Consolidada do Paciente" 
        description="Gere um resumo estruturado e factual do histórico clínico completo do paciente." 
      />
      <PatientSummaryClient patients={patients} analyses={analyses} />
    </div>
  );
}
