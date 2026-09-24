import { getInsightsByTenantAction } from "@/app/actions/insights";
import { ClinicalInsightDashboard } from "@/components/clinical/clinical-insight-dashboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Clinical Insights",
};

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Security check: Only allowed roles
  const allowedRoles = ["SUPER_ADMIN", "ADMIN", "PSYCHOLOGIST", "PSYCHIATRIST", "THERAPIST"];
  if (!allowedRoles.includes(session.user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground mt-2">Você não tem permissão para visualizar insights clínicos.</p>
      </div>
    );
  }

  const insights = await getInsightsByTenantAction();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" render={<Link href="/ai" />}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Insights</h1>
          <p className="text-muted-foreground">
            Visão geral de inteligência longitudinal e padrões identificados
          </p>
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ClinicalInsightDashboard insights={insights as any} />
    </div>
  );
}
