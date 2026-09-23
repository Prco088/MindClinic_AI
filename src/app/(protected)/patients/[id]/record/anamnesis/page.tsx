import { Metadata } from "next";
import { getPatientById } from "@/app/actions/patients";
import { getAnamnesisByPatient } from "@/app/actions/anamnesis";
import { AnamnesisForm } from "@/components/clinical/anamnesis-form";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Anamnese Clínica",
};

interface AnamnesisPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnamnesisPage({ params }: AnamnesisPageProps) {
  const { id } = await params;
  const patient = await getPatientById(id);

  if (!patient) {
    notFound();
  }

  const anamnesis = await getAnamnesisByPatient(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Anamnese</h2>
        <p className="text-muted-foreground">
          Preencha a avaliação inicial e o histórico de saúde do paciente {patient.fullName}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulário de Avaliação</CardTitle>
          <CardDescription>
            Os dados salvos aqui não podem ser apagados, apenas retificados e mantêm um histórico de auditoria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnamnesisForm 
            patientId={id} 
            initialData={anamnesis ? {
              id: anamnesis.id,
              formData: anamnesis.formData
            } : null} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
