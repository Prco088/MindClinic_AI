import { PageHeader } from "@/components/dashboard/page-header";
import { auth } from "@/auth";
import { getPromptTemplates } from "@/lib/services/ai/prompt-template.service";

export default async function AiSettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const templates = await getPromptTemplates(session.user.tenantId);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Configurações de Inteligência Artificial" 
        description="Gerencie os provedores e os templates de IA da sua clínica." 
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-xl bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">Provedores de IA Disponíveis</h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
              <div>
                <p className="font-medium">Google Gemini</p>
                <p className="text-sm text-muted-foreground">Modelos de linguagem multimodal do Google</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">Ativo</span>
            </li>
            <li className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
              <div>
                <p className="font-medium">OpenAI</p>
                <p className="text-sm text-muted-foreground">Integração com GPT-4 e afins</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-md">Em Breve</span>
            </li>
            <li className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
              <div>
                <p className="font-medium">Azure OpenAI</p>
                <p className="text-sm text-muted-foreground">Infraestrutura segura da Microsoft</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-md">Em Breve</span>
            </li>
          </ul>
        </div>

        <div className="border rounded-xl bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">Status da Fundação</h3>
          <div className="space-y-4">
            <p className="text-sm">
              Nesta fase 8.1, o MindClinic AI está configurado arquiteturalmente para auditoria 
              e proteção de dados LGPD. Nenhuma análise envia dados reais a servidores externos 
              neste momento.
            </p>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-blue-500 mt-1"></span>
              <span>LGPD Enforcement: Ativo</span>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-blue-500 mt-1"></span>
              <span>Audit Logging: Ativo</span>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-blue-500 mt-1"></span>
              <span>Processamento Assíncrono: Configurado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-xl bg-card text-card-foreground shadow p-6">
        <h3 className="font-semibold leading-none tracking-tight mb-4">Templates de Prompt</h3>
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum template customizado cadastrado ainda.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div key={template.id} className="p-4 border rounded-md">
                <p className="font-medium">{template.name}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
