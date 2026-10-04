# Pricing and Coupons Tasks

**Design**: `.specs/features/pricing-coupons/design.md`
**Status**: In progress

## Test Coverage Matrix

> Generated from `AGENTS.md`, `vitest.config.ts`, `playwright.config.ts`, existing `lib/*.test.ts` and `app/api/**/*.test.ts`. The project requires current Next.js documentation before code changes. Existing test patterns plus strong defaults apply.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Repository | unit | All price and coupon rule branches, including each invalid and boundary case | `lib/*.test.ts` | `npm test` |
| Route | unit | Happy path, invalid input, invalid coupon, Asaas failure | `app/api/**/*.test.ts` | `npm test` |
| Server actions | unit | Auth failure, validation failure and successful mutation | `app/admin/**/*.test.ts` | `npm test` |
| UI | e2e | Admin can manage commercial data; landing submits coupon | `e2e/*.spec.ts` | `npm run test:e2e` |
| Schema/migration | none | Typecheck and production build | `lib/schema.ts`, `supabase/migrations/*.sql` | `npm run build` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Unit-only task | `npm test` |
| Full | E2E or route/action integration task | `npm test && npm run test:e2e` |
| Build | Schema or phase completion | `npm test && npm run lint && npm run build` |

## Execution Plan

### Phase 1: Commercial data foundation

```
T1 → T2 → T3
```

### Phase 2: Secure commercial management

```
T3 → T4 → T5 → T6
```

### Phase 3: Sales integration

```
T3 → T7 → T8 → T9
T3 → T10
T7 → T10
```

## Task Breakdown

### T1: Add commercial database migration

**What**: Create `plan_prices` and `coupons`, seed current prices, and constrain discount values and plan scope.
**Where**: `supabase/migrations/0003_pricing_and_coupons.sql`
**Depends on**: None
**Reuses**: `supabase/migrations/0002_three_tier_plans.sql`
**Requirement**: PRC-01, PRC-03
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [x] Migration creates one seeded price per existing plan slug.
- [x] Coupon code is unique and fixed discounts remain positive.
- [x] Build gate passes.
**Tests**: none
**Gate**: build

### T2: Expose commercial tables in Drizzle

**What**: Add typed `planPrices` and `coupons` table definitions.
**Where**: `lib/schema.ts`
**Depends on**: T1
**Reuses**: Existing `pgTable` and timestamp definitions.
**Requirement**: PRC-01, PRC-03
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] Table definitions match the migration including nullable restrictions and usage counters.
- [ ] Typecheck and build gate pass.
**Tests**: none
**Gate**: build

### T3: Implement commercial repository

**What**: Add price reads/updates and coupon creation, deactivation, reservation and release with server-side validation.
**Where**: `lib/commercial.ts`
**Depends on**: T2
**Reuses**: Dependency-injected `Db` pattern in `lib/enrollments.ts`.
**Requirement**: PRC-01, PRC-02, PRC-03, PRC-04, PRC-05, PRC-06
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] Repository rejects invalid prices, discounts, dates and limits.
- [ ] Reservation validates eligibility and uses an atomic conditional update for maximum uses.
- [ ] Unit tests cover valid, invalid, expired, inactive, exhausted and fixed-discount-too-large cases.
**Tests**: unit
**Gate**: quick

### T4: Add authenticated commercial server actions

**What**: Create admin-only actions to update prices, create coupons and deactivate coupons.
**Where**: `app/admin/(dashboard)/comercial/actions.ts`
**Depends on**: T3
**Reuses**: Signed session from `lib/admin-session.ts` and revalidation APIs.
**Requirement**: PRC-01, PRC-03, PRC-04
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] Every action rejects a missing or invalid admin session.
- [ ] Valid actions mutate only their intended commercial record and revalidate landing/admin pages.
- [ ] Unit tests cover unauthorized, invalid and successful actions.
**Tests**: unit
**Gate**: quick

### T5: Build the commercial admin page

**What**: Render editable prices and a coupon creation/listing interface using the server actions.
**Where**: `app/admin/(dashboard)/comercial/page.tsx`
**Depends on**: T4
**Reuses**: Admin cards, form controls and Genesis tokens in `app/globals.css`.
**Requirement**: PRC-01, PRC-03, PRC-04
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] Each plan has a current editable price in BRL.
- [ ] Admin can enter all coupon restrictions and see active/inactive coupons with reserved use count.
- [ ] E2E test proves a successful price or coupon form submission.
**Tests**: e2e
**Gate**: full

### T6: Add commercial route protection and navigation

**What**: Protect the commercial admin route and add it to the vertical navigation.
**Where**: `middleware.ts`
**Depends on**: T5
**Reuses**: Existing matcher-based admin access control.
**Requirement**: PRC-01, PRC-03
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] Unauthenticated access to `/admin/comercial` redirects to login.
- [ ] Authenticated navigation exposes “Preços e cupons”.
- [ ] Existing middleware tests and an E2E navigation assertion pass.
**Tests**: e2e
**Gate**: full

### T7: Resolve checkout pricing on the server

**What**: Make the checkout route retrieve current prices, validate an optional coupon and reserve/release its use around Asaas creation.
**Where**: `app/api/checkout/route.ts`
**Depends on**: T3
**Reuses**: `AsaasApiError` handling and existing route test style.
**Requirement**: PRC-02, PRC-05, PRC-06
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] Route accepts only a valid plan and optional normalized coupon code.
- [ ] Invalid coupon returns HTTP 400 without calling Asaas.
- [ ] Asaas failure releases a prior reservation and returns HTTP 502.
- [ ] Unit tests cover every specified route outcome.
**Tests**: unit
**Gate**: quick

### T8: Send calculated checkout amount to Asaas

**What**: Change the Asaas checkout service to receive the server-calculated amount and use it in its payload.
**Where**: `lib/asaas.ts`
**Depends on**: T7
**Reuses**: Current typed Asaas error and payload tests.
**Requirement**: PRC-02, PRC-05
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] Payload uses the supplied positive cent amount rather than catalog pricing.
- [ ] Test asserts the exact monetary value sent to Asaas for discounted and regular checkouts.
**Tests**: unit
**Gate**: quick

### T9: Persist the paid amount from the webhook

**What**: Use the Asaas checkout item amount when creating an enrollment.
**Where**: `lib/process-checkout-event.ts`
**Depends on**: T8
**Reuses**: Existing webhook processing and enrollment creation flow.
**Requirement**: PRC-07
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] A paid event with a discounted item stores that exact amount in cents.
- [ ] Missing or malformed item value is rejected without creating an enrollment.
- [ ] Unit tests cover both outcomes.
**Tests**: unit
**Gate**: quick

### T10: Show persisted prices and accept coupon entry on the landing

**What**: Load commercial prices into landing plan cards and submit an optional coupon code with checkout requests.
**Where**: `components/PlanComparison.tsx`
**Depends on**: T3, T7
**Reuses**: Existing card CTA loading/error handling.
**Requirement**: PRC-01, PRC-05
**Tools**: MCP: filesystem. Skill: NONE.
**Done when**:
- [ ] Cards receive and display database-backed formatted price labels.
- [ ] A visitor can supply one coupon code and the request includes it.
- [ ] Invalid-coupon response appears near the card without redirecting.
- [ ] E2E test covers entering a coupon and the failure feedback.
**Tests**: e2e
**Gate**: full

## Phase Execution Map

```
Phase 1: T1 → T2 → T3
Phase 2: T3 → T4 → T5 → T6
Phase 3: T3 → T7 → T8 → T9
         T3 → T10
         T7 → T10
```

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1-T2 | One migration or schema module each | ✅ Granular |
| T3 | One repository module and co-located tests | ✅ Granular |
| T4-T6 | One admin action/page/access concern each | ✅ Granular |
| T7-T9 | One checkout or webhook boundary each | ✅ Granular |
| T10 | One landing component integration | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | Start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T3 | T3 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T3, T7 | T3 → T10; T7 → T10 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1-T2 | Schema/migration | none | none | ✅ OK |
| T3 | Repository | unit | unit | ✅ OK |
| T4 | Server actions | unit | unit | ✅ OK |
| T5-T6 | UI/access | e2e | e2e | ✅ OK |
| T7-T9 | Route/business logic | unit | unit | ✅ OK |
| T10 | UI | e2e | e2e | ✅ OK |
