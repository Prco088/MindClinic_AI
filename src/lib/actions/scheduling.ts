"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { syncAppointmentToExternal, cancelExternalAppointmentSync } from "@/lib/services/calendar-sync";
import { subHours, subMinutes } from "date-fns";

export type AppointmentData = {
  id?: string;
  patientId: string;
  title?: string;
  description?: string;
  location?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
  notes?: string;
  meetingUrl?: string;
  isOnline?: boolean;
  telemedicineSessionId?: string | null;
};

const appointmentSchema = z.object({
  id: z.string().optional(),
  patientId: z.string().min(1, "Paciente é obrigatório"),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  appointmentType: z.nativeEnum(AppointmentType),
  status: z.nativeEnum(AppointmentStatus),
  startsAt: z.date(),
  endsAt: z.date(),
  durationMinutes: z.number(),
  notes: z.string().optional().nullable(),
  meetingUrl: z.string().optional().nullable(),
});

export async function getAppointments(startStr: string, endStr: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const tenantId = session.user.tenantId;
  const professionalId = session.user.id;
  
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  
  return prisma.appointment.findMany({
    where: {
      tenantId,
      professionalId,
      startsAt: {
        gte: startDate,
      },
      endsAt: {
        lte: endDate,
      }
    },
    include: {
      patient: {
        select: {
          id: true,
          fullName: true
        }
      }
    }
  });
}

export async function saveAppointment(data: AppointmentData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const tenantId = session.user.tenantId;
  const professionalId = session.user.id;
  
  const parsed = appointmentSchema.parse(data);
  
  if (parsed.id) {
    const apt = await prisma.appointment.update({
      where: {
        id: parsed.id,
        tenantId,
        professionalId,
      },
      data: {
        patientId: parsed.patientId,
        title: parsed.title,
        description: parsed.description,
        location: parsed.location,
        appointmentType: parsed.appointmentType,
        status: parsed.status,
        startsAt: parsed.startsAt,
        endsAt: parsed.endsAt,
        durationMinutes: parsed.durationMinutes,
        notes: parsed.notes,
        meetingUrl: parsed.meetingUrl,
      }
    });

    // Re-create reminders
    await prisma.appointmentReminder.deleteMany({
      where: { appointmentId: apt.id, status: "PENDING" }
    });

    const now = new Date();
    const reminders = [];
    const r24h = subHours(parsed.startsAt, 24);
    const r1h = subHours(parsed.startsAt, 1);
    const r15m = subMinutes(parsed.startsAt, 15);

    if (r24h > now) reminders.push(r24h);
    if (r1h > now) reminders.push(r1h);
    if (r15m > now) reminders.push(r15m);

    if (reminders.length > 0) {
      await prisma.appointmentReminder.createMany({
        data: reminders.map(r => ({
          tenantId,
          appointmentId: apt.id,
          type: "EMAIL",
          status: "PENDING",
          scheduledFor: r,
        }))
      });
    }

    // Sync to external
    await syncAppointmentToExternal(apt.id);

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: professionalId,
        entity: "APPOINTMENT",
        entityId: apt.id,
        action: "APPOINTMENT_UPDATED",
        newData: JSON.parse(JSON.stringify(parsed)),
      }
    });
    
    revalidatePath("/appointments/calendar");
    return { success: true, appointment: apt };
  } else {
    const apt = await prisma.appointment.create({
      data: {
        tenantId,
        professionalId,
        patientId: parsed.patientId,
        title: parsed.title,
        description: parsed.description,
        location: parsed.location,
        appointmentType: parsed.appointmentType,
        isOnline: parsed.appointmentType === "ONLINE",
        status: parsed.status,
        startsAt: parsed.startsAt,
        endsAt: parsed.endsAt,
        durationMinutes: parsed.durationMinutes,
        notes: parsed.notes,
        meetingUrl: parsed.meetingUrl,
      }
    });

    const now = new Date();
    const reminders = [];
    const r24h = subHours(parsed.startsAt, 24);
    const r1h = subHours(parsed.startsAt, 1);
    const r15m = subMinutes(parsed.startsAt, 15);

    if (r24h > now) reminders.push(r24h);
    if (r1h > now) reminders.push(r1h);
    if (r15m > now) reminders.push(r15m);

    if (reminders.length > 0) {
      await prisma.appointmentReminder.createMany({
        data: reminders.map(r => ({
          tenantId,
          appointmentId: apt.id,
          type: "EMAIL",
          status: "PENDING",
          scheduledFor: r,
        }))
      });
    }

    // Sync to external
    await syncAppointmentToExternal(apt.id);

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: professionalId,
        entity: "APPOINTMENT",
        entityId: apt.id,
        action: "APPOINTMENT_CREATED",
        newData: JSON.parse(JSON.stringify(parsed)),
      }
    });
    
    revalidatePath("/appointments/calendar");
    return { success: true, appointment: apt };
  }
}

export async function deleteAppointment(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await prisma.appointment.delete({
    where: {
      id,
      tenantId: session.user.tenantId,
      professionalId: session.user.id
    }
  });

  // Cancel sync
  await cancelExternalAppointmentSync(id);

  await prisma.auditLog.create({
    data: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entity: "APPOINTMENT",
      entityId: id,
      action: "APPOINTMENT_DELETED",
    }
  });

  revalidatePath("/appointments/calendar");
  return { success: true };
}

export async function updateAppointmentDate(id: string, startsAt: Date, endsAt: Date) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const apt = await prisma.appointment.update({
    where: {
      id,
      tenantId: session.user.tenantId,
      professionalId: session.user.id
    },
    data: {
      startsAt,
      endsAt
    }
  });

  // Re-create reminders
  await prisma.appointmentReminder.deleteMany({
    where: { appointmentId: id, status: "PENDING" }
  });

  const now = new Date();
  const reminders = [];
  const r24h = subHours(startsAt, 24);
  const r1h = subHours(startsAt, 1);
  const r15m = subMinutes(startsAt, 15);

  if (r24h > now) reminders.push(r24h);
  if (r1h > now) reminders.push(r1h);
  if (r15m > now) reminders.push(r15m);

  if (reminders.length > 0) {
    await prisma.appointmentReminder.createMany({
      data: reminders.map(r => ({
        tenantId: session.user.tenantId,
        appointmentId: id,
        type: "EMAIL",
        status: "PENDING",
        scheduledFor: r,
      }))
    });
  }

  // Sync to external
  await syncAppointmentToExternal(id);

  await prisma.auditLog.create({
    data: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entity: "APPOINTMENT",
      entityId: id,
      action: "APPOINTMENT_RESCHEDULED",
      newData: { startsAt, endsAt }
    }
  });

  revalidatePath("/appointments/calendar");
  return { success: true, appointment: apt };
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const apt = await prisma.appointment.update({
    where: {
      id,
      tenantId: session.user.tenantId,
      professionalId: session.user.id
    },
    data: {
      status
    }
  });

  if (status === "CANCELLED" || status === "NO_SHOW") {
    await prisma.appointmentReminder.updateMany({
      where: { appointmentId: id, status: "PENDING" },
      data: { status: "CANCELLED" }
    });
    
    if (status === "CANCELLED") {
      await cancelExternalAppointmentSync(id);
    }
  } else {
    await syncAppointmentToExternal(id);
  }

  await prisma.auditLog.create({
    data: {
      tenantId: session.user.tenantId,
      userId: session.user.id,
      entity: "APPOINTMENT",
      entityId: id,
      action: "APPOINTMENT_STATUS_CHANGED",
      newData: { status }
    }
  });

  revalidatePath("/appointments/calendar");
  return { success: true, appointment: apt };
}

// --- CALENDAR BLOCKS ---

export type CalendarBlockData = {
  id?: string;
  title: string;
  reason?: string;
  startsAt: Date;
  endsAt: Date;
};

const blockSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título é obrigatório"),
  reason: z.string().optional().nullable(),
  startsAt: z.date(),
  endsAt: z.date(),
});

export async function getCalendarBlocks(startStr: string, endStr: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const startDate = new Date(startStr);
  const endDate = new Date(endStr);
  
  return prisma.calendarBlock.findMany({
    where: {
      tenantId: session.user.tenantId,
      professionalId: session.user.id,
      startsAt: { gte: startDate },
      endsAt: { lte: endDate }
    }
  });
}

export async function saveCalendarBlock(data: CalendarBlockData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const tenantId = session.user.tenantId;
  const professionalId = session.user.id;
  const parsed = blockSchema.parse(data);
  
  if (parsed.id) {
    const block = await prisma.calendarBlock.update({
      where: { id: parsed.id, tenantId, professionalId },
      data: {
        title: parsed.title,
        reason: parsed.reason,
        startsAt: parsed.startsAt,
        endsAt: parsed.endsAt,
      }
    });
    
    await prisma.auditLog.create({
      data: { tenantId, userId: professionalId, entity: "CALENDAR_BLOCK", entityId: block.id, action: "BLOCK_UPDATED" }
    });
    
    revalidatePath("/appointments/calendar");
    return { success: true, block };
  } else {
    const block = await prisma.calendarBlock.create({
      data: {
        tenantId,
        professionalId,
        title: parsed.title,
        reason: parsed.reason,
        startsAt: parsed.startsAt,
        endsAt: parsed.endsAt,
      }
    });
    
    await prisma.auditLog.create({
      data: { tenantId, userId: professionalId, entity: "CALENDAR_BLOCK", entityId: block.id, action: "BLOCK_CREATED" }
    });
    
    revalidatePath("/appointments/calendar");
    return { success: true, block };
  }
}

export async function deleteCalendarBlock(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await prisma.calendarBlock.delete({
    where: { id, tenantId: session.user.tenantId, professionalId: session.user.id }
  });
  
  await prisma.auditLog.create({
    data: { tenantId: session.user.tenantId, userId: session.user.id, entity: "CALENDAR_BLOCK", entityId: id, action: "BLOCK_DELETED" }
  });
  
  revalidatePath("/appointments/calendar");
  return { success: true };
}

// --- WORKING HOURS ---

export type WorkingHoursData = {
  id?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const workingHoursSchema = z.object({
  id: z.string().optional(),
  weekday: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isActive: z.boolean(),
});

export async function getWorkingHours() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  return prisma.workingHours.findMany({
    where: {
      tenantId: session.user.tenantId,
      professionalId: session.user.id
    },
    orderBy: [
      { weekday: 'asc' },
      { startTime: 'asc' }
    ]
  });
}

export async function saveWorkingHours(data: WorkingHoursData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const tenantId = session.user.tenantId;
  const professionalId = session.user.id;
  const parsed = workingHoursSchema.parse(data);
  
  if (parsed.id) {
    const wh = await prisma.workingHours.update({
      where: { id: parsed.id, tenantId, professionalId },
      data: {
        weekday: parsed.weekday,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        isActive: parsed.isActive,
      }
    });
    
    revalidatePath("/appointments/calendar");
    return { success: true, workingHours: wh };
  } else {
    const wh = await prisma.workingHours.create({
      data: {
        tenantId,
        professionalId,
        weekday: parsed.weekday,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        isActive: parsed.isActive,
      }
    });
    
    revalidatePath("/appointments/calendar");
    return { success: true, workingHours: wh };
  }
}

export async function deleteWorkingHours(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  await prisma.workingHours.delete({
    where: { id, tenantId: session.user.tenantId, professionalId: session.user.id }
  });
  
  revalidatePath("/appointments/calendar");
  return { success: true };
}
