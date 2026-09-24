import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Users, Calendar, CalendarClock, Mail, RefreshCcw } from "lucide-react"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { startOfDay, endOfDay } from "date-fns"
import { unstable_cache } from "next/cache"

const getDashboardStats = unstable_cache(
  async (tenantId: string, professionalId: string) => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    return Promise.all([
      prisma.patient.count({ where: { tenantId } }),
      prisma.appointment.count({
        where: {
          tenantId,
          professionalId,
          startsAt: { gte: todayStart, lte: todayEnd },
        }
      }),
      prisma.appointment.count({
        where: {
          tenantId,
          professionalId,
          startsAt: { gte: now },
        }
      }),
      prisma.appointmentReminder.count({
        where: {
          tenantId,
          appointment: { professionalId },
          status: "SENT"
        }
      }),
      prisma.appointment.count({
        where: {
          tenantId,
          professionalId,
          syncStatus: "PENDING"
        }
      })
    ]);
  },
  ['dashboard-stats'],
  { revalidate: 60, tags: ['dashboard'] }
);

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const tenantId = session.user.tenantId;
  const professionalId = session.user.id;

  if (!tenantId || !professionalId) return null;

  const [
    totalPatients,
    todayAppointments,
    nextAppointments,
    sentReminders,
    pendingSyncs
  ] = await getDashboardStats(tenantId, professionalId);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Dashboard" 
        description="Bem-vindo(a) de volta! Aqui está o resumo da sua clínica." 
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total de Pacientes"
          value={totalPatients.toString()}
          description="Ativos no sistema"
          icon={Users}
        />
        <StatCard
          title="Consultas Hoje"
          value={todayAppointments.toString()}
          description="Agendadas para hoje"
          icon={Calendar}
        />
        <StatCard
          title="Próximas Consultas"
          value={nextAppointments.toString()}
          description="Consultas futuras"
          icon={CalendarClock}
        />
        <StatCard
          title="Lembretes Enviados"
          value={sentReminders.toString()}
          description="Notificações automáticas"
          icon={Mail}
        />
        <StatCard
          title="Sync Pendentes"
          value={pendingSyncs.toString()}
          description="Aguardando sincronização"
          icon={RefreshCcw}
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
