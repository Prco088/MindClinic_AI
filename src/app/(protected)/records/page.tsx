import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function RecordsPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Prontuários" 
        description="Acesse e registre a evolução clínica dos pacientes."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Evolução
        </Button>
      </PageHeader>

      <DataTable 
        columns={[
          { header: "Paciente", accessorKey: "patient" },
          { header: "Data da Evolução", accessorKey: "date" },
          { header: "Profissional", accessorKey: "professional" },
          { header: "Status", accessorKey: "status" },
        ]}
        data={[]}
        emptyTitle="Nenhum prontuário encontrado"
        emptyDescription="Você ainda não possui registros de prontuários. Eles aparecerão aqui após as consultas."
      />
    </div>
  )
}
