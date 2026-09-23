import { PageHeader } from "@/components/dashboard/page-header";
import { PatientsTable } from "@/components/patients/patients-table";
import { getPatients } from "@/app/actions/patients";

export const metadata = {
  title: "Pacientes - MindClinic AI",
};

interface PatientsPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1", 10);
  
  const { patients, total, pageCount } = await getPatients(query, page, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description="Gerencie os pacientes cadastrados na clínica."
      />

      <PatientsTable 
        patients={patients}
        total={total}
        pageCount={pageCount}
      />
    </div>
  );
}
