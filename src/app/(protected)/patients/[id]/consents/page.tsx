import { Suspense } from "react";
import { getPatientConsentsAction, getConsentHistoryAction } from "@/app/actions/consent";
import { getPatientById } from "@/app/actions/patients";
import { ConsentList } from "@/components/clinical/consent-list";
import { ConsentHistory } from "@/components/clinical/consent-history";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldCheck, History } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PatientConsentsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientConsentsPage({ params }: PatientConsentsPageProps) {
  const resolvedParams = await params;
  const patientId = resolvedParams.id;
  
  const patient = await getPatientById(patientId);
  if (!patient) {
    notFound();
  }

  const [consents, history] = await Promise.all([
    getPatientConsentsAction(patientId),
    getConsentHistoryAction(patientId),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href={`/patients/${patientId}`}>
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Termos de Consentimento (LGPD)
          </h1>
          <p className="text-muted-foreground">
            Gerencie os consentimentos e autorizações de {patient.preferredName || patient.fullName}
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Termos Ativos
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando termos...</div>}>
            <ConsentList patientId={patientId} consents={consents} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-6">Histórico de Alterações</h2>
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Carregando histórico...</div>}>
              <ConsentHistory history={history} />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
