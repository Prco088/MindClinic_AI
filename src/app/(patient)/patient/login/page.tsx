import { Metadata } from "next";
import { PatientLoginForm } from "@/components/patient/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Login - Paciente | MindClinic AI",
  description: "Faça login no portal do paciente",
};

export default function PatientLoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            MindClinic AI
          </h1>
          <p className="text-sm text-muted-foreground">
            Portal do Paciente
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Acesso</CardTitle>
            <CardDescription>
              Insira seus dados para acessar seus registros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientLoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
