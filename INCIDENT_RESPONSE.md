# Incident Response Plan

## Prioridade 1 (Severidade Crítica) - Downtime Total ou Perda de Dados
- **Diagnóstico Rápido**: Acessar o Vercel Logs e `/api/health`.
- **Ações Imediatas**:
  1. Se for erro de deploy: Fazer **Rollback** instantâneo no dashboard da Vercel.
  2. Se for erro de banco de dados (Neon fora do ar ou dados deletados): Habilitar "Maintenance Mode" nas variáveis de ambiente do Next.js, notificar a equipe médica e restaurar via PITR.

## Prioridade 2 (Severidade Alta) - Serviços Críticos (Telemedicina/IA) Interrompidos
- **Exemplo**: API Key do Gemini vencida, Servidor LiveKit fora do ar.
- **Ações**:
  1. O sistema deve degradar graciosamente. (O rate-limit já foi estipulado).
  2. Corrigir as chaves na plataforma (Vercel) e reinicializar as instâncias sem a necessidade de novos builds de código, apenas redeploy com novas env vars.

## Prioridade 3 (Severidade Média) - Lentidão Exacerbada
- Consultar a aba "Analytics & Speed Insights" da Vercel para identificar endpoints não cacheados.
- Realizar otimizações com o Prisma para queries N+1.
