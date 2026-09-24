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

export async function getOrCreateDefaultTemplate(
  tenantId: string,
  name: string,
  defaultPrompt: string,
  description?: string
) {
  const existing = await prisma.aiPromptTemplate.findFirst({
    where: { tenantId, name },
  });

  if (existing) return existing.promptTemplate;

  const created = await createPromptTemplate(tenantId, name, defaultPrompt, description);
  return created.promptTemplate;
}
