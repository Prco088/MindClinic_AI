import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (credentials.userType === "patient") {
          const patientAccount = await prisma.patientAccount.findUnique({
            where: { email: credentials.email as string },
            include: { patient: true }
          });

          if (!patientAccount || !patientAccount.passwordHash || !patientAccount.isActive) {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password as string,
            patientAccount.passwordHash
          );

          if (!isValid) {
            return null;
          }

          await prisma.patientAccount.update({
            where: { id: patientAccount.id },
            data: { lastLoginAt: new Date() }
          });

          await prisma.auditLog.create({
            data: {
              tenantId: patientAccount.patient.tenantId,
              patientId: patientAccount.patientId,
              entity: "PATIENT",
              entityId: patientAccount.patientId,
              action: "PATIENT_LOGIN",
            }
          });

          return {
            id: patientAccount.patientId,
            name: patientAccount.patient.fullName,
            email: patientAccount.email,
            role: "PATIENT",
            tenantId: patientAccount.patient.tenantId,
            type: "PATIENT",
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          type: "PROFESSIONAL",
        };
      }
    })
  ],
});
