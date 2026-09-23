import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { PatientForm } from "@/components/patients/patient-form";
import { getPatientById } from "@/app/actions/patients";

export const metadata = {
  title: "Editar Paciente - MindClinic AI",
};

interface EditPatientPageProps {
  params: {
    id: string;
  };
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const patient = await getPatientById(params.id);

  if (!patient) {
    notFound();
  }

  // Formatting date for initialData correctly
  const initialData = {
    id: patient.id,
    fullName: patient.fullName,
    preferredName: patient.preferredName,
    birthDate: patient.birthDate,
    gender: patient.gender,
    cpf: patient.cpf,
    rg: patient.rg,
    phone: patient.phone,
    email: patient.email,
    occupation: patient.occupation,
    maritalStatus: patient.maritalStatus,
    address: patient.address,
    emergencyContactName: patient.emergencyContactName,
    emergencyContactPhone: patient.emergencyContactPhone,
    notes: patient.notes,
    isActive: patient.isActive,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Editar Paciente"
        description="Atualize os dados cadastrais do paciente."
      />

      <div className="rounded-md border bg-card p-6">
        <PatientForm initialData={initialData} />
      </div>
    </div>
  );
}
