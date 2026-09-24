import { PageHeader } from "@/components/dashboard/page-header";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DocumentSummaryClient } from "./client";
import { redirect } from "next/navigation";

export default async function DocumentSummaryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tenantId = session.user.tenantId;

  // Em um ambiente real, poderíamos filtrar apenas arquivos suportados (PDF, TXT, DOCX)
  const attachments = await prisma.attachment.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const analyses = await prisma.aiAnalysis.findMany({
    where: { tenantId, type: "DOCUMENT_SUMMARY" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Resumo de Documentos" 
        description="Extraia e sumarize os pontos principais de arquivos e laudos." 
      />
      <DocumentSummaryClient attachments={attachments} analyses={analyses} />
    </div>
  );
}
