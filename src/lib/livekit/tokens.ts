import { AccessToken } from "livekit-server-sdk";

export function createTelemedicineToken(
  roomName: string,
  participantName: string,
  identity: string,
  isProfessional: boolean,
  tenantId: string
) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit API Key or Secret is not defined in environment variables");
  }

  // Token expira em 2 horas
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: participantName,
    metadata: JSON.stringify({ isProfessional, tenantId }),
    ttl: "2h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    // Profissionais podem controlar a gravação ou outros aspectos se necessário
    roomAdmin: isProfessional,
  });

  return at.toJwt();
}

export function createPatientToken(roomName: string, patientName: string, patientId: string, tenantId: string) {
  return createTelemedicineToken(roomName, patientName, `patient_${patientId}`, false, tenantId);
}

export function createProfessionalToken(roomName: string, professionalName: string, professionalId: string, tenantId: string) {
  return createTelemedicineToken(roomName, professionalName, `professional_${professionalId}`, true, tenantId);
}
