import { auth } from "@/auth";
import { telemedicineService } from "@/services/telemedicine/telemedicine.service";
import { redirect } from "next/navigation";
import { TelemedicineRoom } from "@/components/telemedicine/telemedicine-room";

export default async function TelemedicineSessionPage({ params }: { params: { sessionId: string } }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const tenantId = session?.user?.tenantId;
  if (!tenantId) {
    redirect("/login");
  }

  const isPatient = session.user.role === "PATIENT";
  const userId = session.user.id;
  const sessionId = params.sessionId;

  let token = "";
  let serverUrl = "";

  try {
    const telemedicineSession = await telemedicineService.joinSession(
      tenantId,
      sessionId,
      userId,
      isPatient
    );

    token = (isPatient 
      ? telemedicineSession.accessTokenPatient 
      : telemedicineSession.accessTokenProfessional) || "";

    if (!token) {
      throw new Error("Token não encontrado.");
    }

    serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "";

    // Se é profissional, e a sessão está como SCHEDULED ou WAITING, marca como IN_PROGRESS
    if (!isPatient && (telemedicineSession.status === "SCHEDULED" || telemedicineSession.status === "WAITING")) {
      await telemedicineService.startSession(tenantId, sessionId, userId);
    }
  } catch (error) {
    console.error("Error joining telemedicine session", error);
    throw error;
  }

  return (
    <TelemedicineRoom 
      token={token} 
      serverUrl={serverUrl} 
      isProfessional={!isPatient} 
    />
  );
}
