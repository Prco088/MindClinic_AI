import { Metadata } from "next";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Meu Perfil - Paciente | MindClinic AI",
  description: "Seu perfil de paciente",
};

export default async function PatientProfilePage() {
  const session = await auth();

  if (!session?.user?.id || session.user.type !== "PATIENT") {
    redirect("/patient/login");
  }

  const tenantId = session.user.tenantId;
  const patientId = session.user.id;

  // Log profile view
  await prisma.auditLog.create({
    data: {
      tenantId,
      patientId,
      entity: "PATIENT_PROFILE",
      entityId: patientId,
      action: "PATIENT_PROFILE_VIEW",
    }
  });

  const patient = await prisma.patient.findUnique({
    where: {
      id: patientId,
      tenantId
    }
  });

  if (!patient) {
    redirect("/patient/login");
  }

  const formattedBirthDate = patient.birthDate
    ? format(patient.birthDate, "dd/MM/yyyy", { locale: ptBR })
    : "";

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Visualize seus dados pessoais e de contato.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input value={patient.fullName} readOnly className="bg-muted" />
            </div>
            
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input value={formattedBirthDate} readOnly className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={patient.phone || ""} readOnly className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={patient.email || ""} readOnly className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Contato de Emergência</Label>
              <Input 
                value={
                  [patient.emergencyContactName, patient.emergencyContactPhone]
                    .filter(Boolean)
                    .join(" - ") || ""
                } 
                readOnly 
                className="bg-muted" 
              />
            </div>

            <div className="space-y-2">
              <Label>Convênio</Label>
              <Input value={patient.healthInsurance || "Particular"} readOnly className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
