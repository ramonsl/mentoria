# STATE

## Decisions

### AD-001
- **Decision**: Stack do projeto é um monolito Next.js (App Router) em deploy único na Vercel, com Supabase Postgres (acesso direto via `@supabase/supabase-js`, sem ORM) para persistência e Resend para e-mail transacional.
- **Reason**: Operação solo, baixo volume no lançamento - minimiza a superfície operacional a um único deploy, um provedor de banco e um provedor de e-mail, cada um escolhido pela melhor DX com Next.js e tier gratuito generoso.
- **Trade-off**: Menos portabilidade/flexibilidade do que um backend desacoplado ou um ORM com migrations formais (Prisma/Drizzle) - aceitável nesta escala, revisitar se o projeto crescer além de uma landing page + automações simples.
- **Scope**: Toda feature deste projeto que precisar de persistência, e-mail transacional ou deploy.
- **Date**: 2026-10-01
- **Status**: active

### AD-002
- **Decision**: Todo o texto da landing (bio, planos, FAQ, e-mails, SEO) vive em `.specs/features/landing-mentoria/content.md` e, na fase Execute, é transcrito para um único módulo `content/` tipado - nenhum copy hardcoded em componentes.
- **Reason**: Mentor vai revisar e trocar texto com frequência (nomes de planos, bio, FAQ); centralizar evita caça a strings em JSX.
- **Trade-off**: Uma indireção a mais entre componente e texto - irrelevante nesta escala.
- **Scope**: feature landing-mentoria e futuras páginas de conteúdo.
- **Date**: 2026-10-01
- **Status**: active

### AD-003
- **Decision**: Preços comerciais e cupons ficam persistidos no PostgreSQL. A landing e o checkout usam o mesmo repositório no servidor; o navegador nunca define o valor cobrado.
- **Reason**: O admin precisa atualizar preços sem deploy e descontos precisam ser validados contra regras persistidas.
- **Trade-off**: A landing passa a ser dinâmica e depende do banco para exibir preço atual.
- **Scope**: Toda funcionalidade futura que mostre ou cobre um plano de mentoria.
- **Date**: 2026-10-04
- **Status**: active

## Handoff

- **Feature**: landing-mentoria
- **Phase / Task**: Tasks (draft, validada por `validate_tasks.py` - 0 erros) - aguardando aprovação do usuário antes do Execute
- **Completed**: spec.md, context.md, design.md, content.md, tasks.md (26 tasks, 8 fases, escopo P1/MVP)
- **In-progress** (file:line): none
- **Next step**: usuário confirma tasks.md (stack de teste Vitest+Playwright, e ferramentas/MCPs por task) e então iniciar Execute pela Fase 1
- **Blockers**: domínio de produção (content.md §14 item 4) bloqueia só o deploy final, não o código; demais pendências de `content.md` §14 têm default e não bloqueiam
- **Uncommitted files**: nenhum ainda - projeto não tem `.git` iniciado
- **Branch**: none

**Nota 2026-10-01**: modelo dos planos mudou de diferenciação por recurso (Essencial/Completo) para diferenciação por público-alvo (Primeira Vaga R$199 / Próximo Nível R$499, mesma entrega nos dois) - `spec.md`, `context.md`, `design.md`, `content.md` e `tasks.md` já refletem essa mudança.
