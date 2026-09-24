import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Database, Users, Video, Brain, HardDrive } from "lucide-react";

export const revalidate = 60; // 1 minute cache

export default async function SystemAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "OWNER" && session?.user?.role !== "PROFESSIONAL") {
    redirect("/"); // Apenas profissionais/admins
  }

  // Estatísticas do Banco
  const totalTenants = await prisma.tenant.count();
  const totalPatients = await prisma.patient.count();
  const totalSessions = await prisma.telemedicineSession.count();

  // Teste de Banco
  let dbStatus = "OFFLINE";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "ONLINE";
  } catch (e) {}

  const livekitStatus = (process.env.LIVEKIT_API_KEY && process.env.NEXT_PUBLIC_LIVEKIT_URL) ? "ONLINE" : "MISSING_KEYS";
  const aiStatus = process.env.GEMINI_API_KEY ? "ONLINE" : "MISSING_KEYS";
  const storageStatus = (process.env.S3_ACCESS_KEY_ID && process.env.S3_ENDPOINT) ? "ONLINE" : "MISSING_KEYS";

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Activity className="h-8 w-8 text-primary" />
        System Health & Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Database (Neon)</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={dbStatus === "ONLINE" ? "default" : "destructive"}>{dbStatus}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Status da Conexão Principal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">LiveKit (Telemedicina)</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={livekitStatus === "ONLINE" ? "default" : "secondary"}>{livekitStatus}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">WebRTC Edge Network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gemini AI</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={aiStatus === "ONLINE" ? "default" : "secondary"}>{aiStatus}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Serviço de LLM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cloudflare R2</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={storageStatus === "ONLINE" ? "default" : "secondary"}>{storageStatus}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">S3 Object Storage</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Métricas Globais (Multi-Tenant)</h2>
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total de Clínicas/Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTenants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total de Pacientes Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalPatients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Sessões de Telemedicina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
