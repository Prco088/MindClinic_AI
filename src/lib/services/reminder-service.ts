import { Resend } from "resend";
import prisma from "@/lib/prisma";
import { generateAppointmentReminderEmail } from "@/lib/emails/appointment-reminder-email";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key");

export async function processReminders() {
  try {
    const pendingReminders = await prisma.appointmentReminder.findMany({
      where: {
        status: "PENDING",
        scheduledFor: {
          lte: new Date(),
        },
      },
      include: {
        appointment: {
          include: {
            patient: true,
            professional: true,
          },
        },
      },
    });

    for (const reminder of pendingReminders) {
      if (reminder.type === "EMAIL" && reminder.appointment.patient.email) {
        try {
          const formattedDate = format(reminder.appointment.startsAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
          const formattedTime = format(reminder.appointment.startsAt, "HH:mm");

          const emailHtml = generateAppointmentReminderEmail({
            patientName: reminder.appointment.patient.fullName,
            date: formattedDate,
            time: formattedTime,
            professionalName: reminder.appointment.professional.name,
            appointmentType: reminder.appointment.appointmentType,
            meetingUrl: reminder.appointment.meetingUrl,
          });

          await resend.emails.send({
            from: "MindClinic AI <agendamentos@mindclinic.ai>",
            to: reminder.appointment.patient.email,
            subject: `Lembrete de Consulta: ${formattedDate} às ${formattedTime}`,
            html: emailHtml,
          });

          await prisma.appointmentReminder.update({
            where: { id: reminder.id },
            data: {
              status: "SENT",
              sentAt: new Date(),
            },
          });

          // Register in audit log
          await prisma.auditLog.create({
            data: {
              tenantId: reminder.tenantId,
              entity: "AppointmentReminder",
              entityId: reminder.id,
              action: "APPOINTMENT_REMINDER_SENT",
              patientId: reminder.appointment.patientId,
              userId: reminder.appointment.professionalId,
            }
          });

        } catch (error) {
          console.error(`Failed to send email for reminder ${reminder.id}:`, error);
          await prisma.appointmentReminder.update({
            where: { id: reminder.id },
            data: { status: "FAILED" },
          });
        }
      } else {
        // If it's not email, or patient has no email, mark failed or handle differently
        await prisma.appointmentReminder.update({
          where: { id: reminder.id },
          data: { status: "FAILED" },
        });
      }
    }
  } catch (error) {
    console.error("Error processing reminders:", error);
  }
}
