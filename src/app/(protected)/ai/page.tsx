import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { BrainCircuit, Clock, CheckCircle, Database, Search } from "lucide-react";

export default async function AiDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const tenantId = session.user.tenantId;

  const [
    totalAnalyses,
    pendingJobs,
    completedJobs,
    templates,
    totalEmbeddings,
    totalInsights,
  ] = await Promise.all([
    prisma.aiAnalysis.count({ where: { tenantId } }),
    prisma.aiJob.count({ where: { tenantId, status: "PENDING" } }),
    prisma.aiJob.count({ where: { tenantId, status: "COMPLETED" } }),
    prisma.aiPromptTemplate.count({ where: { tenantId } }),
    prisma.aiEmbedding.count({ where: { tenantId } }),
    prisma.clinicalInsight.count({ where: { tenantId } }),
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

  // Get last 5 analyses
  const recentAnalyses = await prisma.aiAnalysis.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

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
          icon={BrainCircuit}
        />
        <StatCard
          title="Indexações"
          value={totalEmbeddings.toString()}
          description="Trechos de documentos indexados"
          icon={Search}
        />
        <StatCard
          title="Insights Gerados"
          value={totalInsights.toString()}
          description="Inteligência longitudinal"
          icon={BrainCircuit}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 border rounded-xl bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">Últimas Análises</h3>
          {/* Apenas listagem simples por agora, o componente AiAnalysisHistory precisa ser Client Component */}
          <div className="space-y-4">
            {recentAnalyses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma análise recente.</p>
            ) : (
              recentAnalyses.map(analysis => (
                <div key={analysis.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{analysis.title}</p>
                    <p className="text-xs text-muted-foreground">{analysis.type.replace("_", " ")}</p>
                  </div>
                  <div className="text-xs">
                    {analysis.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3 border rounded-xl bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">Recursos de IA (Fase 8.2)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Acesse as ferramentas de IA generativa para auxiliar em sua rotina clínica.
          </p>
          <div className="space-y-2">
            <a href="/ai/session-summary" className="block p-3 border rounded hover:bg-muted/50 transition-colors">
              <p className="font-medium">Resumo de Sessão</p>
              <p className="text-xs text-muted-foreground">Sumarize evoluções clínicas rapidamente.</p>
            </a>
            <a href="/ai/patient-summary" className="block p-3 border rounded hover:bg-muted/50 transition-colors">
              <p className="font-medium">Visão do Paciente</p>
              <p className="text-xs text-muted-foreground">Resumo consolidado do histórico clínico.</p>
            </a>
            <a href="/ai/document-summary" className="block p-3 border rounded hover:bg-muted/50 transition-colors">
              <p className="font-medium">Resumo de Documentos</p>
              <p className="text-xs text-muted-foreground">Extraia e resuma conteúdos de arquivos.</p>
            </a>
            <a href="/ai/search" className="block p-3 border rounded hover:bg-muted/50 transition-colors bg-primary/5 border-primary/20">
              <p className="font-medium">Busca Semântica</p>
              <p className="text-xs text-muted-foreground">Pesquisa inteligente em linguagem natural através do histórico.</p>
            </a>
            <a href="/ai/insights" className="block p-3 border rounded hover:bg-muted/50 transition-colors bg-secondary/10 border-secondary/20">
              <p className="font-medium">Clinical Insights (Fase 8.4)</p>
              <p className="text-xs text-muted-foreground">Padrões, temas recorrentes e alertas administrativos longitudinais.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
