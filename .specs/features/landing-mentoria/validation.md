# Landing Mentoria Validation

## Validation: landing-mentoria - PASS ✅

**Date**: 2026-10-02 (cycle 2 — re-verification after fix cycle)
**Spec**: `.specs/features/landing-mentoria/spec.md`
**Diff range (full feature)**: `82d33fe..HEAD` — 37 commits, 49 files changed (feature total); fix cycle re-verified: `fdbda9f~1..HEAD` (4 commits: `fdbda9f`, `df61a61`, `b2eb0f8`, `d779fc1`) — 10 files, +237/-6 lines
**Scope**: P1 (MVP) only, per `tasks.md` header ("Escopo desta rodada: P1 (MVP) apenas")
**Verifier**: independent sub-agent (author ≠ verifier) — fresh re-derivation, not a copy of the cycle-1 report

**Context**: Cycle 1 found this feature FAIL with 5 ranked gaps (MENT-11, MENT-13, MENT-18 unimplemented `SHALL` clauses; MENT-04/05 unguarded by any test; plus minor evidence gaps at MENT-01, MENT-06/22, MENT-16, unknown-event-type). This cycle independently re-derives all 22 P1 ACs from spec.md against the current code and tests, re-runs the full gate, and re-attempts the 2 previously-surviving mutations plus 5 new ones.

---

## Task Completion

All T1–T28 marked `✅ Complete` in `tasks.md` (verified by direct read, line by line; no `⚠️ Partial` or unmarked task found). The fix cycle did not add new T-numbered tasks to `tasks.md` — the 4 fix commits were applied directly against the cycle-1 ranked gaps without a formal tasks.md update. This is a process note, not a spec-compliance gap: every fix commit message cites the specific MENT-ID and cycle-1 finding it addresses, and the code/test evidence below confirms each one landed.

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1–T28 | ✅ Done | All 28 tasks marked complete |

---

## Spec-Anchored Acceptance Criteria

Scope: all 22 P1 ACs (MENT-01 → MENT-22) across the four P1 stories, re-derived from spec.md independently of cycle 1's table. Evidence-or-zero applied.

### P1: Ver e comparar os planos

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-01 | WHEN visitante acessa a home THEN exibe os 2 planos lado a lado, mesma lista de entregáveis e público-alvo | 2 cards, nome, preço, **entregáveis**, **público-alvo** visíveis | `e2e/landing-page.spec.ts:18-35` — asserts heading(name), `priceLabel`, CTA button, and (new this cycle) `card.getByText(plan.targetAudience)` + `card.getByText(plan.deliverables[0])` scoped per card via `cards.nth(index)` | ✅ PASS (deliverables sampled via first list item, not every entry — reasonable e2e scope since both plans share an identical deliverables array, asserted once is sufficient to prove the text renders) |
| MENT-02 | CTA button per plan starts checkout for that plan | Each plan has its own CTA wired to `/api/checkout` with its `plan.slug` | `components/PlanComparison.tsx:29-33`; `e2e/checkout-cta.spec.ts:8-28`; `app/api/checkout/route.test.ts:37-52` | ✅ PASS |
| MENT-03 | WHILE width < 768px, plans stack vertically, both CTAs visible, no horizontal scroll | Mobile: stacked, no `scrollWidth > clientWidth` | `e2e/landing-page.spec.ts:51-80` | ✅ PASS |

### P1: Pagar o plano escolhido via Asaas Checkout

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-04 | WHEN clica no CTA THEN redireciona para Asaas Checkout hospedado, **cobrança única (não recorrente)**, pré-preenchido | `chargeTypes: ["DETACHED"]` sent to Asaas | `lib/asaas.ts:57` sets it; **`lib/asaas.test.ts:66`** — `expect(sentBody.chargeTypes).toEqual(["DETACHED"])` (new this cycle). Confirmed by sensor M1 below: mutating to `["RECURRENT"]` now fails 2/9 tests | ✅ PASS (gap closed) |
| MENT-05 | Checkout oferece Pix e cartão de crédito parcelado | `billingTypes: ["PIX","CREDIT_CARD"]` sent to Asaas | `lib/asaas.ts:56`; **`lib/asaas.test.ts:67`** — `expect(sentBody.billingTypes).toEqual(["PIX", "CREDIT_CARD"])` (new this cycle). Confirmed by sensor M2 below: dropping `"PIX"` now fails 2/9 tests | ✅ PASS (gap closed) |
| MENT-06 | IF recusado/cancelado THEN redireciona à landing sem criar inscrição ativa | `cancelUrl: origin`; no enrollment created | No-enrollment clause: `lib/process-checkout-event.test.ts:268-283` (`CANCELED`/`EXPIRED` without prior `PAID` → `type: "ignored"`, 0 rows). Redirect-URL clause: `lib/asaas.ts:65` sets `cancelUrl: origin`; **`lib/asaas.test.ts:76`** — `expect(sentBody.callback.cancelUrl).toBe("https://mentoria.example.com")` (new this cycle) | ✅ PASS (gap closed) |
| MENT-07 | Exibe aviso de 7 dias (Art. 49 CDC) visível antes do pagamento | Legal notice text visible on plans page | `e2e/landing-page.spec.ts:82-87` — `expect(page.getByText(LEGAL_NOTICE_COPY.text)).toBeVisible()` | ✅ PASS |
| MENT-08 | IF Asaas 5xx/timeout THEN erro amigável + permite retry sem perder plano | 502 + specific message; retry keeps selection | `app/api/checkout/route.test.ts:54-65`; `e2e/checkout-cta.spec.ts:64-107` | ✅ PASS |
| MENT-09 | IF duplo clique THEN evita 2 checkouts simultâneos | Only 1 call to `/api/checkout` for 2 rapid clicks | `e2e/checkout-cta.spec.ts:30-62` — `expect(callCount).toBe(1)` | ✅ PASS |

### P1: Confirmação automática pós-pagamento

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-10 | WHEN `CHECKOUT_PAID` válido THEN registra inscrição com plano, valor, data pagamento, `expiresAt` = pagamento+6 meses, qualquer plano | `expiresAt.toISOString() === paidAt + 6 months`, both plans | `lib/process-checkout-event.test.ts:147-180` (`it.each(PLANS)`); `lib/enrollments.test.ts:120-138` | ✅ PASS |
| MENT-11 | IF token inválido/ausente THEN 401 **e registra a tentativa para auditoria** | 401 response **and** a record of the rejected attempt | `app/api/webhooks/asaas/route.ts:37-39` — `console.error("[webhook-audit] rejected request...", {tokenProvided})` added before the 401; **`app/api/webhooks/asaas/route.test.ts:129-132,147`** — `expect(consoleErrorSpy).toHaveBeenCalledTimes(1)` + message contains `"rejected request"` (new this cycle) | ✅ PASS (gap closed) — see note below |
| MENT-12 | IF mesmo event ID reenviado THEN processa 1x só, sem duplicar inscrição nem reenviar e-mail | 1 enrollment row, 2 emails total across 2 identical POSTs | `app/api/webhooks/asaas/route.paid-processing.test.ts:240-255` — `expect(client._tables.enrollments).toHaveLength(1)`, `expect(mockSend).toHaveBeenCalledTimes(2)` | ✅ PASS |
| MENT-13 | IF evento fora de ordem (`CANCELED` após `PAID` já processado) THEN mantém pago como definitivo **e registra o conflito para revisão manual** | Enrollment stays `ativa`; conflict durably recorded | "mantém definitivo": `lib/process-checkout-event.test.ts:300-327` — `expect(outcome.enrollment.status).toBe("ativa")`. "registra o conflito": `app/api/webhooks/asaas/route.ts:82-86` branches `outcome.type === "conflict"` → `logOutcome(id, "error", reason)`; **`app/api/webhooks/asaas/route.test.ts:214-234`** — `expect(mockLogOutcome).toHaveBeenCalledWith("evt-conflict", "error", "CHECKOUT_CANCELED received after CHECKOUT_PAID already processed")` (new this cycle) | ✅ PASS (gap closed) |
| MENT-14 | WHEN inscrição registrada THEN envia e-mail de confirmação ao mentorando | Mentee receives email with plan + next steps | `emails/templates.test.ts:70-83`; `lib/process-checkout-event.test.ts:176-179` | ✅ PASS |
| MENT-15 | WHEN inscrição registrada (qualquer plano) THEN envia e-mail ao mentor com nome, e-mail, plano, data de expiração | Mentor email contains all 4 fields, both plans | `emails/templates.test.ts:85-106` (`it.each(PLANS)`) | ✅ PASS |
| MENT-16 | IF envio de e-mail falhar THEN mantém inscrição + retry até 3x, registra falha final | Retry ≤3x; enrollment survives; final failure logged | Retry in isolation: `lib/email.test.ts:9-54`. End-to-end path (new this cycle): **`app/api/webhooks/asaas/route.paid-processing.test.ts:212-238`** — `mockSend.mockRejectedValue(...)`, then `expect(response.status).toBe(200)`, `expect(client._tables.enrollments).toHaveLength(1)` with `status: "ativa"`, `expect(client._tables.webhook_events[0]).toMatchObject({id: "evt-paid-1", result: "error"})`, `expect(...error_message).toContain("Resend API error")` | ✅ PASS (gap closed) |
| MENT-17 | IF dados do cliente malformados THEN rejeita registro automático + alerta mentor | 0 enrollments created; 1 mentor-only email | `lib/process-checkout-event.test.ts:204-224` — `expect(client._rows).toHaveLength(0)`, `expect(mockSend).toHaveBeenCalledTimes(1)`, recipient `mentor@example.com` | ✅ PASS |
| MENT-18 | IF e-mail já tem inscrição ativa no mesmo plano THEN registra o novo pagamento normalmente **e alerta o mentor sobre a possível duplicidade** | New enrollment created **and** mentor email content reflects the duplicate | "registra normalmente": `lib/process-checkout-event.test.ts:226-261` — `expect(client._rows).toHaveLength(2)`. "alerta sobre duplicidade" (new this cycle): `lib/process-checkout-event.ts:187,196` computes `duplicateAlert` and passes it to `sendMentorNewEnrollmentAlert(activated, {duplicateAlert})`; `emails/templates.tsx:106-113` appends `copy.duplicateWarningLine` to the body when true; **`emails/templates.test.ts:103-117`** proves non-duplicate path `.not.toContain("Possível duplicidade")` and a dedicated test asserts `.toContain("Possível duplicidade: já existe uma inscrição ativa")` when `duplicateAlert: true`. Re-confirmed end-to-end at the `processCheckoutEvent` level by this cycle's own sensor M7 (below): forcing `duplicateAlert: false` at the call site still fails `lib/process-checkout-event.test.ts` | ✅ PASS (gap closed) |
| MENT-19 | Inscrição em exatamente um dos 5 estados; transições só pelos caminhos definidos | 5 valid transitions `true`; all other 20 pairs `false` | `lib/enrollment-state.test.ts:24-54` — exhaustive 25-pair enumeration | ✅ PASS |
| MENT-20 | WHEN inscrição atinge `expiresAt` THEN marca `expirada` + notifica mentor por e-mail | Status → `expirada`; 1 email per expired enrollment | `lib/enrollments.test.ts:184-210`; `app/api/cron/check-expirations/route.test.ts:98-122` | ✅ PASS |
| MENT-21 | Log de cada evento de webhook com event ID, tipo, resultado (sucesso/erro) | `webhook_events` row with `id`, `event_type`, `result` | `lib/webhook-events.test.ts:92-157`; `app/api/webhooks/asaas/route.paid-processing.test.ts:206-209` | ✅ PASS |

**Edge case** (spec.md, unmapped MENT id): "evento de tipo desconhecido... ignorar sem lançar erro" — unknown-fields half already tested (`app/api/webhooks/asaas/route.test.ts:174-190`); the unknown event-*type* half (new this cycle): **`lib/process-checkout-event.test.ts:334-347`** — `processCheckoutEvent(makeEvent({event: "CHECKOUT_REFUNDED", ...}))` → `expect(outcome.type).toBe("ignored")`, `expect(client._rows).toHaveLength(0)`, `expect(mockSend).not.toHaveBeenCalled()`. ✅ Covered (gap closed).

### P1: Página de obrigado

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-22 | WHEN pagamento concluído com sucesso THEN redireciona para `/obrigado` informando que próximos passos chegam por e-mail | Asaas checkout's `callback.successUrl` points at `/obrigado`; page renders expected copy | Page content: `e2e/obrigado.spec.ts:8-21`. Redirect trigger (new this cycle): `lib/asaas.ts:64` sets `successUrl`; **`lib/asaas.test.ts:73-75`** — `expect(sentBody.callback.successUrl).toBe("https://mentoria.example.com/obrigado")` | ✅ PASS (gap closed) |

**Status**: ✅ All 22 ACs covered with precise spec-anchored evidence. Zero confirmed gaps, zero partials. All 5 cycle-1 findings (MENT-04, MENT-05, MENT-11, MENT-13, MENT-18) and all 4 cycle-1 partials (MENT-01, MENT-06, MENT-16, MENT-22) plus the unknown-event-type edge case are closed with direct `file:line` evidence re-derived independently this cycle.

**Note on MENT-11's implementation choice**: the audit record is a structured `console.error` line, not a persisted DB row. Spec AC2 says "SHALL registrar a tentativa para auditoria" without mandating a specific mechanism; the code comment documents this tradeoff explicitly (relies on the serverless platform's runtime log capture rather than a new migration). This is an acceptable interpretation of an outcome the spec leaves open on mechanism — not re-flagged as a gap, since the `SHALL` (record the attempt) is satisfied and tested, but it is weaker than a queryable DB audit trail and worth the team's attention if audit requirements tighten later.

---

## Discrimination Sensor

**Sensor depth**: P0/critical path (payment, webhook idempotency, data integrity) → full tier, ≥5 mutations.

**Isolation**: temporary `git worktree add /tmp/mentoria-sensor-wt2 HEAD` (never `git stash`); `node_modules` symlinked from the real tree for reuse, removed before worktree teardown. Baseline `git status --porcelain` on the real tree captured before sensor work; re-checked byte-for-byte identical after `git worktree remove --force` — confirmed below.

| # | File:line | Description | Killed? |
| - | --------- | ------------ | ------- |
| M1 | `lib/asaas.ts:57` | `chargeTypes: ["DETACHED"]` → `["RECURRENT"]` (cycle-1 survivor, re-attempted) | ✅ **Killed** — `lib/asaas.test.ts` now fails 2/9 (`expect(sentBody.chargeTypes).toEqual(["DETACHED"])`) |
| M2 | `lib/asaas.ts:56` | Dropped `"PIX"` from `billingTypes`, leaving `["CREDIT_CARD"]` (cycle-1 survivor, re-attempted) | ✅ **Killed** — same file fails 2/9 (`expect(sentBody.billingTypes).toEqual(["PIX","CREDIT_CARD"])`) |
| M3 | `app/api/webhooks/asaas/route.ts:82` | Reverted the MENT-13 fix: `if (outcome.type === "rejected")` only (dropped `"conflict"` from the branch, re-masking out-of-order conflicts as `"success"`) | ✅ **Killed** — `route.test.ts` fails 1/9 (`outcome 'conflict' ... grava error com o motivo` — received `"success"` instead of `"error"`) |
| M4 | `app/api/webhooks/asaas/route.ts:37-39` | Removed the `console.error` audit call on rejected auth (reverted the MENT-11 fix) | ✅ **Killed** — `route.test.ts` fails 2/9 (both 401 tests expecting `consoleErrorSpy` to have been called) |
| M5 | `lib/enrollment-state.ts:19` | Added `"expirada->ativa"` as a valid transition | ✅ **Killed** — `enrollment-state.test.ts` fails 1/26 |
| M6 | `lib/webhook-events.ts:30` | Changed `UNIQUE_VIOLATION_CODE` from `"23505"` to `"00000"` (breaks idempotency detection) | ✅ **Killed** — `webhook-events.test.ts` + `route.paid-processing.test.ts` fail 2/8 total (uncaught duplicate-key errors) |
| M7 | `lib/process-checkout-event.ts:196` | Reverted the MENT-18 fix at the call site: `sendMentorNewEnrollmentAlert(activated, { duplicateAlert: false })` hardcoded, ignoring the computed flag | ✅ **Killed** — `process-checkout-event.test.ts` fails 1/10 (`expect(mentorCall?.[0].text).toContain("Possível duplicidade")`) |

**Result**: 7/7 killed, 0 survived. Both cycle-1 survivors (M1, M2) are now caught. The 5 additional mutations (M3-M7) specifically target the fix-cycle's own new branches (MENT-13 conflict logging, MENT-11 audit call, MENT-18 delivery wiring) plus two previously-untouched high-risk invariants (state-machine transition set, webhook idempotency PK-conflict detection) — all are discriminating.

**Isolation verification**: `git status --porcelain` on the real tree before sensor work and after `git worktree remove --force /tmp/mentoria-sensor-wt2` — **identical** (same 8 pre-existing untracked entries: `.agents/`, `.claude/`, `.specs/STATE.md`, and the 5 other `.specs/features/landing-mentoria/*.md` files). The real working tree was never mutated.

---

## Interactive UAT Results

Not performed — out of scope for this re-verification cycle (no UAT request from the orchestrator; automated gate + sensor are sufficient for this backend/payment-critical re-check).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| No features beyond what was asked | ✅ — fix diff (`fdbda9f~1..HEAD`) touches exactly 10 files, all directly tied to the 5 cycle-1 ranked gaps |
| No abstractions for single-use code | ✅ |
| No unnecessary "flexibility" added | ✅ — `duplicateAlert` option on `sendMentorNewEnrollmentAlert` is a minimal optional param, not a generic options bag |
| Only touched files required for task | ✅ |
| Didn't "improve" unrelated code | ✅ |
| Matches existing patterns/style | ✅ — fake-Supabase-client test pattern, `it.each(PLANS)` pattern, and inline "Fix MENT-xx (validation.md, ciclo 1)" comments are applied consistently |
| Tests map to ACs and are non-shallow (spot-check one story) | ✅ — spot-checked "Confirmação automática pós-pagamento": all 12 ACs now assert observable state (DB rows, email content, logged outcome field), not just in-memory return values. The cycle-1 shallow-test finding (MENT-13/MENT-18 asserting only `processCheckoutEvent`'s return value) is resolved — both now have route-level/email-content assertions |
| Spec-anchored outcome check: asserted values match spec outcome | ✅ — see per-AC table above, 22/22 matched |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error) | ✅ — `lib/asaas.ts` now has 1:1 field-level assertions for all 4 payload fields spec.md names (chargeTypes, billingTypes, successUrl, cancelUrl) |
| Every test maps to a spec AC/edge case — no unclaimed tests | ✅ — every new test's comment cites its MENT-ID and "validation.md, ciclo 1" |
| Documented guidelines followed | none — strong defaults applied (unchanged from cycle 1; Test Coverage Matrix in `tasks.md` notes "Gerado sem código/guideline prévios no repo") |

---

## Edge Cases

- [x] Duplo clique no mesmo CTA: `e2e/checkout-cta.spec.ts:30-62`
- [x] Payload com campos extras desconhecidos: `app/api/webhooks/asaas/route.test.ts:174-190`
- [x] Evento de **tipo** desconhecido: `lib/process-checkout-event.test.ts:334-347` (closed this cycle)
- [x] Expiração de inscrição (qualquer plano): `lib/enrollments.test.ts`, `app/api/cron/check-expirations/route.test.ts`

---

## Gate Check

- **Gate command**: `npm run lint && npm run build`, then `npm run test` and `npm run test:e2e` (per `tasks.md` Gate Check Commands, Full tier)
- **Lint**: 0 errors, 3 pre-existing warnings (unchanged from cycle 1 — `_table` unused param in 3 fake-Supabase-client test helpers, cosmetic)
- **Build**: ✅ succeeds (`next build`, Turbopack, all 6 routes compiled)
- **Unit/integration (`npm run test`)**: **100 passed, 0 failed** across 15 test files
- **E2E (`npm run test:e2e`)**: **8 passed, 0 failed** (Chromium)
- **Test count before this fix cycle (cycle 1 baseline)**: 93 unit/integration + 8 e2e = 101
- **Test count after this fix cycle**: 100 unit/integration + 8 e2e = 108
- **Delta**: +7 unit/integration tests (4 new assertions added inline to existing `it`/`it.each` blocks in `lib/asaas.test.ts` and `emails/templates.test.ts` count as strengthened existing tests, not new test cases; the +7 net new test *cases* are: 1 in `emails/templates.test.ts` [duplicateAlert], 4 in `app/api/webhooks/asaas/route.test.ts` [logOutcome-reflects-outcome-type describe block], 1 in `lib/process-checkout-event.test.ts` [unknown event type], 1 in `app/api/webhooks/asaas/route.paid-processing.test.ts` [MENT-16 email-failure path]); e2e test count unchanged (MENT-01 fix added assertions inside the existing "desktop" test, not a new test case)
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None — no gaps found this cycle.

---

## Requirement Traceability Update

| Requirement | Previous Status (cycle 1) | New Status (cycle 2) |
| ----------- | -------------------------- | ---------------------- |
| MENT-01 | ⚠️ Needs Fix (partial evidence) | ✅ Verified |
| MENT-02 | ✅ Verified | ✅ Verified |
| MENT-03 | ✅ Verified | ✅ Verified |
| MENT-04 | ❌ Needs Fix | ✅ Verified |
| MENT-05 | ❌ Needs Fix | ✅ Verified |
| MENT-06 | ⚠️ Needs Fix (partial evidence) | ✅ Verified |
| MENT-07 | ✅ Verified | ✅ Verified |
| MENT-08 | ✅ Verified | ✅ Verified |
| MENT-09 | ✅ Verified | ✅ Verified |
| MENT-10 | ✅ Verified | ✅ Verified |
| MENT-11 | ❌ Needs Fix | ✅ Verified |
| MENT-12 | ✅ Verified | ✅ Verified |
| MENT-13 | ❌ Needs Fix | ✅ Verified |
| MENT-14 | ✅ Verified | ✅ Verified |
| MENT-15 | ✅ Verified | ✅ Verified |
| MENT-16 | ⚠️ Needs Fix (partial evidence) | ✅ Verified |
| MENT-17 | ✅ Verified | ✅ Verified |
| MENT-18 | ❌ Needs Fix | ✅ Verified |
| MENT-19 | ✅ Verified | ✅ Verified |
| MENT-20 | ✅ Verified | ✅ Verified |
| MENT-21 | ✅ Verified | ✅ Verified |
| MENT-22 | ⚠️ Needs Fix (partial evidence) | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready — all 22 P1 ACs verified with precise spec-anchored evidence, full gate green (lint + build + 100 unit/integration + 8 e2e), and the discrimination sensor's full tier (7 mutations: the 2 cycle-1 survivors plus 5 new ones targeting the fix cycle's own branches and other high-risk invariants) kills every mutation with zero survivors.

**Spec-anchored check**: 22/22 ACs matched spec outcome with precise evidence; 0 gaps; 0 partials

**Sensor**: 7/7 mutations killed, 0 survived (both cycle-1 survivors now caught)

**Gate**: 100 passed, 0 failed (unit+integration); 8 passed, 0 failed (e2e); lint 0 errors; build succeeds

**What works**: Everything cycle 1 already confirmed (plan display, checkout initiation incl. 5xx/timeout/double-click, webhook idempotency, CHECKOUT_PAID → enrollment → both emails end-to-end, state machine, expiration cron, thank-you page) **plus** all 5 previously-missing `SHALL` clauses: rejected-webhook-auth audit logging (MENT-11), out-of-order conflict surfaced as a logged error for manual review (MENT-13), duplicate-enrollment alert actually delivered in the mentor's email body (MENT-18), the one-time-charge/Pix-availability contract with Asaas now under regression protection (MENT-04/05), and all the previously-uncited evidence (plan deliverables/target-audience in e2e, checkout callback URLs, the combined email-failure-persists-and-logs path, unknown-event-type handling).

**Issues found**: None.

**Next steps**: Feature is ready to ship for P1/MVP. No further fix→re-verify iterations needed (cycle 2 closes the loop started at cycle 1). P2/P3 stories remain out of scope per `tasks.md`'s header and should get their own Tasks round when picked up.

---
---

## Validation: landing-mentoria - P2 increment (T29-T41) - PASS ✅

**Date**: 2026-10-03
**Spec**: `.specs/features/landing-mentoria/spec.md`
**Diff range**: `d779fc1..HEAD` — 15 commits, 28 files changed, +2774/-10 lines. Confirmed by direct `git log --oneline d779fc1..HEAD` / `git diff --stat d779fc1..HEAD`: `d779fc1` is the last commit of the P1 fix cycle the section above already verified; everything after it is new work for this increment.
**Scope**: Phase 10 (T29-T36: Hero, Sobre o mentor, FAQ, rodapé, política de privacidade) and Phase 11 (T37-T41: lista de inscrições do admin) — requirement IDs MENT-23, MENT-24, MENT-25, MENT-29, MENT-30, MENT-31, MENT-32, MENT-33. Out of scope by design: MENT-26 (analytics, still unimplemented), and Phase 12 / T42-T51 (MENT-27, MENT-34 to MENT-40 — correctly still unimplemented, `[ ]` in tasks.md).
**Verifier**: independent sub-agent (author ≠ verifier), fresh re-derivation — this section only, distinct from the P1 section above which it does not touch.

---

## Task Completion

All T29–T41 marked `✅ Complete` in `tasks.md`, verified by direct read. Every "Nota de implementação" on T37/T38/T39/T41 documents a file touched beyond the task's literal "Where"; each is judged under Code Quality below rather than accepted on the author's framing.

| Task | Status | Notes |
| ---- | ------ | ----- |
| T29 | ✅ Done | `content/about.ts` |
| T30 | ✅ Done | `content/privacy.ts` |
| T31 | ✅ Done | `components/Hero.tsx` |
| T32 | ✅ Done | `components/AboutMentor.tsx` |
| T33 | ✅ Done | `components/FaqSection.tsx` |
| T34 | ✅ Done | `components/Footer.tsx` |
| T35 | ✅ Done | `app/privacidade/page.tsx` |
| T36 | ✅ Done | `app/page.tsx` assembled with all 6 sections |
| T37 | ✅ Done | `app/api/admin/login/route.ts` + `lib/admin-session.ts` (justified addition, see Code Quality) |
| T38 | ✅ Done | `middleware.ts`; `middleware.test.ts` added to `vitest.config.ts` include |
| T39 | ✅ Done | `listEnrollments` in `lib/enrollments.ts` |
| T40 | ✅ Done | `app/admin/login/page.tsx` |
| T41 | ✅ Done | `app/admin/inscricoes/page.tsx` + e2e test infrastructure (see Code Quality) |

---

## Spec-Anchored Acceptance Criteria

Evidence-or-zero applied to all 8 in-scope ACs.

### P2: Hero, rodapé e política de privacidade

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-29 | Hero no topo com título, subtítulo e selo de confiança | `HERO_COPY` fields rendered | `components/Hero.tsx:14-39` renders `HERO_COPY.title`/`subtitle`/`trustBadge`; `e2e/landing-page-full.spec.ts:12-26` — `getByRole("heading", {name: HERO_COPY.title})` visible and positioned (`heroBox.y < plansBox.y`) above `#planos` | ✅ PASS |
| MENT-30 | CTA primário do Hero leva à âncora `#planos` | URL ends in `#planos`, section in viewport | `components/Hero.tsx:23-28` — `href={HERO_COPY.primaryCta.href}` = `"#planos"` (`content/copy.ts:11`); `e2e/landing-page-full.spec.ts:28-39` — `expect(page).toHaveURL(/#planos$/)` + `expect(page.locator("#planos")).toBeInViewport()` | ✅ PASS |
| MENT-31 | CTA secundário do Hero leva à âncora `#sobre` | URL ends in `#sobre`, section in viewport | `components/Hero.tsx:29-34` — `href="#sobre"`; `e2e/landing-page-full.spec.ts:41-52` — `expect(page).toHaveURL(/#sobre$/)` + `expect(page.locator("#sobre")).toBeInViewport()` | ✅ PASS |
| MENT-32 | Rodapé com copyright, LinkedIn, e-mail, reembolso e privacidade | 4 links + copyright rendered | `components/Footer.tsx:14-25` renders `FOOTER_COPY.links` (4 entries: LinkedIn, e-mail `mailto:`, `#planos`, `/privacidade` — `content/copy.ts:56-64`) and copyright with current year; `e2e/landing-page-full.spec.ts:68-71` asserts the privacy link's `href="/privacidade"` | ✅ PASS |
| MENT-33 | Página `/privacidade` cobrindo dados coletados, finalidade, terceiros (Asaas/Resend/Supabase) e direitos do titular | All 4 topics present as visible text | `content/privacy.ts:13-30` — 4 sections naming "Asaas", "Resend" and "Supabase" explicitly (line 24) and the contact-email right-exercise channel (line 28); `app/privacidade/page.tsx:17-26` renders every section; `e2e/privacidade.spec.ts:14-23` asserts heading + each section's heading/body text visible | ✅ PASS |

### P2: Seção "Sobre o mentor"

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-23 | Seção "Sobre o mentor" com foto, bio, cargo, números, credenciais, LinkedIn | All fields from `content/about.ts` rendered | `components/AboutMentor.tsx:29-78` renders `name`, `jobTitle`, `bioLong`, 4 `stats`, `credentials`, `linkedinUrl`; placeholder initials used in place of the (not-yet-provided) photo, an explicitly recorded trade-off (`content.md` §14 item 2, `design.md` P2 Addendum risk table); `e2e/landing-page-full.spec.ts:54-62` asserts the `#sobre` section and the mentor's name heading are visible | ✅ PASS |

### P2: FAQ

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-24 | FAQ cobrindo ao menos: formas de pagamento, prazo de acesso (6 meses), reembolso, diferenças entre planos | All 4 topics present among the 8 Q&As | `content/faq.ts:10-49` — 8 items including "Quais as formas de pagamento?", "Por quanto tempo tenho acesso?" (6 meses), "Como funciona o reembolso?", "Qual a diferença entre os planos?"; `components/FaqSection.tsx:14-23` renders every `FAQ_ITEMS` entry; `e2e/landing-page-full.spec.ts:64-66` asserts the "Perguntas frequentes" heading is visible (content presence is componentwise — no dedicated e2e assertion enumerates all 8 answers) | ✅ PASS (e2e only checks the heading, not each of the 8 answers individually — acceptable per the Test Coverage Matrix, which classifies presentational components as "no dedicated test, covered transitively by the page's e2e") |

### P2: Lista de inscrições para o mentor

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-25 | Rota protegida por senha exibe nome, e-mail, plano, data de pagamento, data de expiração, **ordenados por proximidade da expiração** | 3 seeded rows in ascending-`expiresAt` order; each row's 5 fields visible; unauthenticated access redirects | **Ordering** (unit): `lib/enrollments.test.ts:280-332` — `listEnrollments()` called against 3 rows seeded out of order, asserts `enrollments.map(e => e.id)` equals `["id-perto", "id-meio", "id-longe"]` (ascending `expires_at`). **Ordering** (e2e, real row-order check, not just presence): `e2e/admin-inscricoes.spec.ts:36-44` — `rows.nth(0)` contains "Ana Beatriz Souza" (expires 2026-07-10), `rows.nth(1)` "Bruno Lima" (2026-10-15), `rows.nth(2)` "Carla Mendes" (2027-04-01) — a genuine row-position assertion, not merely that the data renders. **Fields**: `e2e/admin-inscricoes.spec.ts:54-60` asserts name, e-mail, plan name, "10/01/2026" (paid) and "10/07/2026" (expires) all present in one row. **Protection**: `e2e/admin-inscricoes.spec.ts:19-25` — unauthenticated `/admin/inscricoes` redirects to `/admin/login`; `middleware.test.ts:46-64` — unit-level no-cookie/invalid-cookie redirect. **Admin-session cookie never plaintext password**: `lib/admin-session.ts:46-50` derives the cookie via `sha256Hex("mentoria-admin-session-v1:" + adminPassword)`, never returning `adminPassword` itself; `lib/admin-session.test.ts:14-19` — `expect(token).not.toBe(...)` and `.not.toContain(...)` the raw password; `app/api/admin/login/route.test.ts:55-58` — same assertion on the actual `Set-Cookie` value from the real route. **Timing-safe comparison**: `lib/admin-session.ts:30-39` (`timingSafeEqual`, used both for the password check in `route.ts:31` and the cookie check in `isValidAdminSessionToken`) is a fixed-iteration XOR-accumulate comparison, not a short-circuiting `===`; `lib/admin-session.test.ts:57-68` exercises it directly. **`/admin/login` never blocked by middleware**: structural — `middleware.ts:15-17`'s `config.matcher` lists only `/admin/inscricoes` and `/admin/inscricoes/:path*` (Next.js never invokes the `middleware` function for a route outside the matcher, so no internal logic branch can block it by mistake); `middleware.test.ts:80-87` reads the exported `config.matcher` directly and asserts it excludes `/admin/login` and includes `/admin/inscricoes` | ✅ PASS |

**Status**: ✅ All 8 in-scope ACs covered with precise spec-anchored evidence. Zero gaps, zero partials, one minor spec-precision note (MENT-24's e2e only checks the section heading, not all 8 Q&A bodies — acceptable per the project's own Test Coverage Matrix for presentational components).

---

## Discrimination Sensor

**Sensor depth**: auth path (`lib/admin-session.ts`, `app/api/admin/login/route.ts`, `middleware.ts`) is a P0/critical path (payment-adjacent access control) per the tiering rule → full tier, ≥5 mutations applied there; 2 additional lightweight mutations elsewhere in scope.

**Isolation**: `git worktree add <scratchpad>/verify-wt HEAD` (never `git stash`); `node_modules` reused via `cp -Rc` (APFS clonefile, instant, no symlink-out-of-root issue). Baseline `git status --porcelain` on the real tree captured before sensor work (6 untracked entries: `.agents/`, `.claude/`, `.specs/STATE.md`, `context.md`, `validation.md`, `sobre-o-mentor.md`) and `diff`-verified byte-identical after `git worktree remove --force` — confirmed below.

| # | File:line | Description | Killed? |
| - | --------- | ------------ | ------- |
| M1 | `lib/admin-session.ts:63-64` (`isValidAdminSessionToken`) | Bypassed the comparison entirely: `return true` whenever a cookie value is present, regardless of content | ✅ **Killed** — `admin-session.test.ts` fails 1/9 ("retorna false para um token que não corresponde"); `middleware.test.ts` fails 1/4 (invalid-cookie no longer redirects) |
| M2 | `lib/admin-session.ts:49` (`createAdminSessionToken`) | Returns the raw `adminPassword` instead of its SHA-256 hash | ✅ **Killed** — `admin-session.test.ts` fails 1/9 ("nunca retorna a senha em texto puro"); `route.test.ts` fails 1/3 (cookie value equals the plaintext password) |
| M3 | `lib/admin-session.ts:38` (`timingSafeEqual`) | Inverted the result: `return diff !== 0` instead of `diff === 0` | ✅ **Killed** — fails 5 tests total across `admin-session.test.ts` (2), `route.test.ts` (2), `middleware.test.ts` (1) — this helper gates both the password check and the cookie check |
| M4 | `app/api/admin/login/route.ts:31` | Inverted the auth condition: `timingSafeEqual(...)` instead of `!timingSafeEqual(...)` — accepts wrong passwords, rejects the correct one | ✅ **Killed** — `route.test.ts` fails 2/3 (both the "correct password" and "wrong password" cases flip) |
| M5 | `middleware.ts:24` | Inverted the gate: `if (valid)` instead of `if (!valid)` — valid sessions get redirected, invalid ones pass | ✅ **Killed** — `middleware.test.ts` fails 3/4 |
| M6 | `middleware.ts:16` | Widened `config.matcher` to include `/admin/login`, which would let the middleware start gating the login page itself | ✅ **Killed** — `middleware.test.ts` fails 1/4 (the matcher-exclusion test) |
| M7 | `lib/enrollments.ts:178` (`listEnrollments`) | Flipped `ascending: true` to `ascending: false` | ✅ **Killed** — `enrollments.test.ts` fails 1/9 (`listEnrollments` ordering test) |

**Result**: 7/7 killed, 0 survived. The 6 auth-path mutations (M1-M6) exceed the ≥5 full-tier requirement and cover every branch named in the dispatching task's constraints: no-plaintext-cookie (M2), timing-safe comparison (M3), password-check polarity (M4), middleware-gate polarity (M5), and the `/admin/login` matcher exclusion (M6). M7 confirms the MENT-25 ordering claim is backed by a discriminating unit test, not just an e2e happy path.

**Isolation verification**: `git status --porcelain` captured before worktree creation and again after `git worktree remove --force`; `diff` between the two snapshots produced no output — the real working tree was never mutated.

---

## Interactive UAT Results

Not performed — no UAT request from the orchestrator for this increment; the automated gate + spec-anchored check + sensor are sufficient for this backend/admin-auth and presentational-UI increment.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| No features beyond what was asked | ✅ — diff is exactly Phase 10 + Phase 11 scope; no Phase 12 code landed early (verified: `content/testimonials.ts`, `content/conversion.ts`, `components/NavBar.tsx`, etc. do not exist in the diff or on disk) |
| No abstractions for single-use code | ✅ — `lib/admin-session.ts` exports 3 small functions, no generic auth framework |
| No unnecessary "flexibility" added | ✅ |
| Only touched files required for task | ⚠️→✅ — see per-task notes below; every deviation is judged, not just accepted |
| Didn't "improve" unrelated code | ✅ |
| Matches existing patterns/style | ✅ — `content/about.ts`/`content/privacy.ts` follow the `content/plans.ts`/`content/faq.ts` typed-module pattern; `Hero`/`FaqSection`/`Footer` follow the existing presentational-component pattern (no state, props from `content/*`) |
| Would senior engineer approve? | ✅ |
| Tests map to ACs and are non-shallow (spot-check one story) | ✅ — spot-checked "Lista de inscrições": the e2e doesn't just check that 3 rows render, it pins each row's identity to a specific position, which is the actual MENT-25 ordering claim, not a weaker proxy |
| Spec-anchored outcome check: asserted values match spec outcome | ✅ — 8/8, see table above |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error for every route in scope) | ✅ — `POST /api/admin/login` has correct/incorrect/missing-password cases (`route.test.ts`); `middleware.ts` has no-cookie/invalid-cookie/valid-cookie/matcher-exclusion cases; presentational components correctly have no dedicated unit tests per the Test Coverage Matrix, covered transitively by page-level e2e |
| Every test maps to a spec AC/edge case — no unclaimed tests | ✅ |
| Documented guidelines followed | none — strong defaults applied (unchanged from P1; `tasks.md` Test Coverage Matrix is the only project-local testing guideline and was followed) |

**Judgment on each "Nota de implementação" deviation** (tasks.md T37/T38/T39/T41), per coding-principles.md ("no abstractions/flexibility not requested" and "only touched files required for task"):

- **T37 — `lib/admin-session.ts` created beyond the literal "Where" (`app/api/admin/login/route.ts`)**: justified. The cookie must be independently recomputed by the Edge-runtime middleware (T38) without shared storage; sharing one module is the only way both sides derive the identical value, and it correctly uses only Web Crypto (no Node `crypto`), which would not run in the Edge runtime. Not over-engineering — it is the minimum shared contract both T37 and T38 need.
- **T38 — `middleware.test.ts` added to `vitest.config.ts`'s `include`**: justified. Without it, `npm run test` silently never runs this file (same class of gap as T22/T3's `emails/**/*.test.ts` oversight) — a 1-line config fix needed for the task's own gate to mean anything, not scope creep.
- **T39 — fake Supabase client gained `.order()` support**: justified. It is the only way to prove `listEnrollments`'s ordering claim against an in-memory double; extending an existing test helper, not introducing a new one.
- **T41 — `e2e/support/fake-supabase-fetch.cjs`, `playwright.config.ts`'s `webServer.env`/`PORT`, `export const dynamic = "force-dynamic"`**: justified, and verified directly rather than taken on faith — grepped the repo and confirmed `fake-supabase-fetch.cjs` is referenced only from `playwright.config.ts` (via `NODE_OPTIONS`) and documented in `e2e/admin-inscricoes.spec.ts`'s comment, never imported by any application file. `force-dynamic` is independently correct regardless of the test-environment reason given: a per-request-authenticated page with live data must never be statically prerendered, confirmed by `npm run build`'s route table showing `/admin/inscricoes` as `ƒ` (dynamic) rather than `○` (static).

No scope creep found. All infrastructure additions are the minimum needed to make this increment's own gates meaningful, not convenience or future-proofing.

---

## Edge Cases

No new edge cases are listed in spec.md for the P2 stories in scope beyond the ACs themselves (the 3 top-level "Edge Cases" in spec.md are all P1/webhook-related, already covered by the P1 section above).

---

## Gate Check

- **Gate command**: `npm run lint && npm run build`, then `npm run test` (quick/full per task) and `npm run test:e2e` (full), per `tasks.md` Gate Check Commands
- **Lint**: 0 errors, 3 pre-existing warnings (unchanged from P1 — `_table` unused param in 3 fake-Supabase-client test helpers, cosmetic, not introduced by this increment)
- **Build**: ✅ succeeds (`next build`, Turbopack); route table confirms `/admin/inscricoes` is `ƒ` (dynamic, server-rendered per request) and `/admin/login`, `/privacidade` are `○` (static)
- **Unit/integration (`npm run test`)**: **118 passed, 0 failed** across 18 test files, run directly in the real tree
- **E2E (`npm run test:e2e`)**: **16 passed, 0 failed** (Chromium) — run in an isolated git worktree on `PORT=3333` (see Discrimination Sensor isolation note); the pre-existing `next dev -p 3200` process in this environment (not started by this session) was left untouched throughout
- **Test count before this increment (P1 baseline)**: 100 unit/integration + 8 e2e = 108
- **Test count after this increment**: 118 unit/integration + 16 e2e = 134
- **Delta**: +18 unit/integration (`lib/admin-session.test.ts` ×9, `app/api/admin/login/route.test.ts` ×3, `middleware.test.ts` ×4, `lib/enrollments.test.ts` ×2 new `listEnrollments` cases); +8 e2e (`e2e/admin-inscricoes.spec.ts` ×3, `e2e/landing-page-full.spec.ts` ×4, `e2e/privacidade.spec.ts` ×1)
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None — no gaps found in this increment.

---

## Requirement Traceability Update

Updating only the 8 rows in scope for this increment, in `spec.md`'s traceability table. All other rows (including the P1 rows, and MENT-26/27/28/34-40) are left untouched — they are out of scope for this verification.

| Requirement | Previous Status | New Status |
| ----------- | ---------------- | ------------ |
| MENT-23 | Pending | ✅ Verified |
| MENT-24 | Pending | ✅ Verified |
| MENT-25 | Pending | ✅ Verified |
| MENT-29 | Pending | ✅ Verified |
| MENT-30 | Pending | ✅ Verified |
| MENT-31 | Pending | ✅ Verified |
| MENT-32 | Pending | ✅ Verified |
| MENT-33 | Pending | ✅ Verified |

**Pre-existing housekeeping note (not a P2 gap, not fixed here)**: `spec.md`'s traceability table still shows MENT-01 through MENT-22 as "Pending" even though the P1 validation section above this one recorded them all as "✅ Verified" in its own Requirement Traceability Update table — that update was evidently never applied back to `spec.md` itself. Out of scope for this verification (P1 rows are explicitly not to be touched here); flagged for whoever next edits `spec.md`'s traceability table.

---

## Summary

**Overall**: ✅ Ready — all 8 in-scope P2 ACs verified with precise spec-anchored evidence, full gate green (lint + build + 118 unit/integration + 16 e2e), and the discrimination sensor's full tier on the auth path (6 mutations) plus 1 lightweight mutation elsewhere kills every mutation with zero survivors.

**Spec-anchored check**: 8/8 ACs matched spec outcome with precise evidence; 0 gaps; 0 partials

**Sensor**: 7/7 mutations killed, 0 survived (6 on the auth path, exceeding the ≥5 full-tier minimum; 1 lightweight on `listEnrollments` ordering)

**Gate**: 118 passed, 0 failed (unit+integration); 16 passed, 0 failed (e2e); lint 0 errors; build succeeds

**What works**: Hero section with both CTAs correctly anchored; About-mentor, FAQ and Footer sections rendering real content; a standalone LGPD-compliant privacy policy page naming all three data processors; a full admin auth path (login route, Edge-compatible session cookie never storing the plaintext password, timing-safe comparisons, middleware gate that structurally cannot block its own login page) protecting an enrollments list that is genuinely ordered by proximity to expiration, not just populated.

**Issues found**: None blocking. One pre-existing (not introduced by this increment) housekeeping gap noted above: `spec.md`'s traceability table was never updated for the already-verified P1 requirements.

**Next steps**: Increment ready to ship. Phase 12 (T42-T51, MENT-27/34-40) remains correctly unimplemented and out of scope for this verification — pick up as its own Tasks/Execute/Validate round.

---
---

## Validation: landing-mentoria - P2 increment (T42-T51, reforço de conversão) - PASS ✅

**Date**: 2026-10-03
**Spec**: `.specs/features/landing-mentoria/spec.md`
**Diff range**: `1a7c479..HEAD` — 10 commits (`0308b08`..`f3c2ebd`), 12 files changed, +624/-32 lines. Confirmed by direct `git log --oneline 1a7c479..HEAD` / `git diff --stat 1a7c479..HEAD`: `1a7c479` is the last commit the prior section (T29-T41) already verified; everything after it is new work for this increment.
**Scope**: Phase 12 (T42-T51) — requirement IDs MENT-27, MENT-34, MENT-35, MENT-36, MENT-37, MENT-38, MENT-39, MENT-40. Out of scope by design: MENT-26 (analytics, still unimplemented), and everything the two prior sections already verified (P1 MVP; P2 T29-T41).
**Verifier**: independent sub-agent (author ≠ verifier), fresh re-derivation — this section only, distinct from the two sections above which it does not touch.

---

## Task Completion

All T42-T51 marked `✅ Complete` in `tasks.md`, verified by direct read. T50 and T51 each carry a "Nota de implementação" documenting a deviation beyond the task's literal "Where" — both judged under Code Quality below rather than accepted on the author's framing.

| Task | Status | Notes |
| ---- | ------ | ----- |
| T42  | ✅ Done | `content/testimonials.ts` |
| T43  | ✅ Done | `content/conversion.ts` |
| T44  | ✅ Done | `components/NavBar.tsx` |
| T45  | ✅ Done | `components/PainPoints.tsx` |
| T46  | ✅ Done | `components/Qualification.tsx` |
| T47  | ✅ Done | `components/Testimonials.tsx` |
| T48  | ✅ Done | `components/HowItWorks.tsx` |
| T49  | ✅ Done | `components/FinalCta.tsx` |
| T50  | ✅ Done | `components/PlanComparison.tsx` (cohort badge added) |
| T51  | ✅ Done | `app/page.tsx` assembled with full §15 section order |

---

## Spec-Anchored Acceptance Criteria

Evidence-or-zero applied to all 8 in-scope ACs (6 for "Reforço de conversão" + 2 for "Recomendações de ex-alunos").

### P2: Reforço de conversão (adicionada em 2026-10-03, pesquisa de concorrentes)

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-34 (AC4) | Antes da seção de planos, uma seção descrevendo dificuldades comuns de quem busca 1º emprego ou progressão, uma coluna por público-alvo | 2 columns ("Primeiro emprego / estágio", "Progressão de carreira"), rendered above `#planos` | `content/conversion.ts:27-49` (`PAIN_POINTS_COPY`, text matches `content.md:286-303` verbatim); `components/PainPoints.tsx:13-32` renders both columns; `app/page.tsx:33-34` places `<PainPoints />` immediately before `<PlanComparison />`; `e2e/landing-page-conversion.spec.ts:50-68` — `expect(painBox!.y).toBeLessThan(plansBox!.y)` (a genuine position assertion, not just presence) | ✅ PASS |
| MENT-35 (AC5) | Seção "Para quem é" e "Para quem não é", para autoavaliação antes de comprar | 2 lists (fit/not-fit, 4 items each), rendered after `#planos` | `content/conversion.ts:52-68` (`QUALIFICATION_COPY`, text matches `content.md:306-318` verbatim); `components/Qualification.tsx:13-41` renders both lists; `app/page.tsx:34-35` places `<Qualification />` right after `<PlanComparison />`; `e2e/landing-page-conversion.spec.ts:82-99` — `expect(qualificationBox!.y).toBeGreaterThan(plansBox!.y)` | ✅ PASS |
| MENT-36 (AC3) | Menu fixo no topo com links âncora para Planos/Sobre/FAQ, visível durante a rolagem | 3 links to `#planos`/`#sobre`/`#faq`; stays visible after scroll | `content/conversion.ts:12-18` (`NAV_LINKS`); `components/NavBar.tsx:23-44` (`className="fixed inset-x-0 top-0 ..."`); `e2e/landing-page-conversion.spec.ts:23-36` — for each of the 3 `NAV_LINKS`, clicks it and asserts `expect(page).toHaveURL(new RegExp(\`${link.href}$\`))` + `expect(page.locator(link.href)).toBeInViewport()`; `e2e/landing-page-conversion.spec.ts:38-48` — `page.mouse.wheel(0, 2000)` then `expect(navBar).toBeVisible()` | ✅ PASS |
| MENT-37 (AC6) | Próximo aos planos, número real de vagas (30), sem contagem regressiva nem urgência falsa | Static text "Turma com 30 vagas - novo ciclo mensal" inside `#planos`, no countdown/timer code | `content/conversion.ts:72-74` (`COHORT_BADGE_COPY.text`, matches `content.md:322` verbatim); `components/PlanComparison.tsx:106-109` renders it as a static `<p>` inside `<section id="planos">` (no `setInterval`/countdown logic anywhere in the file — confirmed by direct read); `e2e/landing-page-conversion.spec.ts:70-80` — `page.locator("#planos").getByText(COHORT_BADGE_COPY.text, {exact: true})` visible | ✅ PASS |
| MENT-38 (AC1) | Seção "Como funciona" (4 passos) entre a seção de planos e "Sobre o mentor" | `HowItWorks` section rendered with JSX position strictly between `PlanComparison` and `AboutMentor` | `components/HowItWorks.tsx:14-26` renders `HOW_IT_WORKS_STEPS` (4-item `content/copy.ts:21-26`, pre-existing, unchanged by this increment); **structural evidence** — `app/page.tsx:34,36-38` JSX order is `PlanComparison → Qualification → LegalNotice → HowItWorks → AboutMentor`, which Next.js/React renders in document order deterministically, so "between planos and sobre" holds; `e2e/landing-page-conversion.spec.ts:101-107` confirms the section renders (heading visible) but does **not** assert position | ✅ PASS (ordering backed by structural/JSX evidence, not a dynamic position assertion — see note below) |
| MENT-39 (AC2) | Chamada final (CTA) com link para os planos, antes do rodapé | `FinalCta` section, button navigates to `#planos`, positioned before `<Footer />` | `content/copy.ts:28-33` (`FINAL_CTA_COPY`, pre-existing, matches `content.md:196-198` verbatim); `components/FinalCta.tsx:19-22` (`handleClick` sets `window.location.hash = FINAL_CTA_COPY.buttonHref` = `"#planos"`); `app/page.tsx:43,45` — `<FinalCta />` immediately precedes `<Footer />`; `e2e/landing-page-conversion.spec.ts:133-150` — clicks the button, asserts `expect(page).toHaveURL(/#planos$/)` + `expect(page.locator("#planos")).toBeInViewport()` | ✅ PASS |

### P2: Recomendações de ex-alunos ~~Depoimentos de mentorados~~

| # | Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| - | --------- | --------------------- | ------------------------ | ------ |
| MENT-27 (AC1) | Seção de prova social com recomendações reais (texto, nome, cargo), rotulada honestamente como recomendações do LinkedIn sobre a trajetória do mentor como professor/coordenador — **nunca** apresentada como avaliação de quem pagou por esta mentoria | Rendered title = "O que dizem ex-alunos orientados pelo Ramon"; rendered subtitle = "Recomendações públicas no LinkedIn sobre o trabalho dele como professor e coordenador - a mesma dedicação que agora está na mentoria." (exact match to `content.md:171-172`, independently re-derived by this verifier directly from `content.md`, not just cross-checked against the content module) | `content/testimonials.ts:18-22` (`TESTIMONIALS_COPY`) — exact string match verified character-for-character against `content.md:171-172`; `content/testimonials.ts:29-58` (`TESTIMONIALS`, 4 entries with `name`/`role`/`quote`, text matches `content.md:176-186` verbatim including `[...]` trims); `components/Testimonials.tsx:15-19` renders `TESTIMONIALS_COPY.title`/`.subtitle` verbatim, no added claim of being a paid-program review; `e2e/landing-page-conversion.spec.ts:109-121` — heading + each of the 4 names/roles visible | ✅ PASS — rendered title/subtitle text independently confirmed to never claim or imply the recommendations are an evaluation of this specific paid mentoring program; they are presented exactly as the honest-labeling rule requires |
| MENT-40 (AC2) | Ao lado de cada recomendação, um link para a fonte (perfil do LinkedIn do autor ou do mentor) | Each of the 4 cards has a link to `https://www.linkedin.com/in/ramonsl/` (the mentor's LinkedIn, per `content.md:188`'s explicit resolution) | `content/testimonials.ts:27,35,42,49,56` (`MENTOR_LINKEDIN_URL` used for all 4 `linkedinUrl` fields, matches `content.md:188` verbatim); `components/Testimonials.tsx:40-47` renders `<a href={testimonial.linkedinUrl} target="_blank" rel="noopener">`; `e2e/landing-page-conversion.spec.ts:123-130` — `expect(linkedinLinks).toHaveCount(TESTIMONIALS.length)` then for each index, `expect(linkedinLinks.nth(index)).toHaveAttribute("href", testimonial.linkedinUrl)` | ✅ PASS |

**Status**: ✅ All 8 in-scope ACs covered with precise spec-anchored evidence. Zero gaps, zero partials. One noted evidence-quality caveat on MENT-38 (ordering proven structurally via JSX order, not via a dynamic Playwright position assertion like the other 3 ordering claims in this increment have) — not scored as a gap because `app/page.tsx`'s JSX array order deterministically determines DOM/render order in Next.js (same reasoning class the prior increment's report used for `middleware.ts`'s `config.matcher`, M6), but flagged for precision.

---

## Discrimination Sensor

**Sensor depth**: Lightweight tier (presentational-component/DOM-structure path, no payment/auth/data-integrity code in this increment, per `tasks.md`'s Test Coverage Matrix: "Tests: none" for T42-T50, presentational components covered transitively by page e2e) — 3 targeted behavior-level mutations.

**Isolation**: `git worktree add /Users/ramonlummertz/projetos/mentoria-wt-sensor HEAD` (never `git stash`); `node_modules` reused via `cp -Rc` (APFS clonefile). Baseline `git status --porcelain` on the real tree captured before sensor work (`M .specs/features/landing-mentoria/spec.md`; untracked `.agents/`, `.claude/`, `.specs/STATE.md`, `.specs/features/landing-mentoria/context.md`, `.specs/features/landing-mentoria/validation.md`, `sobre-o-mentor.md`) and `git status --porcelain` re-checked identical after `git worktree remove --force` — confirmed below.

| # | File:line | Description | Killed? |
| - | --------- | ------------ | ------- |
| M1 | `components/NavBar.tsx:28` | Hard-coded every nav link's `href` to `"#planos"` regardless of `link.href` (was `href={link.href}`) | ✅ **Killed** — `e2e/landing-page-conversion.spec.ts` fails 1/8 ("fixed nav bar ... navigate to the right anchors": expected URL to match `/#sobre$/`, received `.../#planos`) |
| M2 | `components/FinalCta.tsx:21` | Hard-coded the final CTA's click target to `"#sobre"` (was `window.location.hash = FINAL_CTA_COPY.buttonHref`) | ✅ **Killed** — fails 1/8 ("final cta section ... links to the plans section": expected `/#planos$/`, received `.../#sobre`) |
| M3 | `app/page.tsx:33-34` | Swapped section order: `<PlanComparison />` before `<PainPoints />` (was Dores before Planos, per `content.md` §15's defined order) | ✅ **Killed** — fails 1/8 ("pain points section appears before the plans section": `expect(painBox!.y).toBeLessThan(plansBox!.y)` — received `1456`, expected `< 642`) |

**Result**: 3/3 killed, 0 survived.

**Isolation verification**: `git status --porcelain` captured on the real tree (`/Users/ramonlummertz/projetos/mentoria`) before worktree creation and again after `git worktree remove --force /Users/ramonlummertz/projetos/mentoria-wt-sensor` — identical (same `M spec.md` + 6 untracked entries listed above). The real working tree was never mutated; each mutation was reverted via `git checkout --` inside the scratch worktree before the next was applied, never via `git stash`.

---

## Interactive UAT Results

Not performed — no UAT request from the orchestrator for this batch run; the automated gate + spec-anchored check + sensor are sufficient for this presentational/DOM-structure increment.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| No features beyond what was asked | ✅ — diff is exactly Phase 12 scope (10 commits, 12 files); no MENT-26 analytics code landed |
| No abstractions for single-use code | ✅ — each new component is a flat, single-purpose function; no shared base/HOC introduced |
| No unnecessary "flexibility" added | ✅ |
| Only touched files required for task | ⚠️→✅ — see T51's `#faq` wrapper-div judgment below |
| Didn't "improve" unrelated code | ✅ — `PlanComparison.tsx`'s only change is the cohort badge `<p>` + a wrapping `<div>` around the existing plan-card row (structurally required to add a sibling element inside the same `<section>`), nothing else in that file touched |
| Matches existing patterns/style | ✅ — `content/testimonials.ts`/`content/conversion.ts` follow the existing typed-module pattern (`content/plans.ts`, `content/about.ts`); `NavBar`/`PainPoints`/`Qualification`/`Testimonials`/`HowItWorks`/`FinalCta` follow the existing presentational-component pattern (props from `content/*`, no local component state beyond the two intentional `"use client"` click handlers) |
| Would senior engineer approve? | ✅ |
| Tests map to ACs and are non-shallow (spot-check one story) | ✅ — spot-checked "Reforço de conversão": 3 of its 4 position/visibility claims (MENT-34, MENT-35, MENT-37) use genuine bounding-box or scoped-locator assertions, not just "text exists somewhere on the page" |
| Spec-anchored outcome check: asserted values match spec outcome | ✅ — 8/8, see table above; one ordering claim (MENT-38) rests on structural (JSX-order) rather than dynamic evidence, noted as a precision caveat, not a gap |
| Per-layer Coverage Expectation met (domain 1:1 ACs; routes happy+edge+error for every route in scope) | ✅ — no new routes or domain logic in this increment (pure presentational layer); correctly has no new unit tests, matching the Test Coverage Matrix |
| Every test maps to a spec AC/edge case — no unclaimed tests | ✅ — every test in `e2e/landing-page-conversion.spec.ts` is accounted for by exactly one MENT-ID in the per-AC table above |
| Documented guidelines followed | none — strong defaults applied (unchanged from prior increments; `tasks.md`'s Test Coverage Matrix is the only project-local testing guideline and was followed: "Tests: none" for T42-T50 presentational components, "Tests: e2e" for T51's assembly) |

**Judgment on each "Nota de implementação" deviation** (tasks.md T50/T51), per coding-principles.md:

- **T50 — verification note citing `landing-page.spec.ts`/`checkout-cta.spec.ts` run against the port-3200 `next dev` instead of the task's formal `build` gate**: not a code deviation, a verification-process note. Harmless and independently re-confirmed by this verifier's own full e2e run (all 24 tests, including those two files, pass in the isolated worktree) — no gap.
- **T51 — `<div id="faq">` wrapping `<FaqSection />` added directly in `app/page.tsx`, instead of adding the id inside `FaqSection.tsx` (T33, a file outside this task's own "Where")**: justified. This is the same class of minimal-infrastructure exception already accepted in the two prior validation sections (T22/T23/T26/T28/T37/T38/T39/T41) — a one-line anchor target needed for the NavBar's own `#faq` link to resolve to something, added inside the file this task is already authorized to touch (`app/page.tsx`), not inside a component the task doesn't own. Verified directly: `git diff 1a7c479..HEAD -- components/FaqSection.tsx` is empty — `FaqSection.tsx` itself was not touched.

No scope creep found. Both deviations are the minimum needed to make this increment's own acceptance criteria true, not convenience or future-proofing.

---

## Edge Cases

No new edge cases are listed in spec.md for the P2 "Reforço de conversão" or "Recomendações de ex-alunos" stories beyond their ACs themselves (the 3 top-level "Edge Cases" in spec.md are all P1/webhook-related, already covered by the first validation section above).

---

## Gate Check

- **Gate command**: `npm run lint && npm run build`, then `npm run test` (quick/full per task) and `npm run test:e2e` (full), per `tasks.md` Gate Check Commands
- **Lint**: 0 errors, 3 pre-existing warnings (unchanged from prior increments — `_table` unused param in 3 fake-Supabase-client test helpers, cosmetic, not introduced by this increment)
- **Build**: ✅ succeeds (`next build`, Turbopack); route table unchanged in shape from the prior increment (`/` still `○` static)
- **Unit/integration (`npm run test`)**: **118 passed, 0 failed** across 18 test files, run directly in the real tree (no change from the prior increment's count — expected, this increment adds no unit tests per the Test Coverage Matrix)
- **E2E (`npm run test:e2e`)**: **24 passed, 0 failed** (Chromium) — run in an isolated git worktree (`/Users/ramonlummertz/projetos/mentoria-wt-verify`, `PORT=3001`, removed after); the pre-existing `next dev -p 3200` process in this environment (not started by this session) was left untouched throughout
- **Test count before this increment**: 118 unit/integration + 16 e2e = 134
- **Test count after this increment**: 118 unit/integration + 24 e2e = 142
- **Delta**: +0 unit/integration (expected — no domain/service logic in this increment); +8 e2e, all in the new `e2e/landing-page-conversion.spec.ts`; confirmed via `git diff 1a7c479..HEAD --stat -- e2e/` that all 7 pre-existing e2e spec files (`landing-page.spec.ts`, `landing-page-full.spec.ts`, `checkout-cta.spec.ts`, `obrigado.spec.ts`, `privacidade.spec.ts`, `admin-inscricoes.spec.ts`, `smoke.spec.ts`) have an empty diff (untouched) and all still pass
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

None — no gaps found in this increment.

---

## Requirement Traceability Update

Updating only the 8 rows in scope for this increment, in `spec.md`'s traceability table. All other rows are left untouched — they are out of scope for this verification. (This verifier also applied the same update directly to `spec.md` itself, since everything passed — see note below.)

| Requirement | Previous Status | New Status |
| ----------- | ---------------- | ------------ |
| MENT-27 | Pending | ✅ Verified |
| MENT-34 | Pending | ✅ Verified |
| MENT-35 | Pending | ✅ Verified |
| MENT-36 | Pending | ✅ Verified |
| MENT-37 | Pending | ✅ Verified |
| MENT-38 | Pending | ✅ Verified |
| MENT-39 | Pending | ✅ Verified |
| MENT-40 | Pending | ✅ Verified |

**Note on updating `spec.md` directly**: this verifier applied these 8 rows' status update directly to `spec.md`'s own Requirement Traceability table (matching the "Phase: Implementing, Status: ✅ Verified" convention already used there for MENT-23/24/25/29-33), since all 8 ACs passed with no gaps. The pre-existing housekeeping gap flagged by the prior validation section (P1 rows MENT-01..22 still showing "Pending" in `spec.md` despite being verified) was **not** touched here — still out of scope for this increment's verification, left for whoever next reconciles the P1 rows.

---

## Summary

**Overall**: ✅ Ready — all 8 in-scope ACs (MENT-27, MENT-34 through MENT-40) verified with precise spec-anchored evidence, full gate green (lint + build + 118 unit/integration + 24 e2e), and the discrimination sensor's lightweight tier (3 targeted mutations covering the increment's only genuine behavior — DOM structure/order and click-target wiring) kills every mutation with zero survivors.

**Spec-anchored check**: 8/8 ACs matched spec outcome with precise evidence; 0 gaps; 0 partials; 1 evidence-quality caveat noted (MENT-38's "between planos and sobre" ordering is backed by structural JSX-order evidence rather than a dynamic Playwright position assertion — not scored as a gap, since Next.js renders JSX order deterministically, but worth strengthening if this section's position becomes churn-prone)

**Sensor**: 3/3 mutations killed, 0 survived

**Gate**: 118 passed, 0 failed (unit+integration, unchanged — no new unit tests expected this increment); 24 passed, 0 failed (e2e, +8 new); lint 0 errors; build succeeds

**What works**: Fixed NavBar with 3 working anchor links that stay visible through scroll; a pain-points section genuinely positioned before the plans section (not just present); a real cohort-size badge ("30 vagas") with no countdown/urgency trick, scoped inside the plans section; a qualification ("pra quem é/não é") section genuinely positioned after the plans; "Como funciona" and the final CTA finally rendered (previously-written content.md content, carried since T7, that had never been wired into the page); a testimonials section whose rendered title/subtitle this verifier independently re-checked against `content.md` and confirmed never claims to be a paid-program review — each of the 4 LinkedIn links individually verified by href value, not just count.

**Issues found**: None blocking. One evidence-precision note (MENT-38 ordering proven structurally, not dynamically) carried in the AC table above, not a gap.

**Next steps**: Increment ready to ship. This closes out all P2 stories from `tasks.md`'s current scope except MENT-26 (analytics), which remains correctly unimplemented and out of scope. P3 (MENT-28, formulário de aplicação) remains unplanned, as intended.
