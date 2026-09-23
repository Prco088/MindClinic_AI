import prisma from "@/lib/prisma";

export async function syncAppointmentToExternal(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      professional: {
        include: {
          googleCalendarConnection: true,
          outlookCalendarConnection: true,
        },
      },
      patient: true,
    },
  });

  if (!appointment) return;

  const hasGoogle = !!appointment.professional.googleCalendarConnection;
  const hasOutlook = !!appointment.professional.outlookCalendarConnection;

  if (hasGoogle) {
    // TODO: Implemented real Google API call
    console.log("Mock syncing to Google Calendar for appointment:", appointmentId);
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        externalProvider: "GOOGLE",
        externalEventId: `mock-google-id-${appointmentId}`,
        syncStatus: "SYNCED",
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: appointment.tenantId,
        entity: "Appointment",
        entityId: appointment.id,
        action: "APPOINTMENT_SYNCED",
        userId: appointment.professionalId,
        patientId: appointment.patientId,
      }
    });
  }

  if (hasOutlook) {
    // TODO: Implemented real Microsoft Graph call
    console.log("Mock syncing to Outlook Calendar for appointment:", appointmentId);
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        externalProvider: "OUTLOOK",
        externalEventId: `mock-outlook-id-${appointmentId}`,
        syncStatus: "SYNCED",
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: appointment.tenantId,
        entity: "Appointment",
        entityId: appointment.id,
        action: "APPOINTMENT_SYNCED",
        userId: appointment.professionalId,
        patientId: appointment.patientId,
      }
    });
  }
}

export async function cancelExternalAppointmentSync(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || !appointment.externalEventId || !appointment.externalProvider) return;

  if (appointment.externalProvider === "GOOGLE") {
    // TODO: Call Google API to delete
    console.log("Mock deleting from Google Calendar:", appointment.externalEventId);
  } else if (appointment.externalProvider === "OUTLOOK") {
    // TODO: Call Outlook API to delete
    console.log("Mock deleting from Outlook Calendar:", appointment.externalEventId);
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      syncStatus: "CANCELLED",
    },
  });
}
