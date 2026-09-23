import { getPatientTimeline } from "@/app/actions/timeline";
import { TimelineView } from "@/components/clinical/timeline-view";
import { ProgressNoteModal } from "@/components/clinical/progress-note-modal";
import { DiagnosisModal } from "@/components/clinical/diagnosis-modal";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Activity } from "lucide-react";
import Link from "next/link";

interface RecordPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecordPage(props: RecordPageProps) {
  const params = await props.params;
  const { id } = params;
  
  const timelineEvents = await getPatientTimeline(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prontuário Eletrônico</h2>
          <p className="text-muted-foreground">Histórico clínico completo do paciente</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" render={
            <Link href={`/patients/${id}/record/anamnesis`}>
              <FileText className="mr-2 h-4 w-4" />
              Anamnese
            </Link>
          } />
          <DiagnosisModal 
            patientId={id} 
            trigger={
              <Button variant="outline">
                <Activity className="mr-2 h-4 w-4" />
                Diagnóstico
              </Button>
            } 
          />
          <ProgressNoteModal 
            patientId={id} 
            trigger={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Evolução
              </Button>
            } 
          />
        </div>
      </div>

      <div className="mt-8">
        <TimelineView events={timelineEvents} />
      </div>
    </div>
  );
}
