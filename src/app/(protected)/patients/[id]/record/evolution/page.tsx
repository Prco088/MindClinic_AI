import { getProgressNotesByPatient } from "@/app/actions/progress-note";
import { ProgressNoteForm } from "@/components/clinical/progress-note-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EvolutionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const notes = await getProgressNotesByPatient(params.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Evoluções Clínicas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nova Evolução</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressNoteForm patientId={params.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notes.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma evolução registrada.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="border p-4 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{new Date(note.sessionDate).toLocaleDateString()}</span>
                    <span className="text-muted-foreground">
                      {note.isSigned ? "Assinada" : "Pendente"}
                    </span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
