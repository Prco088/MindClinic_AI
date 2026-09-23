"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { patientSchema, PatientFormValues } from "@/lib/validations/patient";

async function getSessionTenantId() {
  const session = await auth();
  if (!session?.user?.tenantId) {
    throw new Error("Não autorizado. Usuário não pertence a nenhum tenant.");
  }
  return session.user.tenantId;
}

export async function createPatient(data: PatientFormValues) {
  const tenantId = await getSessionTenantId();
  const parsedData = patientSchema.parse(data);

  // Check if CPF already exists in this tenant
  if (parsedData.cpf) {
    const existingCpf = await prisma.patient.findFirst({
      where: {
        tenantId,
        cpf: parsedData.cpf,
      },
    });

    if (existingCpf) {
      throw new Error("Já existe um paciente com este CPF cadastrado.");
    }
  }

  const patient = await prisma.patient.create({
    data: {
      ...parsedData,
      tenantId,
    },
  });

  revalidatePath("/patients");
  return patient;
}

export async function updatePatient(id: string, data: PatientFormValues) {
  const tenantId = await getSessionTenantId();
  const parsedData = patientSchema.parse(data);

  // Verify ownership
  const existing = await prisma.patient.findUnique({
    where: { id },
  });

  if (!existing || existing.tenantId !== tenantId) {
    throw new Error("Paciente não encontrado ou não autorizado.");
  }

  // Check CPF conflict if changing
  if (parsedData.cpf && parsedData.cpf !== existing.cpf) {
    const existingCpf = await prisma.patient.findFirst({
      where: {
        tenantId,
        cpf: parsedData.cpf,
      },
    });

    if (existingCpf) {
      throw new Error("Já existe outro paciente com este CPF cadastrado.");
    }
  }

  const patient = await prisma.patient.update({
    where: { id },
    data: parsedData,
  });

  revalidatePath("/patients");
  revalidatePath(`/patients/${id}`);
  return patient;
}

export async function getPatientById(id: string) {
  const tenantId = await getSessionTenantId();
  
  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient || patient.tenantId !== tenantId) {
    return null;
  }

  return patient;
}

export async function getPatients(query: string = "", page: number = 1, pageSize: number = 10) {
  const tenantId = await getSessionTenantId();
  
  const skip = (page - 1) * pageSize;

  const where: Prisma.PatientWhereInput = {
    tenantId,
    OR: query ? [
      { fullName: { contains: query, mode: "insensitive" } },
      { cpf: { contains: query } },
    ] : undefined,
  };

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.patient.count({ where }),
  ]);

  return {
    patients,
    total,
    pageCount: Math.ceil(total / pageSize),
  };
}

export async function archivePatient(id: string) {
  const tenantId = await getSessionTenantId();

  const existing = await prisma.patient.findUnique({
    where: { id },
  });

  if (!existing || existing.tenantId !== tenantId) {
    throw new Error("Paciente não encontrado ou não autorizado.");
  }

  await prisma.patient.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/patients");
}
