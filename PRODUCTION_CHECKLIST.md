# MindClinic AI - Checklist de Produção e MVP Release

Este documento reúne todas as verificações necessárias antes do lançamento do MVP.

## Segurança e Acesso
- [x] Content Security Policy (CSP) ativado.
- [x] Security Headers (HSTS, X-Frame-Options) ativos no `next.config.ts`.
- [x] Cookies com atributo `Secure` (automático pelo NextAuth em PRD).
- [x] Sessão (JWT) limitada a 4 horas de vida.
- [x] Rate Limit configurado no `middleware.ts` (Login, API, Telemedicina).
- [x] Isolamento Multi-Tenant validado nas consultas críticas.

## Conformidade LGPD
- [x] Log de aceitação de termos (Anamnese, Telemedicina).
- [x] Relatório interno gerado na Fase 10 (LGPD_REVIEW.md).
- [x] Deleção de dados (Cascade configurado no BD Prisma).
- [x] Logs de auditoria para ações críticas implementados (`logger.audit`).

## Observabilidade e Saúde do Sistema
- [x] Endpoints `/api/health` operacionais.
- [x] Logging estruturado para SIEM/Logstash (`src/lib/monitoring/logger.ts`).
- [x] Simulação/wrapper de transações e erros de Sentry (`src/lib/monitoring/sentry.ts`).
- [x] Console de Administração e Dashboard do Sistema operacionais (`/admin/system`).

## Performance
- [x] Consultas complexas usando caching do Next.js (Dashboard Admin).
- [x] Índices essenciais do banco criados pelo Prisma.
- [x] Redução de consultas N+1 com inclusão condicional de relações (`include`).

## Infraestrutura e Deploy (Neon + Vercel + Cloudflare R2)
- [x] Variáveis de ambiente configuradas no Vercel em Production.
- [x] String de conexão de produção apontando para o Neon DB via pgbouncer/pooling.
- [x] API Keys LiveKit checadas via `/api/health`.
- [x] Backups configurados (ver `BACKUP_STRATEGY.md`).

## Qualidade e QA Final
- [x] `npm run typecheck` finalizado sem erros.
- [x] `npm run lint` finalizado (sem critical bugs).
- [x] `npx prisma validate` bem sucedido.
- [x] `npm run build` cria todos os artefatos estáticos.
