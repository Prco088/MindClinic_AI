import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, Calendar, CalendarClock, FileText } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Dashboard" 
        description="Bem-vindo(a) de volta! Aqui está o resumo da sua clínica." 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Pacientes"
          value="124"
          description="+4 novos este mês"
          icon={Users}
        />
        <StatCard
          title="Consultas Hoje"
          value="8"
          description="3 realizadas, 5 pendentes"
          icon={Calendar}
        />
        <StatCard
          title="Próximas Consultas"
          value="24"
          description="Para os próximos 7 dias"
          icon={CalendarClock}
        />
        <StatCard
          title="Documentos Pendentes"
          value="3"
          description="Aguardando assinatura"
          icon={FileText}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 border rounded-xl bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">Evolução de Atendimentos</h3>
          <div className="h-[250px] w-full bg-muted/20 rounded-md flex items-center justify-center border border-dashed">
            <span className="text-sm text-muted-foreground">Gráfico em desenvolvimento...</span>
          </div>
        </div>
        <div className="col-span-3 border rounded-xl bg-card text-card-foreground shadow p-6">
          <h3 className="font-semibold leading-none tracking-tight mb-4">Próximos Pacientes</h3>
          <div className="space-y-4">
            {/* Mocked list */}
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">P{i+1}</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Paciente {i+1}</p>
                  <p className="text-xs text-muted-foreground">Consulta de Retorno</p>
                </div>
                <div className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                  1{i+2}:00
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
