import prisma from "@/lib/prisma";

export async function getPromptTemplates(tenantId: string) {
  return prisma.aiPromptTemplate.findMany({
    where: { tenantId },
  });
}

export async function createPromptTemplate(
  tenantId: string,
  name: string,
  promptTemplate: string,
  description?: string
) {
  return prisma.aiPromptTemplate.create({
    data: {
      tenantId,
      name,
      promptTemplate,
      description,
    },
  });
}
