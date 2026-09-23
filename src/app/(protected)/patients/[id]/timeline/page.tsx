import { getPatientTimeline } from "@/app/actions/timeline";
import { PatientTimeline } from "@/components/clinical/patient-timeline";
import { ProgressNoteModal } from "@/components/clinical/progress-note-modal";
import { DiagnosisModal } from "@/components/clinical/diagnosis-modal";
import { AttachmentModal } from "@/components/clinical/attachment-modal";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Activity, UploadCloud } from "lucide-react";
import Link from "next/link";

interface TimelinePageProps {
  params: Promise<{ id: string }>;
}

export default async function TimelinePage(props: TimelinePageProps) {
  const params = await props.params;
  const { id } = params;
  
  const timelineEvents = await getPatientTimeline(id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Timeline Clínica</h2>
          <p className="text-muted-foreground">Histórico cronológico detalhado do paciente</p>
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
          <AttachmentModal
            patientId={id}
            trigger={
              <Button variant="secondary" title="Upload de Anexos">
                <UploadCloud className="mr-2 h-4 w-4" />
                Anexar Documento
              </Button>
            }
          />
        </div>
      </div>

      <div className="mt-8">
        <PatientTimeline events={timelineEvents} />
      </div>
    </div>
  );
}
