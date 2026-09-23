import { Metadata } from "next";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PatientConsentCard } from "@/components/patient/patient-consent-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FileCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Meus Consentimentos - Paciente | MindClinic AI",
  description: "Gerencie seus termos de consentimento",
};

export default async function PatientConsentsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.type !== "PATIENT") {
    redirect("/patient/login");
  }

  const tenantId = session.user.tenantId;
  const patientId = session.user.id;

  const activeVersions = await prisma.consentVersion.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const acceptances = await prisma.consentAcceptance.findMany({
    where: {
      tenantId,
      patientId,
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const mappedConsents = activeVersions.map(version => {
    // Find the latest acceptance for this version
    const acceptance = acceptances.find(a => a.consentVersionId === version.id);
    
    let status: "PENDING" | "ACCEPTED" | "REVOKED" = "PENDING";
    let actionDate = undefined;
    
    if (acceptance) {
      if (acceptance.revokedAt) {
        status = "REVOKED";
        actionDate = acceptance.revokedAt;
      } else {
        status = "ACCEPTED";
        actionDate = acceptance.createdAt;
      }
    }

    return {
      id: version.id,
      title: version.title,
      description: version.description,
      version: version.version,
      category: version.category,
      acceptanceId: acceptance?.id,
      status,
      actionDate,
    };
  });

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Meus Consentimentos</h1>
        <p className="text-muted-foreground">
          Gerencie seus termos de consentimento. Você pode aceitar ou revogar permissões a qualquer momento.
        </p>
      </div>

      {mappedConsents.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="Nenhum termo de consentimento"
          description="Você não possui termos de consentimento ativos no momento."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mappedConsents.map((consent) => (
            <PatientConsentCard
              key={consent.id}
              consent={consent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
