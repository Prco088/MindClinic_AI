interface AppointmentReminderEmailProps {
  patientName: string;
  date: string;
  time: string;
  professionalName: string;
  appointmentType: string;
  meetingUrl?: string | null;
}

export function generateAppointmentReminderEmail({
  patientName,
  date,
  time,
  professionalName,
  appointmentType,
  meetingUrl,
}: AppointmentReminderEmailProps): string {
  const isOnline = appointmentType === "ONLINE";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h1 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Lembrete de Consulta</h1>
      
      <p>Olá, <strong>${patientName}</strong>!</p>
      
      <p>Este é um lembrete da sua consulta agendada no MindClinic AI.</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Profissional:</strong> ${professionalName}</p>
        <p style="margin: 5px 0;"><strong>Data:</strong> ${date}</p>
        <p style="margin: 5px 0;"><strong>Horário:</strong> ${time}</p>
        <p style="margin: 5px 0;"><strong>Tipo:</strong> ${
          appointmentType === "IN_PERSON" ? "Presencial" :
          appointmentType === "ONLINE" ? "Online" : "Visita Domiciliar"
        }</p>
      </div>

      ${
        isOnline && meetingUrl
          ? `<div style="margin-top: 20px;">
              <p>Sua consulta será online. Você pode acessá-la pelo link abaixo no horário agendado:</p>
              <a href="${meetingUrl}" style="display: inline-block; background-color: #0284c7; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
                Acessar Consulta Online
              </a>
             </div>`
          : ""
      }

      <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
        Se você precisar cancelar ou remarcar, por favor entre em contato com antecedência.<br>
        Atenciosamente,<br>
        <strong>Equipe MindClinic AI</strong>
      </p>
    </div>
  `;
}
