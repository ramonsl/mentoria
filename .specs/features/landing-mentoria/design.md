# Landing Page de Mentoria Design

**Spec**: `.specs/features/landing-mentoria/spec.md`
**Context**: `.specs/features/landing-mentoria/context.md`
**Status**: Draft

---

## Approach Exploration

Projeto greenfield (sem código, sem `.specs/STATE.md` prévio) - a escolha de stack é decisão de projeto, não só desta feature.

| Approach | Descrição | Por que (não) |
| -------- | --------- | -------------- |
| **1. Monolito Next.js na Vercel (recomendado)** | Um único deploy: páginas (landing, obrigado, admin) + API routes (`/api/checkout`, `/api/webhooks/asaas`, cron de expiração) no mesmo projeto Next.js. | Zero overhead operacional extra para operação solo; API routes cobrem webhook + criação de checkout sem precisar de outro serviço. |
| 2. Next.js (frontend) + backend separado (Express/Fastify em Railway/Render) | Separa lógica de pagamento do site. | Rejeitado: dois deploys, dois lugares pra secrets, zero ganho real no volume e na complexidade desta feature. |
| 3. No-code (Webflow + Zapier + Google Sheets) | Monta a página e a automação sem código. | Rejeitado: não sustenta os requisitos de idempotência por event ID (MENT-12), log de auditoria (MENT-21) e máquina de estados (MENT-19) com a confiabilidade que o spec exige. |

**Escolha**: Approach 1. Detalhado abaixo.

---

## Architecture Overview

```mermaid
graph TD
    V[Visitante] -->|GET /| L[Landing Page]
    L -->|clica CTA do plano| CO[POST /api/checkout]
    CO -->|cria checkout| ASAAS_API[Asaas API]
    ASAAS_API -->|checkoutUrl| V
    V -->|paga no Asaas| ASAAS_HOSTED[Asaas Checkout hospedado]
    ASAAS_HOSTED -->|redirect sucesso| OBR[/obrigado]
    ASAAS_HOSTED -->|webhook CHECKOUT_PAID etc.| WH[POST /api/webhooks/asaas]
    WH -->|valida asaas-access-token| WH
    WH -->|upsert idempotente por event id| DB[(Supabase Postgres)]
    WH -->|dispara e-mails| EMAIL[Resend]
    CRON[Vercel Cron diario] -->|varre expiracoes| DB
    CRON -->|notifica mentor| EMAIL
    ADMIN[Mentor] -->|GET /admin/inscricoes senha| ADMPAGE[Admin list - P2]
    ADMPAGE --> DB
```

---

## Code Reuse Analysis

Projeto greenfield - não há código existente para reaproveitar. N/A.

### Integration Points

| System | Integration Method |
| ------ | ------------------- |
| Asaas API | `POST /v3/checkouts` (header `access_token: <ASAAS_API_KEY>`) para criar o checkout hospedado por plano, a partir de `/api/checkout` |
| Asaas Webhook | `POST /api/webhooks/asaas` recebe eventos `CHECKOUT_CREATED/PAID/CANCELED/EXPIRED`; autenticidade via header `asaas-access-token` comparado a `ASAAS_WEBHOOK_TOKEN` |
| Supabase Postgres | Cliente `@supabase/supabase-js` com service role key (uso só em server - API routes e cron), nunca exposto ao browser |
| Resend | `resend.emails.send(...)` a partir de `/api/webhooks/asaas` e do cron de expiração |
| Vercel Cron | `vercel.json` agenda diária batendo em `/api/cron/check-expirations` |

---

## Components

### Content Module (AD-002)

- **Purpose**: Única fonte de texto tipado da landing (planos, hero, FAQ, e-mails, SEO, rodapé), transcrito de `.specs/features/landing-mentoria/content.md` - nenhum copy hardcoded em componentes.
- **Location**: `content/plans.ts`, `content/copy.ts`, `content/emails.ts`, `content/faq.ts`
- **Interfaces**: objetos/arrays tipados simples (`PLANS: PlanDisplay[]`, `HERO_COPY`, `FAQ_ITEMS`, `EMAIL_TEMPLATES_COPY`) - sem lógica, só dados.
- **Dependencies**: Nenhuma.
- **Reuses**: N/A - transcrição direta de `content.md` (ver seções 1-13).

### PlanComparison (UI)

- **Purpose**: Renderizar os dois planos lado a lado (preço, entregáveis, CTA) e o aviso de direito de arrependimento (7 dias).
- **Location**: `app/page.tsx`, `components/PlanComparison.tsx`
- **Interfaces**: componente React puro, sem estado de servidor - props `plans: PlanDisplay[]` vindas de `content/plans.ts`.
- **Dependencies**: `content/plans.ts`, Tailwind CSS.
- **Reuses**: N/A (greenfield).

### Checkout Route Handler

- **Purpose**: Criar um Asaas Checkout hospedado para o plano escolhido e devolver a URL de pagamento.
- **Location**: `app/api/checkout/route.ts`
- **Interfaces**:
  - `POST /api/checkout` body `{ plan: "primeira-vaga" | "proximo-nivel" }` → `{ checkoutUrl: string }` (ou `{ error: string }` com status 502/503 se a API do Asaas falhar - MENT-08).
- **Dependencies**: `ASAAS_API_KEY`, `ASAAS_API_BASE_URL` (produção vs sandbox).
- **Reuses**: N/A.

> **Incerteza flagged**: a referência completa de campos de `POST /v3/checkouts` (ex.: nomes exatos de `customerData`, formato de `callback`) não foi totalmente confirmada via fetch - a doc aponta para `https://docs.asaas.com/v3/reference/criar-novo-checkout` para o schema completo. **Antes de implementar este componente**, confirmar o payload exato nessa referência (Tasks deve incluir esse passo de verificação, não assumir o shape abaixo como final).

### Asaas Webhook Handler

- **Purpose**: Validar, processar com idempotência e registrar os eventos de checkout do Asaas; disparar e-mails e atualizar o estado da inscrição.
- **Location**: `app/api/webhooks/asaas/route.ts`, `lib/webhook-events.ts`
- **Interfaces**:
  - `POST /api/webhooks/asaas` - valida header `asaas-access-token`; 401 se inválido/ausente (MENT-11).
  - `processCheckoutEvent(event: AsaasCheckoutEvent): Promise<void>` - idempotente por `event.id` (MENT-12), cobre `CHECKOUT_PAID`, `CHECKOUT_CANCELED`, `CHECKOUT_EXPIRED`; ignora campos desconhecidos no payload sem lançar erro.
- **Dependencies**: `EnrollmentRepository`, `EmailService`, `ASAAS_WEBHOOK_TOKEN`.
- **Reuses**: N/A.

### EnrollmentRepository

- **Purpose**: Acesso a dados da tabela `enrollments` - criação, busca por e-mail+plano ativo, marcação de expiradas.
- **Location**: `lib/enrollments.ts`
- **Interfaces**:
  - `createEnrollment(input: NewEnrollment): Promise<Enrollment>`
  - `findActiveByEmailAndPlan(email: string, plan: Plan): Promise<Enrollment | null>` (suporte à checagem de duplicidade - MENT-18)
  - `markExpiredEnrollments(now: Date): Promise<Enrollment[]>` (usado pelo cron)
- **Dependencies**: Supabase client (service role, server-only).
- **Reuses**: N/A.

### EmailService

- **Purpose**: Enviar os 3 templates transacionais (confirmação ao mentorando, alerta de nova inscrição ao mentor - qualquer plano, alerta de expiração ao mentor) com retry.
- **Location**: `lib/email.ts`, `emails/*.tsx` (templates React Email, copy de `content/emails.ts`)
- **Interfaces**:
  - `sendMenteeConfirmation(enrollment: Enrollment): Promise<void>`
  - `sendMentorNewEnrollmentAlert(enrollment: Enrollment): Promise<void>` - dispara para `enrollment.plan` "primeira-vaga" ou "proximo-nivel" (MENT-15, qualquer plano)
  - `sendMentorExpirationAlert(enrollment: Enrollment): Promise<void>`
  - Cada método tenta até 3x (backoff simples) antes de registrar falha final (MENT-16).
- **Dependencies**: `RESEND_API_KEY`, `MENTOR_EMAIL`, `content/emails.ts`.
- **Reuses**: N/A.

### Expiration Cron Handler

- **Purpose**: Varredura diária que marca inscrições (qualquer plano) como `expirada` ao atingir a data de expiração e notifica o mentor (MENT-20).
- **Location**: `app/api/cron/check-expirations/route.ts`, `vercel.json` (`crons` config, 1x/dia)
- **Interfaces**: `GET /api/cron/check-expirations` (chamado só pelo Vercel Cron - validar header `Authorization: Bearer <CRON_SECRET>`).
- **Dependencies**: `EnrollmentRepository`, `EmailService`, `CRON_SECRET`.
- **Reuses**: `EnrollmentRepository`, `EmailService`.

### Admin Enrollment List (P2)

- **Purpose**: Página protegida por senha listando inscrições ordenadas por proximidade da expiração.
- **Location**: `app/admin/inscricoes/page.tsx`, `middleware.ts` (checagem de senha via cookie)
- **Interfaces**: `GET /admin/inscricoes` (middleware redireciona para prompt de senha se cookie ausente/inválido).
- **Dependencies**: `ADMIN_PASSWORD`, `EnrollmentRepository`.
- **Reuses**: `EnrollmentRepository`.

---

## Data Models

### Enrollment

```typescript
type Plan = "primeira-vaga" | "proximo-nivel"
type EnrollmentStatus = "pendente" | "paga" | "ativa" | "expirada" | "cancelada"

interface Enrollment {
  id: string // uuid, pk
  asaasCheckoutId: string
  plan: Plan
  status: EnrollmentStatus
  customerName: string
  customerEmail: string
  amountCents: number
  paidAt: Date | null
  expiresAt: Date // paidAt + 6 meses, para qualquer plano (os dois incluem Classroom + WhatsApp)
  createdAt: Date
  updatedAt: Date
}
```

**Relationships**: um `Enrollment` referencia N `WebhookEvent` (1:N) pelo `asaasCheckoutId`, mas a verdade de idempotência vive em `WebhookEvent.id` (o event ID do Asaas), não no `Enrollment`.

### WebhookEvent

```typescript
interface WebhookEvent {
  id: string // event id do Asaas, pk - garante idempotência (MENT-12)
  eventType: string // CHECKOUT_PAID | CHECKOUT_CANCELED | CHECKOUT_EXPIRED | CHECKOUT_CREATED
  checkoutId: string
  payload: Record<string, unknown> // payload bruto, para auditoria (MENT-21)
  processedAt: Date
  result: "success" | "error"
  errorMessage: string | null
}
```

**Relationships**: `WebhookEvent.checkoutId` corresponde a `Enrollment.asaasCheckoutId`.

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| --------------- | -------- | ------------ |
| Asaas API indisponível ao criar checkout (MENT-08) | Route handler retorna 502 com mensagem amigável; plano selecionado mantido no client (state local) | Visitante vê aviso de "tente novamente" sem perder o plano escolhido |
| Webhook com token inválido/ausente (MENT-11) | Handler retorna 401 sem processar; evento é logado como tentativa suspeita | Nenhum - o Asaas reenviará ou é um ataque, nenhuma ação do mentorando envolvida |
| Webhook duplicado (mesmo event id) (MENT-12) | `WebhookEvent.id` como PK - segunda tentativa de insert falha por conflito de PK e é tratada como no-op | Nenhum - mentorando não recebe e-mail duplicado |
| Eventos fora de ordem (MENT-13) | Transições de estado seguem a máquina de estados; um `CANCELED` pós-`PAID` vira log de conflito, não reverte o `Enrollment` | Nenhum - mentor é alertado para revisão manual |
| Dados do cliente malformados no evento (MENT-17) | Validação de schema antes de gravar; falha de validação → não grava `Enrollment`, envia alerta ao mentor | Nenhum direto - mentor resolve manualmente |
| Falha no envio de e-mail (MENT-16) | Até 3 tentativas com backoff; falha final apenas logada (`WebhookEvent.errorMessage` ou log do cron) | Nenhum automático - mentor acompanha falhas via log/alerta |
| Duplo clique no CTA de checkout (MENT-09) | Desabilitar o botão no client assim que a primeira requisição parte | Visitante não consegue abrir dois checkouts da mesma ação |

---

## Risks & Concerns

| Concern | Location (file:line) | Impact | Mitigation |
| ------- | --------------------- | ------ | ---------- |
| Schema exato do payload `POST /v3/checkouts` não totalmente confirmado (fetch da doc não trouxe o reference completo) | `app/api/checkout/route.ts` (a criar) | Risco de implementar campos errados e o checkout falhar silenciosamente ou rejeitar a requisição | Tasks deve incluir um passo explícito de verificação contra `docs.asaas.com/v3/reference/criar-novo-checkout` antes de codar o payload final |
| Checagem de expiração depende de um cron externo (Vercel Cron) que ainda não existe no projeto | `vercel.json` (a criar) | Se o cron não disparar, inscrições expiradas não são detectadas e o mentor não é avisado para remover acesso | Task dedicada para configurar e testar o cron end-to-end (inclusive trigger manual via `curl` com o `CRON_SECRET` certo) antes de considerar a feature completa |
| Proteção do `/admin/inscricoes` é uma senha única compartilhada, não autenticação real | `middleware.ts` (a criar) | Aceitável para 1 admin e baixo tráfego (decisão já registrada no spec/context), mas não escala para múltiplos admins nem oferece revogação de acesso individual | Aceito como trade-off do P2 nesta escala; revisitar com autenticação real (ex. Supabase Auth) se o projeto crescer |

> Nenhum risco de código legado - projeto greenfield.

---

## Tech Decisions (only non-obvious ones)

| Decision | Choice | Rationale |
| -------- | ------ | --------- |
| Admin auth (P2) | Senha única via cookie + middleware, não um sistema de auth completo | Único admin, baixo tráfego - autenticação completa seria over-engineering nesta escala |
| Detecção de expiração | Vercel Cron diário, não um job acionado por evento do Asaas | Expiração é uma transição de estado por tempo (passiva), o Asaas não dispara evento nenhum para isso |
| Idempotência do webhook | PK = event ID do Asaas na tabela `WebhookEvent`, conflito de insert = no-op | Mais simples e à prova de race condition do que checar "já processei esse ID?" antes de gravar |

> **Decisão de projeto registrada em `.specs/STATE.md` como AD-001**: stack geral (Next.js/Vercel + Supabase + Resend) - ver abaixo.

---

## P2 Addendum (2026-10-03)

Escopo Medium - mesma arquitetura, sem decisão estrutural nova. Reaproveita `content/*.ts`, o padrão de componente apresentacional de `PlanComparison`/`LegalNotice`, e a decisão de admin auth já registrada acima (senha única via cookie + middleware).

### Componentes novos

- **Hero** (`components/Hero.tsx`) - apresentacional, lê `HERO_COPY` de `content/copy.ts` (já existe). CTAs são âncoras HTML simples (`<a href="#planos">`/`#sobre`) - sem JS de scroll, o navegador resolve.
- **AboutMentor** (`components/AboutMentor.tsx`) - apresentacional, lê um novo `content/about.ts` (transcrito de `content.md` §3). Foto: `public/mentor.jpg` ainda não existe (pendência do mentor) - usa um placeholder com as iniciais "RL" como fallback, conforme o default já registrado em `content.md` §14 item 2.
- **FaqSection** (`components/FaqSection.tsx`) - apresentacional, lê `FAQ_ITEMS` de `content/faq.ts` (já existe).
- **Footer** (`components/Footer.tsx`) - apresentacional, lê `FOOTER_COPY` de `content/copy.ts` (já existe), link de política de privacidade aponta para `/privacidade`.
- **Privacy page** (`app/privacidade/page.tsx`) - conteúdo estático novo (`content/privacy.ts`), texto-padrão LGPD cobrindo os dados coletados no checkout (nome, e-mail), finalidade, terceiros (Asaas, Resend, Supabase) e direitos do titular - fecha a lacuna apontada em `content.md` §13.
- **Admin login** (`app/api/admin/login/route.ts` + `app/admin/login/page.tsx`) - formulário de senha única; a rota valida contra `ADMIN_PASSWORD` (já no `lib/env.ts`) e seta um cookie `httpOnly`.
- **Admin middleware** (`middleware.ts`) - protege `/admin/inscricoes`, redireciona para `/admin/login` sem cookie válido.
- **Admin list page** (`app/admin/inscricoes/page.tsx`) - lista as inscrições via `EnrollmentRepository.listEnrollments()` (novo método), ordenadas por proximidade da expiração.

### Dado novo

`EnrollmentRepository.listEnrollments(): Promise<Enrollment[]>` - `SELECT * FROM enrollments ORDER BY expires_at ASC NULLS LAST`. Como os dois planos agora sempre têm `expiresAt` preenchido (mudança de modelo de 2026-10-01), `NULLS LAST` é defensivo, não esperado na prática.

### Risco novo

| Concern | Location | Impact | Mitigation |
| ------- | -------- | ------ | ---------- |
| Foto real do mentor ainda não existe | `components/AboutMentor.tsx` | Seção "Sobre" vai ao ar com placeholder de iniciais em vez de foto | Aceito para o lançamento - trocar por `public/mentor.jpg` é uma troca de asset, não requer novo código |
