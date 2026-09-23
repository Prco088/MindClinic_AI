import { PageHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Plus } from "lucide-react"

export default function AppointmentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Agenda" 
        description="Controle seus agendamentos e horários disponíveis."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </PageHeader>

      <div className="border rounded-md bg-card">
        <EmptyState 
          icon={CalendarIcon}
          title="Agenda Vazia"
          description="Nenhuma consulta marcada para os próximos dias."
          action={
            <Button variant="outline">Ver Histórico</Button>
          }
        />
      </div>
    </div>
  )
}
