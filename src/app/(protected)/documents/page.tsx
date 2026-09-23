import { PageHeader } from "@/components/dashboard/page-header"
import { DataTable } from "@/components/dashboard/data-table"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default function DocumentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <PageHeader 
        title="Documentos" 
        description="Gerencie laudos, atestados e termos de consentimento."
      >
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Fazer Upload
        </Button>
      </PageHeader>

      <DataTable 
        columns={[
          { header: "Nome do Arquivo", accessorKey: "fileName" },
          { header: "Paciente", accessorKey: "patient" },
          { header: "Tipo", accessorKey: "type" },
          { header: "Data de Envio", accessorKey: "uploadedAt" },
        ]}
        data={[]}
        emptyTitle="Nenhum documento encontrado"
        emptyDescription="Você ainda não enviou nenhum documento. Clique em 'Fazer Upload' para começar."
      />
    </div>
  )
}
