# Landing Page de Mentoria Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/landing-mentoria/design.md`
**Content**: `.specs/features/landing-mentoria/content.md`
**Status**: Approved

**Escopo desta rodada: P1 (MVP) apenas.** P2 (Sobre o mentor, FAQ, lista de inscrições, analytics) e P3 (depoimentos, triagem) ganham uma rodada de Tasks própria depois que o P1 estiver no ar e verificado - evita inflar esta leva além do necessário pra ter algo vendável.

**Planos (slugs de código)**: `primeira-vaga` (R$199, foco 1º emprego/estágio) e `proximo-nivel` (R$499, foco progressão de carreira). Os dois planos entregam exatamente o mesmo pacote - call, relatório, trilha no Classroom e grupo de WhatsApp, 6 meses de acesso - a diferença é só o público-alvo e o conteúdo da trilha (decisão de 2026-10-01, ver `context.md` §"Escopo por plano"). Nenhuma lógica de código deve ramificar por plano, exceto preço/descrição no checkout.

---

## Test Coverage Matrix

> Gerado sem código/guideline prévios no repo (projeto greenfield) - defaults fortes aplicados. Confirmar antes do Execute.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------- | --------------------- | ------------------ | ------------ |
| Domínio / lib (state machine, repositórios, processamento de webhook, cliente Asaas, e-mail) | unit | Todas as branches; 1:1 com as ACs do spec; todo edge case listado coberto | `lib/**/*.test.ts`, `emails/**/*.test.ts` | `npm run test` |
| API route handlers (`/api/checkout`, `/api/webhooks/asaas`, `/api/cron/*`) | integration | Caminho feliz + todo edge/erro listado para a rota | `app/api/**/*.test.ts` | `npm run test` |
| Página / interação client-side (landing, obrigado, CTAs) | e2e | Caminho feliz + responsivo + edge cases visíveis ao usuário | `e2e/**/*.spec.ts` | `npm run test:e2e` |
| Componente apresentacional (sem lógica/branching própria) | none | - (coberto transitivamente pelo e2e da página que o usa) | - | - |
| Config / schema / infra / conteúdo estático (migrations, `*.config.ts`, `vercel.json`, `content/*.ts`) | none | - (build gate apenas) | - | build gate only |

## Gate Check Commands

> Provisório - confirmar os comandos reais quando o `package.json` existir (T1).

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Depois de tasks só com testes unitários | `npm run test` |
| Full | Depois de tasks com e2e/integração | `npm run test && npm run test:e2e` |
| Build | Fim de fase ou tasks só de config/schema/conteúdo | `npm run lint && npm run build` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Fundação & Infra

```
T1 → T2
T1 → T3
T1 → T4
T1 → T5
T2 → T6
T5 → T6
```

### Phase 2: Conteúdo (AD-002)

```
T7
```

### Phase 3: Camada de dados

```
T8 → T9
T10
```

### Phase 4: Landing page (P1 - ver e comparar planos)

```
T11 → T13
T12 → T13
```

### Phase 5: Checkout (P1 - pagar o plano)

```
T14 → T15 → T16
```

### Phase 6: Webhook - núcleo (P1 - confirmação pós-pagamento)

```
T17 → T18 → T19 → T20
```

### Phase 7: E-mails + obrigado (P1)

```
T21 → T22 → T23
T24
```

### Phase 8: Expiração (cron) (P1)

```
T25 → T26
```

---

## Task Breakdown

### Phase 1: Fundação & Infra

#### T1: Inicializar o projeto Next.js

**What**: Criar o projeto Next.js (App Router, TypeScript, Tailwind CSS, ESLint) com a estrutura de pastas `app/`, `components/`, `lib/`.
**Where**: `package.json`
**Depends on**: None
**Reuses**: N/A (greenfield)
**Requirement**: -

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `npm run dev` sobe a aplicação
- [x] `npm run build` e `npm run lint` passam sem erro
- [x] Estrutura `app/`, `components/`, `lib/` criada

**Tests**: none
**Gate**: build
**Commit**: `chore(scaffold): initialize Next.js app`

**Status**: ✅ Complete

---

#### T2: Loader tipado de variáveis de ambiente

**What**: Criar `lib/env.ts` validando as env vars obrigatórias (`ASAAS_API_KEY`, `ASAAS_API_BASE_URL`, `ASAAS_WEBHOOK_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `MENTOR_EMAIL`, `ADMIN_PASSWORD`, `CRON_SECRET`), lançando erro nomeando a var ausente.
**Where**: `lib/env.ts`
**Depends on**: T1
**Reuses**: N/A
**Requirement**: -

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `getEnv()` retorna objeto tipado com todas as vars presentes
- [x] Lança erro claro nomeando a variável quando uma obrigatória falta
- [x] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(config): add typed environment loader`

**Status**: ✅ Complete

---

#### T3: Configurar Vitest

**What**: Configurar Vitest para os testes unitários/integração do projeto (`lib/`, `app/api/`), com script `test` no `package.json` e um teste smoke.
**Where**: `vitest.config.ts`
**Depends on**: T1
**Reuses**: N/A

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `npm run test` executa e passa o teste smoke
- [x] Config cobre `lib/**/*.test.ts` e `app/api/**/*.test.ts`

**Tests**: none
**Gate**: build
**Commit**: `chore(test): configure vitest`

**Status**: ✅ Complete

---

#### T4: Configurar Playwright

**What**: Configurar Playwright para e2e, com script `test:e2e` e um teste smoke acessando a home.
**Where**: `playwright.config.ts`
**Depends on**: T1
**Reuses**: N/A

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `npm run test:e2e` executa e passa o teste smoke
- [x] Config cobre `e2e/**/*.spec.ts`

**Tests**: none
**Gate**: build
**Commit**: `chore(test): configure playwright`

**Status**: ✅ Complete

---

#### T5: Migration SQL - enrollments e webhook_events

**What**: Escrever a migration criando as tabelas `enrollments` e `webhook_events` conforme os Data Models do design (PK, enums de `status`/`plan` via check constraint com os valores `primeira-vaga`/`proximo-nivel`, índice em `expires_at`).
**Where**: `supabase/migrations/0001_init.sql`
**Depends on**: T1
**Reuses**: N/A

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Tabela `enrollments` criada com todos os campos do design (`id`, `asaasCheckoutId`, `plan`, `status`, `customerName`, `customerEmail`, `amountCents`, `paidAt`, `expiresAt`, `createdAt`, `updatedAt`)
- [x] Tabela `webhook_events` criada com PK = `id` (event id do Asaas)
- [x] Migration aplica limpa num projeto Supabase novo (verificado contra Postgres real via `@electric-sql/pglite`, sem projeto Supabase disponível neste ambiente - ver nota no commit)

**Tests**: none
**Gate**: build
**Commit**: `feat(db): add enrollments and webhook_events schema`

**Status**: ✅ Complete

---

#### T6: Client Supabase server-only

**What**: Implementar o factory do client Supabase (service role key via `lib/env.ts`), uso restrito a API routes e cron - nunca exposto ao client.
**Where**: `lib/supabase.ts`
**Depends on**: T2, T5
**Reuses**: `lib/env.ts`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Factory lança erro claro se faltar env obrigatória
- [x] Retorna um client Supabase configurado quando o env está completo
- [x] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(db): add server-only Supabase client factory`

**Status**: ✅ Complete

---

### Phase 2: Conteúdo (AD-002)

#### T7: Módulo de conteúdo tipado

**What**: Transcrever `.specs/features/landing-mentoria/content.md` (seções 2-13) para módulos tipados: `content/plans.ts` (os 2 planos - `primeira-vaga` R$199 e `proximo-nivel` R$499 - com entregáveis idênticos e só o texto de público-alvo/foco da trilha diferindo, seção 4), `content/copy.ts` (hero, como funciona, CTA final, rodapé, aviso legal dos 7 dias - seções 2, 5, 8, 13), `content/faq.ts` (8 perguntas - seção 6) e `content/emails.ts` (assunto + corpo dos 3 e-mails - seção 10). Sem lógica, só dados.
**Where**: `content/plans.ts`
**Depends on**: T1
**Reuses**: `.specs/features/landing-mentoria/content.md` (fonte)
**Requirement**: MENT-01, MENT-02, MENT-07, MENT-24

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `content/plans.ts` exporta os 2 planos (`primeira-vaga`, `proximo-nivel`) com nome, preço, público-alvo, entregáveis (idênticos) e texto do CTA
- [x] `content/copy.ts` exporta hero, como-funciona, CTA final, rodapé e o aviso legal de 7 dias
- [x] `content/faq.ts` exporta as 8 perguntas e respostas (refletindo que os planos têm a mesma entrega, diferenciados por público)
- [x] `content/emails.ts` exporta assunto+corpo dos 3 templates (mentorando, alerta mentor, expiração)
- [x] Nenhum item marcado com ⚠️ em `content.md` vira texto final silenciosamente - placeholders óbvios (`TODO: confirmar ...`) onde o mentor ainda não decidiu (defaults já resolvidos em `content.md` §14 usados como texto final; só o domínio de produção do remetente de e-mail, sem valor concreto, ficou como `TODO`)

**Tests**: none
**Gate**: build
**Commit**: `feat(content): transcribe landing copy into typed content module`

**Status**: ✅ Complete

---

### Phase 3: Camada de dados

#### T8: Validador da máquina de estados da inscrição

**What**: Implementar `canTransition(from, to)` cobrindo exatamente os caminhos válidos: `pendente→paga`, `paga→ativa`, `ativa→expirada`, `pendente→cancelada`, `pendente→expirada`; rejeita qualquer outro par.
**Where**: `lib/enrollment-state.ts`
**Depends on**: T1
**Reuses**: N/A
**Requirement**: MENT-19

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Cada transição válida listada retorna `true`
- [x] Pelo menos 3 transições inválidas (ex.: `expirada→paga`, `cancelada→ativa`, `paga→pendente`) retornam `false`
- [x] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(domain): add enrollment state machine validator`

**Status**: ✅ Complete

---

#### T9: Repositório de inscrições

**What**: Implementar `createEnrollment`, `findActiveByEmailAndPlan` e `markExpiredEnrollments` em cima de `lib/supabase.ts`, usando `lib/enrollment-state.ts` para validar toda transição antes de persistir.
**Where**: `lib/enrollments.ts`
**Depends on**: T6, T8
**Reuses**: `lib/supabase.ts`, `lib/enrollment-state.ts`
**Requirement**: MENT-10, MENT-18, MENT-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `createEnrollment` calcula `expiresAt` = pagamento + 6 meses para qualquer plano (`primeira-vaga` ou `proximo-nivel`) - os dois incluem Classroom e WhatsApp
- [x] `findActiveByEmailAndPlan` retorna a inscrição quando existe uma ativa e `null` quando não
- [x] `markExpiredEnrollments(now)` move para `expirada` qualquer inscrição vencida (qualquer plano), respeitando a máquina de estados, e devolve a lista das que mudaram
- [x] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(domain): add enrollment repository`

**Status**: ✅ Complete

---

#### T10: Repositório de eventos de webhook

**What**: Implementar `recordEvent` (insert idempotente, PK = event id do Asaas; conflito de PK vira "already processed") e `logOutcome` (grava resultado sucesso/erro + payload bruto).
**Where**: `lib/webhook-events.ts`
**Depends on**: T6
**Reuses**: `lib/supabase.ts`
**Requirement**: MENT-12, MENT-21

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Evento novo é gravado com sucesso
- [x] O mesmo event id enviado duas vezes resulta em no-op na segunda, sem lançar erro
- [x] `logOutcome` grava resultado e mensagem de erro (quando houver)
- [x] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(domain): add webhook event log repository`

**Status**: ✅ Complete

---

### Phase 4: Landing page (P1 - ver e comparar planos)

#### T11: Componente PlanComparison

**What**: Componente apresentacional puro renderizando os 2 planos (dados de `content/plans.ts`) lado a lado, com preço, público-alvo, entregáveis e CTA por plano; empilha verticalmente abaixo de 768px.
**Where**: `components/PlanComparison.tsx`
**Depends on**: T7
**Reuses**: `content/plans.ts`
**Requirement**: MENT-01, MENT-02, MENT-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Renderiza os 2 planos com preço, público-alvo e lista de entregáveis vindos de `content/plans.ts`
- [x] Um botão de CTA por plano, sem lógica de clique ainda (vem em T16)
- [x] Layout empilha verticalmente abaixo de 768px sem scroll horizontal

**Tests**: none
**Gate**: build
**Commit**: `feat(ui): add plan comparison component`

**Status**: ✅ Complete

---

#### T12: Componente LegalNotice

**What**: Componente apresentacional com o aviso de 7 dias de arrependimento (Art. 49 CDC) e a política de reembolso, texto de `content/copy.ts`.
**Where**: `components/LegalNotice.tsx`
**Depends on**: T7
**Reuses**: `content/copy.ts`
**Requirement**: MENT-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Exibe o texto do aviso de 7 dias vindo de `content/copy.ts`

**Tests**: none
**Gate**: build
**Commit**: `feat(ui): add legal withdrawal notice component`

**Status**: ✅ Complete

---

#### T13: Montar a landing page

**What**: Montar `app/page.tsx` integrando `PlanComparison` e `LegalNotice` (aviso visível antes da confirmação do pagamento, ou seja, na própria página de planos).
**Where**: `app/page.tsx`
**Depends on**: T11, T12
**Reuses**: `components/PlanComparison.tsx`, `components/LegalNotice.tsx`
**Requirement**: MENT-01, MENT-02, MENT-03, MENT-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] e2e desktop: os 2 planos, preços e CTAs aparecem corretamente
- [x] e2e mobile (viewport < 768px): planos empilhados, sem scroll horizontal, CTAs visíveis
- [x] e2e: aviso legal de 7 dias visível na página de planos
- [x] Gate check passa: `npm run test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(ui): assemble landing page`

**Status**: ✅ Complete

---

### Phase 5: Checkout (P1 - pagar o plano)

#### T14: Cliente Asaas - criação de checkout

**What**: Verificar o schema oficial de `POST /v3/checkouts` em `https://docs.asaas.com/v3/reference/criar-novo-checkout` (a doc fetchada antes não trouxe o schema completo - ver Risks do design) e implementar `createCheckout(plan, origin): Promise<{checkoutUrl: string}>` usando os campos confirmados: `billingTypes: [PIX, CREDIT_CARD]`, `chargeTypes: DETACHED` (cobrança única), item com nome/valor/descrição do plano (`primeira-vaga` ou `proximo-nivel`), `callback.successUrl` apontando para `/obrigado`.
**Where**: `lib/asaas.ts`
**Depends on**: T2, T7
**Reuses**: `lib/env.ts`, `content/plans.ts`
**Requirement**: MENT-04, MENT-05, MENT-22

**Tools**:
- MCP: NONE
- Skill: NONE
- Outro: WebFetch para confirmar o schema oficial antes de codar o payload

**Done when**:
- [x] Schema do `POST /v3/checkouts` confirmado contra a referência oficial (não assumido)
- [x] `createCheckout("primeira-vaga", origin)` e `createCheckout("proximo-nivel", origin)` retornam uma URL de checkout válida em caso de sucesso (mock)
- [x] Erro 5xx/timeout da API do Asaas lança um erro tipado reconhecível pela rota (T15)
- [x] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(checkout): add Asaas checkout client`

**Status**: ✅ Complete

---

#### T15: Rota de checkout

**What**: `POST /api/checkout` valida o `plan` recebido, chama `lib/asaas.ts`, retorna `{ checkoutUrl }` em sucesso ou `{ error }` com status 502 se a criação do checkout no Asaas falhar.
**Where**: `app/api/checkout/route.ts`
**Depends on**: T14
**Reuses**: `lib/asaas.ts`
**Requirement**: MENT-04, MENT-05, MENT-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `plan: "primeira-vaga"` e `plan: "proximo-nivel"` retornam `checkoutUrl` em caminho feliz (Asaas mockado)
- [x] Falha do Asaas (mock 5xx/timeout) retorna 502 com mensagem amigável
- [x] `plan` ausente ou inválido retorna 400
- [x] Gate check passa: `npm run test`

**Tests**: integration
**Gate**: full
**Commit**: `feat(checkout): add checkout API route`

**Status**: ✅ Complete

---

#### T16: Conectar os CTAs ao checkout

**What**: Conectar os botões CTA de `PlanComparison` a `/api/checkout`: desabilita o botão assim que a primeira requisição parte (evita checkout duplicado por duplo clique), redireciona para `checkoutUrl` em sucesso, mostra erro inline e reabilita o botão em falha sem perder o plano selecionado.
**Where**: `components/PlanComparison.tsx`
**Depends on**: T13, T15
**Reuses**: `app/api/checkout/route.ts`
**Requirement**: MENT-06, MENT-08, MENT-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] e2e: clicar no CTA (API mockada) redireciona para a URL de checkout retornada
- [ ] e2e: dois cliques em sequência rápida no mesmo CTA disparam só uma chamada a `/api/checkout`
- [ ] e2e: falha simulada da API mostra erro e permite nova tentativa, mantendo o plano selecionado
- [ ] Gate check passa: `npm run test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(checkout): wire plan CTAs to checkout API`

---

### Phase 6: Webhook - núcleo (P1 - confirmação pós-pagamento)

#### T17: Validador de token do webhook

**What**: `isValidWebhookToken(headerValue)` comparando contra `ASAAS_WEBHOOK_TOKEN`.
**Where**: `lib/verify-asaas-webhook.ts`
**Depends on**: T2
**Reuses**: `lib/env.ts`
**Requirement**: MENT-11

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Token correto → `true`
- [ ] Token incorreto → `false`
- [ ] Header ausente → `false`
- [ ] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(webhook): add webhook token validator`

---

#### T18: Endpoint do webhook (esqueleto)

**What**: `POST /api/webhooks/asaas` valida o header `asaas-access-token` (401 se inválido/ausente via T17), faz parse do payload, grava o evento via `lib/webhook-events.ts` (idempotente por event id), tolera campos desconhecidos no payload sem lançar erro, e retorna 200 após o registro.
**Where**: `app/api/webhooks/asaas/route.ts`
**Depends on**: T17, T10
**Reuses**: `lib/verify-asaas-webhook.ts`, `lib/webhook-events.ts`
**Requirement**: MENT-11, MENT-12, MENT-21

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Evento com token válido é registrado e retorna 200
- [ ] Token inválido/ausente retorna 401 sem gravar nada
- [ ] Mesmo event id enviado duas vezes não duplica o registro (idempotência)
- [ ] Payload com campos extras desconhecidos é aceito sem erro
- [ ] Gate check passa: `npm run test`

**Tests**: integration
**Gate**: full
**Commit**: `feat(webhook): add Asaas webhook endpoint`

---

#### T19: Processar CHECKOUT_PAID

**What**: Em `lib/process-checkout-event.ts`, ao receber `CHECKOUT_PAID`: valida o e-mail do cliente (rejeita o registro automático e sinaliza alerta ao mentor se malformado), checa se já existe inscrição ativa no mesmo e-mail+plano (sinaliza duplicidade, não bloqueia) e cria a inscrição via `EnrollmentRepository.createEnrollment` com `expiresAt` calculado.
**Where**: `lib/process-checkout-event.ts`
**Depends on**: T9, T18
**Reuses**: `lib/enrollments.ts`
**Requirement**: MENT-10, MENT-17, MENT-18

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `CHECKOUT_PAID` válido (qualquer plano - `primeira-vaga` ou `proximo-nivel`) cria inscrição com `expiresAt` = pagamento + 6 meses
- [ ] E-mail do cliente malformado → nenhuma inscrição criada, resultado sinalizado para alerta ao mentor
- [ ] E-mail já com inscrição ativa no mesmo plano → cria mesmo assim e sinaliza duplicidade
- [ ] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: full
**Commit**: `feat(webhook): handle CHECKOUT_PAID processing`

---

#### T20: Processar cancelamento, expiração e eventos fora de ordem

**What**: Estender `processCheckoutEvent` para `CHECKOUT_CANCELED`/`CHECKOUT_EXPIRED` (no-op se não havia `CHECKOUT_PAID` processado antes para o mesmo checkout) e para o caso de um `CANCELED`/`EXPIRED` chegar depois de um `PAID` já processado do mesmo checkout (mantém a inscrição paga como definitiva, registra o conflito).
**Where**: `lib/process-checkout-event.ts`
**Depends on**: T19
**Reuses**: `lib/process-checkout-event.ts` (T19)
**Requirement**: MENT-06, MENT-13

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `CANCELED`/`EXPIRED` sem `PAID` anterior → nenhuma inscrição criada
- [ ] `CANCELED`/`EXPIRED` recebido após `PAID` já processado do mesmo checkout → inscrição permanece `paga`/`ativa`, conflito registrado para revisão manual
- [ ] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: full
**Commit**: `feat(webhook): handle out-of-order and terminal-failure events`

---

### Phase 7: E-mails + obrigado (P1)

#### T21: Helper de retry para e-mail

**What**: `sendWithRetry(fn, maxAttempts=3)` genérico + client Resend configurado via `lib/env.ts`.
**Where**: `lib/email.ts`
**Depends on**: T2
**Reuses**: `lib/env.ts`
**Requirement**: MENT-16

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Sucesso na 1ª tentativa não tenta de novo
- [ ] Falha transitória seguida de sucesso (2ª ou 3ª tentativa) retorna sucesso
- [ ] 3 falhas seguidas desistem e propagam o erro final para quem chamou registrar
- [ ] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(email): add retry-wrapped Resend client`

---

#### T22: Templates de e-mail transacional

**What**: Implementar `sendMenteeConfirmation`, `sendMentorNewEnrollmentAlert` (qualquer plano, MENT-15) e `sendMentorExpirationAlert`, usando `lib/email.ts` e copy de `content/emails.ts`.
**Where**: `emails/templates.tsx`
**Depends on**: T21, T7
**Reuses**: `lib/email.ts`, `content/emails.ts`
**Requirement**: MENT-14, MENT-15, MENT-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `sendMenteeConfirmation` envia ao e-mail do mentorando com assunto/corpo de `content/emails.ts` §10.1
- [ ] `sendMentorNewEnrollmentAlert` envia ao `MENTOR_EMAIL` tanto para `primeira-vaga` quanto para `proximo-nivel`, com os dados corretos (§10.2)
- [ ] `sendMentorExpirationAlert` envia ao `MENTOR_EMAIL` com os dados corretos (§10.3)
- [ ] Gate check passa: `npm run test`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(email): add transactional email templates`

---

#### T23: Conectar e-mails ao processamento do webhook

**What**: Conectar os envios de e-mail ao resultado de `processCheckoutEvent`: `CHECKOUT_PAID` válido → e-mail ao mentorando + e-mail ao mentor (qualquer plano); dado malformado (MENT-17) → só alerta ao mentor, sem e-mail ao mentorando.
**Where**: `lib/process-checkout-event.ts`
**Depends on**: T19, T22
**Reuses**: `emails/templates.tsx`
**Requirement**: MENT-14, MENT-15, MENT-17

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `CHECKOUT_PAID` válido do `primeira-vaga` → mentorando e mentor recebem e-mail
- [ ] `CHECKOUT_PAID` válido do `proximo-nivel` → mentorando e mentor recebem e-mail
- [ ] Dado malformado → só o mentor recebe e-mail
- [ ] Gate check passa: `npm run test`

**Tests**: integration
**Gate**: full
**Commit**: `feat(webhook): send confirmation and alert emails on payment`

---

#### T24: Página de obrigado

**What**: `app/obrigado/page.tsx` com o texto de `content/copy.ts` §9; `lib/asaas.ts` (T14) já aponta `callback.successUrl` para essa rota.
**Where**: `app/obrigado/page.tsx`
**Depends on**: T14, T7
**Reuses**: `content/copy.ts`
**Requirement**: MENT-22

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] e2e: acessar `/obrigado` diretamente renderiza o texto esperado
- [ ] Gate check passa: `npm run test:e2e`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(ui): add thank-you page`

---

### Phase 8: Expiração (cron) (P1)

#### T25: Endpoint de varredura de expiração

**What**: `GET /api/cron/check-expirations` valida `Authorization: Bearer <CRON_SECRET>`, chama `markExpiredEnrollments(now)` e envia `sendMentorExpirationAlert` para cada inscrição recém-marcada como expirada.
**Where**: `app/api/cron/check-expirations/route.ts`
**Depends on**: T9, T22, T2
**Reuses**: `lib/enrollments.ts`, `emails/templates.tsx`
**Requirement**: MENT-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Secret ausente ou incorreto → 401, nada é processado
- [ ] Inscrições vencidas (qualquer plano) são marcadas `expirada` e o mentor recebe um e-mail por cada uma
- [ ] Inscrições não vencidas permanecem intactas
- [ ] Gate check passa: `npm run test`

**Tests**: integration
**Gate**: full
**Commit**: `feat(cron): add expiration sweep endpoint`

---

#### T26: Agendar o cron de expiração

**What**: Configurar `vercel.json` com o agendamento diário apontando para `/api/cron/check-expirations`; documentar `CRON_SECRET` em `.env.example`.
**Where**: `vercel.json`
**Depends on**: T25
**Reuses**: N/A
**Requirement**: MENT-20

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `vercel.json` agenda a rota 1x/dia
- [ ] `CRON_SECRET` documentado em `.env.example`
- [ ] Trigger manual (`curl` com o secret correto) contra o ambiente de preview executa com sucesso

**Tests**: none
**Gate**: build
**Commit**: `chore(cron): schedule daily expiration check`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8

Phase 1:  T1 → T2 → T6
          T1 → T3
          T1 → T4
          T1 → T5 → T6
Phase 2:  T7
Phase 3:  T8 → T9
          T10
Phase 4:  T11 → T13
          T12 → T13
Phase 5:  T14 → T15 → T16
Phase 6:  T17 → T18 → T19 → T20
Phase 7:  T21 → T22 → T23
          T24
Phase 8:  T25 → T26
```

Execution is strictly sequential within each phase - a single agent (or batch worker) works one task at a time, in the order listed above. Cross-phase dependencies (e.g., T7 depends on T1, T14 depends on T7) are backward-only and enforced by the phase order itself, not re-drawn here.

**26 tasks total → packs into 4 batches** (whole phases, cut never splits a phase): Batch 1 = Phases 1-2 (T1-T7, 7 tasks), Batch 2 = Phases 3-4 (T8-T13, 6 tasks), Batch 3 = Phases 5-6 (T14-T20, 7 tasks), Batch 4 = Phases 7-8 (T21-T26, 6 tasks).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Inicializar Next.js | 1 scaffold (config+estrutura inicial, inerentemente multi-arquivo) | ⚠️ OK - setup único e coeso |
| T2: lib/env.ts | 1 arquivo | ✅ Granular |
| T3: Vitest config | 1 arquivo | ✅ Granular |
| T4: Playwright config | 1 arquivo | ✅ Granular |
| T5: Migration SQL | 1 arquivo | ✅ Granular |
| T6: lib/supabase.ts | 1 arquivo | ✅ Granular |
| T7: Content module | 4 arquivos (`content/*.ts`), 1 conceito (transcrição do content.md) | ⚠️ OK - coeso, mesma fonte/mesmo conceito |
| T8: lib/enrollment-state.ts | 1 arquivo | ✅ Granular |
| T9: lib/enrollments.ts | 1 arquivo | ✅ Granular |
| T10: lib/webhook-events.ts | 1 arquivo | ✅ Granular |
| T11: PlanComparison | 1 componente | ✅ Granular |
| T12: LegalNotice | 1 componente | ✅ Granular |
| T13: app/page.tsx | 1 arquivo | ✅ Granular |
| T14: lib/asaas.ts | 1 arquivo | ✅ Granular |
| T15: app/api/checkout/route.ts | 1 endpoint | ✅ Granular |
| T16: Wire CTAs | 1 arquivo (PlanComparison, modificação) | ✅ Granular |
| T17: lib/verify-asaas-webhook.ts | 1 arquivo | ✅ Granular |
| T18: app/api/webhooks/asaas/route.ts | 1 endpoint | ✅ Granular |
| T19: process-checkout-event (PAID) | 1 arquivo | ✅ Granular |
| T20: process-checkout-event (extensão) | 1 arquivo (mesmo de T19, modificação) | ✅ Granular |
| T21: lib/email.ts | 1 arquivo | ✅ Granular |
| T22: emails/templates.tsx | 1 arquivo, 3 funções coesas (mesmo conceito: templates transacionais) | ⚠️ OK - coeso |
| T23: Wire e-mails no webhook | 1 arquivo (process-checkout-event, modificação) | ✅ Granular |
| T24: app/obrigado/page.tsx | 1 arquivo | ✅ Granular |
| T25: cron route | 1 endpoint | ✅ Granular |
| T26: vercel.json | 1 arquivo | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ----------------------- | -------------- | ------ |
| T1 | None | - | ✅ Match |
| T2 | T1 | T1→T2 | ✅ Match |
| T3 | T1 | T1→T3 | ✅ Match |
| T4 | T1 | T1→T4 | ✅ Match |
| T5 | T1 | T1→T5 | ✅ Match |
| T6 | T2, T5 | T2→T6, T5→T6 | ✅ Match |
| T7 | T1 (cross-fase) | - (fora do escopo do diagrama da Fase 2) | ✅ Match |
| T8 | T1 (cross-fase) | - (fora do escopo do diagrama da Fase 3) | ✅ Match |
| T9 | T6 (cross-fase), T8 | T8→T9 | ✅ Match |
| T10 | T6 (cross-fase) | - (fora do escopo do diagrama da Fase 3) | ✅ Match |
| T11 | T7 (cross-fase) | - (fora do escopo do diagrama da Fase 4) | ✅ Match |
| T12 | T7 (cross-fase) | - (fora do escopo do diagrama da Fase 4) | ✅ Match |
| T13 | T11, T12 | T11→T13, T12→T13 | ✅ Match |
| T14 | T2 (cross-fase), T7 (cross-fase) | - (fora do escopo do diagrama da Fase 5) | ✅ Match |
| T15 | T14 | T14→T15 | ✅ Match |
| T16 | T13 (cross-fase), T15 | T15→T16 | ✅ Match |
| T17 | T2 (cross-fase) | - (fora do escopo do diagrama da Fase 6) | ✅ Match |
| T18 | T17, T10 (cross-fase) | T17→T18 | ✅ Match |
| T19 | T9 (cross-fase), T18 | T18→T19 | ✅ Match |
| T20 | T19 | T19→T20 | ✅ Match |
| T21 | T2 (cross-fase) | - (fora do escopo do diagrama da Fase 7) | ✅ Match |
| T22 | T21, T7 (cross-fase) | T21→T22 | ✅ Match |
| T23 | T19 (cross-fase), T22 | T22→T23 | ✅ Match |
| T24 | T14 (cross-fase), T7 (cross-fase) | - (fora do escopo do diagrama da Fase 7) | ✅ Match |
| T25 | T9 (cross-fase), T22 (cross-fase), T2 (cross-fase) | - (fora do escopo do diagrama da Fase 8) | ✅ Match |
| T26 | T25 | T25→T26 | ✅ Match |

**Rules reminder**: cross-phase dependencies are enforced by phase order (no task above depends on a later phase), not by diagram arrows - arrows only represent intra-phase edges, per `validate_tasks.py`'s own scope.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | ---------------------------- | ----------------- | ----------- | ------ |
| T1 | Scaffold/config | none | none | ✅ OK |
| T2 | lib (domínio) | unit | unit | ✅ OK |
| T3 | Config (test runner) | none | none | ✅ OK |
| T4 | Config (test runner) | none | none | ✅ OK |
| T5 | Schema (migration) | none | none | ✅ OK |
| T6 | lib (domínio) | unit | unit | ✅ OK |
| T7 | Conteúdo estático | none | none | ✅ OK |
| T8 | lib (domínio) | unit | unit | ✅ OK |
| T9 | lib (domínio) | unit | unit | ✅ OK |
| T10 | lib (domínio) | unit | unit | ✅ OK |
| T11 | Componente apresentacional | none | none | ✅ OK |
| T12 | Componente apresentacional | none | none | ✅ OK |
| T13 | Página | e2e | e2e | ✅ OK |
| T14 | lib (domínio) | unit | unit | ✅ OK |
| T15 | API route | integration | integration | ✅ OK |
| T16 | Interação client-side (página) | e2e | e2e | ✅ OK |
| T17 | lib (domínio) | unit | unit | ✅ OK |
| T18 | API route | integration | integration | ✅ OK |
| T19 | lib (domínio) | unit | unit | ✅ OK |
| T20 | lib (domínio) | unit | unit | ✅ OK |
| T21 | lib (domínio) | unit | unit | ✅ OK |
| T22 | lib/domínio (emails) | unit | unit | ✅ OK |
| T23 | API route / integração webhook+e-mail | integration | integration | ✅ OK |
| T24 | Página | e2e | e2e | ✅ OK |
| T25 | API route | integration | integration | ✅ OK |
| T26 | Config (deploy) | none | none | ✅ OK |

Nenhuma violação - nenhuma task usa "testado em outra task" como justificativa para `Tests: none`; todo `none` corresponde a uma linha `none` da matriz.
