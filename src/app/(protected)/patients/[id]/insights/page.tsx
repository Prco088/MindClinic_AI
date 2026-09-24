import { getInsightsByPatientAction } from "@/app/actions/insights";
import { ClinicalInsightDashboard } from "@/components/clinical/clinical-insight-dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { InsightsGenerateButtons } from "./insights-generate-buttons";

export const metadata = {
  title: "Insights do Paciente",
};

interface PatientInsightsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PatientInsightsPage({ params }: PatientInsightsPageProps) {
  const { id: patientId } = await params;
  
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Security check: Only allowed roles
  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "PSYCHOLOGIST", "PSYCHIATRIST", "THERAPIST"];
  if (!allowedRoles.includes(session.user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground mt-2">Você não tem permissão para visualizar insights deste paciente.</p>
      </div>
    );
  }

  const insights = await getInsightsByPatientAction(patientId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" render={<Link href={`/patients/${patientId}`} />}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Insights do Paciente</h1>
            <p className="text-muted-foreground">
              Inteligência longitudinal e alertas administrativos
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <InsightsGenerateButtons patientId={patientId} />
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ClinicalInsightDashboard insights={insights as any} />
    </div>
  );
}
