<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MindClinic AI - Agent Context

**Do not break these core rules when operating in this project:**

1. **Multi-Tenancy is Mandatory:**
   - ALL database records (except global system settings) MUST belong to a `Tenant`.
   - Any query or mutation using Prisma must include `tenantId` in the `where` or `data` clause.
   - Use the centralized `getSessionTenantId()` helper in server actions to enforce isolation.

2. **Technology Stack:**
   - Next.js 16 (App Router), React 19, TypeScript (Strict).
   - Tailwind CSS + shadcn/ui.
   - Prisma v7 + Neon DB (using `@prisma/adapter-neon`).
   - Auth.js v5 for Authentication.

3. **Data Validation:**
   - Use `zod` for parsing and validation.
   - Form state management must use `react-hook-form` coupled with `@hookform/resolvers/zod`.

4. **Quality Gates:**
   - No `any` types. Code must be fully typed.
   - Run `npm run typecheck` and `npm run lint` before considering a feature complete.
   - Ensure the Next.js `build` completes successfully before ending a session.

*Refer to the README.md for the current phase tracking and architectural details.*
