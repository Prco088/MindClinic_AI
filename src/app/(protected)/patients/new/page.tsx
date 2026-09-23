import { PageHeader } from "@/components/dashboard/page-header";
import { PatientForm } from "@/components/patients/patient-form";

export const metadata = {
  title: "Novo Paciente - MindClinic AI",
};

export default function NewPatientPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Novo Paciente"
        description="Preencha os dados abaixo para cadastrar um novo paciente."
      />

      <div className="rounded-md border bg-card p-6">
        <PatientForm />
      </div>
    </div>
  );
}
