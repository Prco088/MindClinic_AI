import { Metadata } from "next";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PatientDocumentCard } from "@/components/patient/patient-document-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Meus Documentos - Paciente | MindClinic AI",
  description: "Seus documentos compartilhados",
};

export default async function PatientDocumentsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.type !== "PATIENT") {
    redirect("/patient/login");
  }

  const tenantId = session.user.tenantId;
  const patientId = session.user.id;

  const documents = await prisma.attachment.findMany({
    where: {
      tenantId,
      patientId,
      deletedAt: null,
    },
    orderBy: {
      uploadedAt: "desc"
    }
  });

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Meus Documentos</h1>
        <p className="text-muted-foreground">
          Visualize e baixe os documentos compartilhados pelo seu profissional.
        </p>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum documento"
          description="Você ainda não possui documentos compartilhados."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <PatientDocumentCard
              key={doc.id}
              document={{
                id: doc.id,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                uploadedAt: doc.uploadedAt,
                mimeType: doc.mimeType,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
