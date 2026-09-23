/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React, { useRef, useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBRLocale from "@fullcalendar/core/locales/pt-br";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { updateAppointmentDate } from "@/lib/actions/scheduling";
import { toast } from "sonner";
import { AppointmentModal } from "./appointment-modal";
import { EventClickArg, EventDropArg, DateSelectArg } from "@fullcalendar/core";

export type CalendarItemProps = {
  appointments: any[];
  blocks: any[];
  workingHours: any[];
  patients: any[];
};

const statusColors = {
  SCHEDULED: "#3b82f6",
  CONFIRMED: "#22c55e",
  COMPLETED: "#10b981",
  CANCELLED: "#ef4444",
  NO_SHOW: "#f97316",
};

export function CalendarView({ appointments, blocks, workingHours, patients }: CalendarItemProps) {
  const calendarRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(null);

  const events = useMemo(() => {
    const aptEvents = appointments.map(apt => ({
      id: apt.id,
      title: `${apt.patient.fullName}`,
      start: apt.startsAt,
      end: apt.endsAt,
      backgroundColor: statusColors[apt.status as keyof typeof statusColors],
      extendedProps: {
        type: "APPOINTMENT",
        ...apt
      }
    }));

    const blockEvents = blocks.map(block => ({
      id: block.id,
      title: block.title,
      start: block.startsAt,
      end: block.endsAt,
      backgroundColor: "#6b7280", // gray
      display: "block",
      extendedProps: {
        type: "BLOCK",
        ...block
      }
    }));

    return [...aptEvents, ...blockEvents];
  }, [appointments, blocks]);

  const businessHours = useMemo(() => {
    return workingHours.filter(wh => wh.isActive).map(wh => {
      return {
        daysOfWeek: [wh.weekday === 0 ? 0 : wh.weekday],
        startTime: wh.startTime,
        endTime: wh.endTime,
      };
    });
  }, [workingHours]);

  const handleEventClick = (info: EventClickArg) => {
    const extended = info.event.extendedProps;
    if (extended.type === "APPOINTMENT") {
      setSelectedAppointment(extended);
      setSelectedDateRange(null);
      setModalOpen(true);
    } else if (extended.type === "BLOCK") {
      toast.info(`Bloqueio: ${info.event.title}`);
    }
  };

  const handleDateSelect = (info: DateSelectArg) => {
    setSelectedDateRange({ start: info.start, end: info.end });
    setSelectedAppointment(null);
    setModalOpen(true);
    
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.unselect();
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const extended = info.event.extendedProps;
    if (extended.type === "APPOINTMENT") {
      try {
        await updateAppointmentDate(
          info.event.id,
          info.event.start!,
          info.event.end!
        );
        toast.success("Consulta reagendada com sucesso!");
      } catch (error) {
        toast.error("Erro ao reagendar consulta.");
        info.revert();
      }
    } else {
      info.revert();
    }
  };

  return (
    <div className="bg-card border rounded-md shadow-sm p-4 w-full h-[800px] overflow-hidden">
      <FullCalendar
        ref={calendarRef}
        // @ts-ignore
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={ptBRLocale as any}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        businessHours={businessHours.length > 0 ? businessHours : undefined}
        selectable={true}
        selectMirror={true}
        editable={true}
        droppable={true}
        eventClick={handleEventClick as any}
        select={handleDateSelect as any}
        eventDrop={handleEventDrop as any}
        eventResize={handleEventDrop as any}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        height="100%"
      />

      <AppointmentModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        appointment={selectedAppointment}
        initialDates={selectedDateRange}
        patients={patients}
      />
    </div>
  );
}
