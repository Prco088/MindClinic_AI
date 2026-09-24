import { PageHeader } from "@/components/dashboard/page-header";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { SessionSummaryClient } from "./client";
import { redirect } from "next/navigation";

export default async function SessionSummaryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenantId = session.user.tenantId;

  // Fetch some recent progress notes to show as cards
  const recentNotes = await prisma.progressNote.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { patient: true },
  });

  const analyses = await prisma.aiAnalysis.findMany({
    where: { tenantId, type: "SESSION_SUMMARY" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Resumo de Sessão" 
        description="Gere sumários factuais de suas evoluções clínicas." 
      />
      <SessionSummaryClient recentNotes={recentNotes} analyses={analyses} />
    </div>
  );
}
