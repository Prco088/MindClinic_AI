# Guia de Deploy - MindClinic AI

Este sistema usa a stack **Next.js 16 (App Router)** + **Prisma ORM** + **PostgreSQL** hospedado na **Vercel** e **Neon.tech**.

## Configurações Iniciais
1. Garanta que o projeto `Neon.tech` (Produção) tenha a String PGBouncer ativada.
2. Adicione ao painel da Vercel todas as Secretas (Veja o `.env.example`).
3. Adicione `PRISMA_GENERATE_DATAPROXY=true` se estiver usando o acelerador. Caso seja adaptador via driver padrão, o Vercel instala e faz build por padrão.

## Processo de Deploy Automático
O CI/CD é gerenciado automaticamente pela Vercel através da ramificação `main` do repositório no GitHub.

## Comandos Críticos de Produção
- Aplicar schemas de banco (`prisma db push` ou `prisma migrate deploy`). Se for usar migrations, prefira `npx prisma migrate deploy` dentro da etapa *Build Command* na Vercel:
`npx prisma migrate deploy && next build`

## Validações Pós-Deploy
Após cada deploy de MVP na Produção:
1. Acesse `https://meu-dominio.com/api/health` para confirmar o serviço de banco, armazenamento e serviços de IA e Vídeo.
2. Efetue Login como Administrador/Profissional para checar o funcionamento do dashboard e garantir a assinatura JWT validando.
