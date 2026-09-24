# Backup Strategy - MindClinic AI

O MindClinic AI depende de três armazenamentos de estado críticos: Banco de Dados Relacional, Armazenamento de Objetos (S3/R2) e Identidade/Credenciais (Auth/Logs).

## 1. PostgreSQL (Neon)
A hospedagem no Neon.tech gerencia automaticamente:
- **Point-in-Time Recovery (PITR)**: Suporta retorno no tempo até 7-30 dias baseando-se no plano.
- **Snapshots Regulares**: Uma vez a cada 24 horas para S3 frio de infraestrutura.
**Estratégia Adicional**: Agendar cron job (via GitHub Actions) para realizar `pg_dump` semanal do banco de Produção criptografado e enviá-lo a um bucket Cloudflare R2 isolado.

## 2. Cloudflare R2 (Documentos e Midias)
- Cloudflare R2 é durável e as réplicas globais garantem redundância.
- **Prevenção contra Exclusão**: Ativar o `Object Versioning` no Bucket para manter versões deletadas de exames ou anamneses durante um período de retenção (ex: 90 dias) antes da limpeza definitiva.

## 3. Restauração (Restore Procedure)
Em caso de catástrofe total (corrupção lógica do banco de dados na Branch Principal do Neon):
1. Pausar a aplicação via Vercel Dashboard (Maintenance Mode).
2. Restaurar um Branch PITR no painel da Neon.
3. Trocar a String de Conexão na Vercel para a nova Branch de emergência.
4. Validar os dados e desativar o Maintenance Mode.
