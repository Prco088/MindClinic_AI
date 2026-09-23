import { getDiagnosesByPatient } from "@/app/actions/diagnosis";
import { DiagnosisForm } from "@/components/clinical/diagnosis-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DiagnosisPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const diagnoses = await getDiagnosesByPatient(params.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Diagnósticos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Novo Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            <DiagnosisForm patientId={params.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Diagnósticos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {diagnoses.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum diagnóstico registrado.</p>
            ) : (
              diagnoses.map((diag) => (
                <div key={diag.id} className="border p-4 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{diag.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${diag.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {diag.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  {diag.cidCode && (
                    <p className="text-xs text-muted-foreground">
                      {diag.system ? `${diag.system}: ` : 'Código: '}
                      {diag.cidCode}
                    </p>
                  )}
                  {diag.description && (
                    <p className="text-sm mt-2">{diag.description}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
