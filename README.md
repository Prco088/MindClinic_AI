# MindClinic AI

MindClinic AI é uma plataforma SaaS moderna para gestão clínica, desenvolvida para psicólogos, psiquiatras e terapeutas, que incorpora inteligência artificial para otimizar prontuários e a rotina médica.

## 📊 Relatório de Progresso do Projeto

### Arquitetura Atual
- **Frontend & Backend:** [Next.js 16](https://nextjs.org/) (App Router) utilizando Server Components e Server Actions.
- **Multi-Tenancy:** Isolamento lógico de dados implementado a nível de aplicação. Todas as tabelas pertinentes possuem `tenantId`, e todas as Server Actions garantem que operações CRUD sejam rigorosamente restritas ao tenant do usuário autenticado.
- **Autenticação & Segurança:** [Auth.js](https://authjs.dev/) (NextAuth v5) integrado via Middleware para proteção de rotas, incluindo controle de papéis (RBAC - Role-Based Access Control).
- **Validação:** Validação estrita (tipagem de ponta a ponta) utilizando `zod` combinada com `react-hook-form`.

### Tecnologias Utilizadas
- **Core:** Next.js 16, React 19, TypeScript (Strict).
- **Banco de Dados:** PostgreSQL ([Neon DB](https://neon.tech/)) com arquitetura Serverless.
- **ORM:** Prisma v7 com `@prisma/adapter-neon` para conexões em edge/serverless sem esgotamento de pool.
- **Design & UI:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) + [Lucide Icons](https://lucide.dev/).
- **Ferramentas de Qualidade:** ESLint (Flat Config), Prettier.

### Estrutura de Pastas
```text
/
├─ prisma/               # Schema do Prisma e arquivos de migração
├─ public/               # Assets públicos (ícones, imagens)
└─ src/
   ├─ app/               # App Router
   │  ├─ (auth)/         # Páginas de autenticação (/login)
   │  ├─ (protected)/    # Páginas logadas (/dashboard, /patients, etc.)
   │  ├─ actions/        # Server Actions exclusivas para mutações de banco
   │  └─ api/            # Rotas de API HTTP (NextAuth)
   ├─ auth/              # Lógica e configurações do Auth.js
   ├─ components/        # Componentes UI (divididos em /ui, /dashboard, /patients)
   ├─ lib/               # Instâncias utilitárias (prisma.ts, validations/)
   └─ types/             # Definições de tipos TS globais
```

### Fases Concluídas
- ✅ **Fase 1: Fundação Técnica:** Inicialização do Next.js, TypeScript strict mode, ESLint e infraestrutura UI (shadcn/ui, Tailwind).
- ✅ **Fase 2: Banco de Dados:** Configuração do Prisma v7, integração Neon DB (Pool de conexões Serverless), validação e schema inicial.
- ✅ **Fase 3: Autenticação & Multi-Tenant:** Implementação de credenciais via Auth.js, middleware de rotas, schema de Tenants e controle RBAC.
- ✅ **Fase 4: Dashboard Clínico:** Desenvolvimento da Shell UI, Sidebar responsiva, suporte a Dark Mode, layout profissional.
- ✅ **Fase 5: Gestão de Pacientes:** Criação do módulo `/patients` com Server Actions (isoladas por Tenant), validação Zod robusta, schema de paciente estendido (incluindo chaves únicas compostas CPF+Tenant) e views CRUD completas (Tabela com paginação/busca, Criação, Visualização e Edição).

### Pendências (Atuais)
- Não existem pendências estruturais críticas ou débitos técnicos.
- Os testes estáticos `lint`, `typecheck` e `build` rodam com **0 erros**.

### Próximas Fases
- ⏳ **Fase 6: Prontuários e Documentos:** Gestão estruturada de evolução clínica, armazenamento de anexos, e termos de consentimento.
- ⏳ **Fase 7: Integração IA (Gemini):** Módulo de transcrição de consultas, assistente para resumos de sessões e sugestão de condutas clínicas baseado no histórico (RAG).
- ⏳ **Fase 8: Agenda e Telemedicina:** Calendário interativo de consultas e salas de videoconferência nativas com LiveKit.
- ⏳ **Fase 9: Faturamento:** Integração com meios de pagamento (Stripe/Asaas) para controle de recebíveis.

---

*Documento gerado e atualizado automaticamente para refletir o estado de implementação.*
