import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PageHeader } from "@/components/dashboard/page-header";
import { getPatientById } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import { FileEdit } from "lucide-react";

interface ViewPatientPageProps {
  params: {
    id: string;
  };
}

export default async function ViewPatientPage({ params }: ViewPatientPageProps) {
  const patient = await getPatientById(params.id);

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <PageHeader
          title={patient.fullName}
          description="Detalhes cadastrais do paciente."
        />
        <Button render={
          <Link href={`/patients/${patient.id}/edit`}>
            <FileEdit className="mr-2 h-4 w-4" />
            Editar Paciente
          </Link>
        } />
      </div>

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
              <p className="text-base">
                {patient.isActive ? (
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    Arquivado
                  </span>
                )}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Nome Social / Apelido</h3>
              <p className="text-base">{patient.preferredName || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Nascimento</h3>
              <p className="text-base">
                {patient.birthDate ? format(new Date(patient.birthDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Gênero</h3>
              <p className="text-base">{patient.gender || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">CPF</h3>
              <p className="text-base">{patient.cpf || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">RG</h3>
              <p className="text-base">{patient.rg || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefone</h3>
              <p className="text-base">{patient.phone || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">E-mail</h3>
              <p className="text-base">{patient.email || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Profissão</h3>
              <p className="text-base">{patient.occupation || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado Civil</h3>
              <p className="text-base">{patient.maritalStatus || "-"}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Endereço</h3>
              <p className="text-base">{patient.address || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Contato de Emergência</h3>
              <p className="text-base">{patient.emergencyContactName || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefone de Emergência</h3>
              <p className="text-base">{patient.emergencyContactPhone || "-"}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Observações</h3>
              <p className="text-base whitespace-pre-wrap">{patient.notes || "-"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Cadastrado em</h3>
              <p className="text-base">
                {format(new Date(patient.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Última Atualização</h3>
              <p className="text-base">
                {format(new Date(patient.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
