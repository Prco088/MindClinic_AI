"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";

export async function patientLogin(prevState: unknown, formData: FormData) {
  try {
    formData.append("userType", "patient");
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciais inválidas." };
        default:
          return { error: "Algo deu errado." };
      }
    }
    throw error;
  }
}

export async function patientLogout() {
  const session = await auth();
  if (session?.user?.type === "PATIENT" && session.user.id) {
    await prisma.auditLog.create({
      data: {
        tenantId: session.user.tenantId,
        patientId: session.user.id,
        entity: "PATIENT",
        entityId: session.user.id,
        action: "PATIENT_LOGOUT",
      }
    });
  }
  await signOut({ redirectTo: "/patient/login" });
}
