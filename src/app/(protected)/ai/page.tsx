import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { BrainCircuit, Clock, CheckCircle, Database } from "lucide-react";

export default async function AiDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const tenantId = session.user.tenantId;

  const [
    totalAnalyses,
    pendingJobs,
    completedJobs,
    templates,
  ] = await Promise.all([
    prisma.aiAnalysis.count({ where: { tenantId } }),
    prisma.aiJob.count({ where: { tenantId, status: "PENDING" } }),
    prisma.aiJob.count({ where: { tenantId, status: "COMPLETED" } }),
    prisma.aiPromptTemplate.count({ where: { tenantId } }),
  ]);

  // Aggregate tokens as proxy for consumption (mockly calculated or grouped)
  const tokenConsumptionData = await prisma.aiAnalysis.aggregate({
    where: { tenantId },
    _sum: {
      inputTokens: true,
      outputTokens: true,
    }
  });

  const totalTokens = (tokenConsumptionData._sum.inputTokens || 0) + (tokenConsumptionData._sum.outputTokens || 0);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Dashboard de Inteligência Artificial" 
        description="Acompanhe o uso e os processamentos de IA da clínica." 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total de Análises"
          value={totalAnalyses.toString()}
          description="Realizadas na base"
          icon={BrainCircuit}
        />
        <StatCard
          title="Jobs Pendentes"
          value={pendingJobs.toString()}
          description="Na fila de processamento"
          icon={Clock}
        />
        <StatCard
          title="Jobs Concluídos"
          value={completedJobs.toString()}
          description="Processados com sucesso"
          icon={CheckCircle}
        />
        <StatCard
          title="Templates"
          value={templates.toString()}
          description="Prompts cadastrados"
          icon={Database}
        />
        <StatCard
          title="Consumo de Tokens"
          value={totalTokens.toLocaleString()}
          description="Estimativa total"
          icon={BrainCircuit} // Reusing BrainCircuit as consumption metric for now
        />
      </div>

      <div className="border rounded-xl bg-card text-card-foreground shadow p-6">
        <h3 className="font-semibold leading-none tracking-tight mb-4">Informação Fase 8.1</h3>
        <p className="text-sm text-muted-foreground">
          A infraestrutura da Inteligência Artificial foi implementada.
          Modelos de dados, serviços de orquestração, abstração de provedores (Factory) e controles LGPD
          já estão presentes. A integração efetiva com os provedores externos ocorrerá nas próximas fases.
        </p>
      </div>
    </div>
  );
}
