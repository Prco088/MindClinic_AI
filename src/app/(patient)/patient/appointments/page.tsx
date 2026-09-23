import { Metadata } from "next";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/dashboard/empty-state";

export const metadata: Metadata = {
  title: "Minhas Consultas - Paciente | MindClinic AI",
  description: "Acompanhe seus agendamentos",
};

const statusMap = {
  SCHEDULED: { label: "Agendada", color: "bg-blue-500/10 text-blue-500" },
  CONFIRMED: { label: "Confirmada", color: "bg-green-500/10 text-green-500" },
  COMPLETED: { label: "Realizada", color: "bg-emerald-500/10 text-emerald-500" },
  CANCELLED: { label: "Cancelada", color: "bg-destructive/10 text-destructive" },
  NO_SHOW: { label: "Não Compareceu", color: "bg-orange-500/10 text-orange-500" },
};

export default async function PatientAppointmentsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.type !== "PATIENT") {
    redirect("/patient/login");
  }

  const tenantId = session.user.tenantId;
  const patientId = session.user.id;

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      patientId,
    },
    include: {
      professional: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      startsAt: "desc"
    }
  });

  const now = new Date();

  const upcoming = appointments.filter(a => 
    (a.status === "SCHEDULED" || a.status === "CONFIRMED") && a.startsAt >= now
  ).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  const past = appointments.filter(a => 
    a.status === "COMPLETED" || (a.startsAt < now && a.status !== "CANCELLED" && a.status !== "NO_SHOW")
  );

  const canceled = appointments.filter(a => 
    a.status === "CANCELLED" || a.status === "NO_SHOW"
  );

  const renderList = (list: typeof appointments, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <EmptyState
          icon={Calendar}
          title="Nenhuma consulta"
          description={emptyMessage}
        />
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((apt) => (
          <Card key={apt.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
              <div className="flex flex-col">
                <CardTitle className="text-base font-medium">
                  {format(apt.startsAt, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </CardTitle>
              </div>
              <Badge variant="outline" className={statusMap[apt.status as keyof typeof statusMap]?.color || ""}>
                {statusMap[apt.status as keyof typeof statusMap]?.label || apt.status}
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {format(apt.startsAt, "HH:mm")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>Profissional: {apt.professional.name}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Minhas Consultas</h1>
        <p className="text-muted-foreground">
          Acompanhe seus agendamentos e histórico de consultas.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Próximas ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Histórico ({past.length})</TabsTrigger>
          <TabsTrigger value="canceled">Canceladas ({canceled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-0">
          {renderList(upcoming, "Você não tem consultas futuras agendadas.")}
        </TabsContent>
        <TabsContent value="past" className="mt-0">
          {renderList(past, "Você não tem histórico de consultas realizadas.")}
        </TabsContent>
        <TabsContent value="canceled" className="mt-0">
          {renderList(canceled, "Você não tem consultas canceladas.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
