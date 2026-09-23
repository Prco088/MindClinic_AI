import React from "react";
import { CalendarView } from "@/components/scheduling/calendar-view";
import { WorkingHoursCard } from "@/components/scheduling/working-hours-card";
import { CalendarBlockCard } from "@/components/scheduling/calendar-block-card";
import { getAppointments, getCalendarBlocks, getWorkingHours } from "@/lib/actions/scheduling";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

// Function to get the start and end of a window around today (e.g. 1 month before, 2 months after)
function getDateWindow() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
  return {
    startStr: start.toISOString(),
    endStr: end.toISOString()
  };
}

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { startStr, endStr } = getDateWindow();

  // Fetch initial data
  const [appointments, blocks, workingHours, patients] = await Promise.all([
    getAppointments(startStr, endStr),
    getCalendarBlocks(startStr, endStr),
    getWorkingHours(),
    prisma.patient.findMany({
      where: {
        tenantId: session.user.tenantId,
      },
      select: {
        id: true,
        fullName: true
      }
    })
  ]);

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos, bloqueios e horários de atendimento.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Space for Working Hours and Blocks */}
        <div className="lg:col-span-1 space-y-4">
          <WorkingHoursCard workingHours={workingHours} />
          <CalendarBlockCard blocks={blocks} />
        </div>

        {/* Main Calendar View */}
        <div className="lg:col-span-3">
          <CalendarView 
            appointments={appointments} 
            blocks={blocks}
            workingHours={workingHours}
            patients={patients}
          />
        </div>
      </div>
    </div>
  );
}
