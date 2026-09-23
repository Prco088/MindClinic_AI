import { redirect } from "next/navigation";

interface RecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecordPage({ params }: RecordPageProps) {
  const { id } = await params;
  
  // Por enquanto, redireciona diretamente para a aba de anamnese.
  // Futuramente, esta página pode ser um dashboard central do prontuário (Evoluções, Resumo, etc).
  redirect(`/patients/${id}/record/anamnesis`);
}
