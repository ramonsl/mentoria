# Pricing and Coupons Specification

## Problem Statement

Os valores exibidos na landing estão definidos em código e não podem ser alterados pelo admin. Também não existe forma de oferecer descontos controlados. O admin precisa manter preços e criar cupons sem permitir que o navegador determine o valor cobrado.

## Goals

- [ ] Centralizar os preços dos planos em dados persistidos e editáveis no admin.
- [ ] Aplicar cupons válidos ao checkout no servidor e registrar o valor final enviado ao Asaas.
- [ ] Permitir ao admin criar e acompanhar cupons com regras de desconto claras.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Integração com outros meios de pagamento | O checkout hospedado do Asaas continua sendo o único fluxo de cobrança. |
| Desconto acumulado ou mais de um cupom | Mantém o cálculo e a comunicação do preço inequívocos. |
| Exclusão de preços ou cupons | Preserva histórico comercial; cupons podem ser desativados. |
| Sincronização retroativa de inscrições já pagas | O valor existente é histórico e não deve mudar. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Desconto aceito | Percentual ou valor fixo em centavos | Escolha confirmada pelo usuário. | y |
| Escopo de cupom | Todos os planos ou um único plano | Escolha confirmada pelo usuário. | y |
| Validade e limite | Data de expiração opcional e máximo de usos opcional | Escolha confirmada pelo usuário. | y |
| Consumo de uso | Um uso é reservado ao criar o checkout; falha de criação libera a reserva | Impede exceder o limite em requisições concorrentes e não penaliza falha do Asaas. | y |
| Limites de desconto | Percentual inteiro de 1 a 99; valor fixo positivo e menor que o preço do plano | O checkout sempre recebe um valor positivo. | y |
| Preço da landing | A landing usa o preço ativo persistido; valores do catálogo ficam apenas como referência de seed/migração | Evita divergência entre exibição e cobrança. | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Configure plan prices

**User Story**: As an admin, I want to change each plan price in the admin so that the landing and new checkouts use the current commercial price.

**Why P1**: Price changes must not require editing source code or a deployment.

**Acceptance Criteria**:

1. WHEN an authenticated admin saves a positive whole-cent price for a plan THEN the system SHALL persist it and show that price on the landing and in the next checkout.
2. IF an authenticated admin submits a zero, negative, or malformed price THEN the system SHALL reject the change and preserve the existing price.
3. The system SHALL resolve the checkout amount on the server from persisted pricing and SHALL not accept a client-supplied amount.

**Independent Test**: Update a plan price in the admin and verify the landing and Asaas payload use the saved amount.

---

### P1: Create and manage coupons

**User Story**: As an admin, I want to create a coupon with a code, discount and optional restrictions so that I can run controlled offers.

**Why P1**: Discounts are part of the requested commercial workflow.

**Acceptance Criteria**:

1. WHEN an authenticated admin creates a unique uppercase code with a percentage discount from 1 to 99 or a fixed positive-cent discount THEN the system SHALL persist an active coupon.
2. WHEN an authenticated admin assigns a plan, expiration date, or maximum uses to a coupon THEN the system SHALL enforce each assigned restriction.
3. IF an authenticated admin submits a duplicate code, invalid discount, invalid date, or non-positive use limit THEN the system SHALL reject the coupon and preserve existing coupons.
4. WHEN an authenticated admin deactivates a coupon THEN the system SHALL prevent its use in subsequent checkouts and retain its record.

**Independent Test**: Create, scope, expire, limit and deactivate coupons, then observe their validation outcomes.

---

### P1: Redeem a coupon at checkout

**User Story**: As a prospective student, I want to enter a coupon before paying so that a valid offer is reflected in my hosted checkout.

**Why P1**: A coupon has no commercial value unless it changes the amount charged.

**Acceptance Criteria**:

1. WHEN a visitor submits a valid coupon for an eligible plan THEN the system SHALL send the discounted positive amount to Asaas and return its checkout URL.
2. IF a visitor submits an unknown, inactive, expired, exhausted, or ineligible coupon THEN the system SHALL return HTTP 400 with a coupon-specific error and SHALL not create an Asaas checkout.
3. WHEN a coupon with a maximum use count is accepted concurrently THEN the system SHALL reserve no more checkouts than its remaining use count.
4. IF Asaas checkout creation fails after a coupon reservation THEN the system SHALL release that reservation.
5. The system SHALL persist the amount received in the paid Asaas webhook as the enrollment amount, including discounted payments.

**Independent Test**: Submit a valid coupon and assert the Asaas payload amount; submit each invalid condition and assert that no checkout is created.

---

## Edge Cases

- IF a coupon’s fixed discount equals or exceeds the selected plan price THEN the system SHALL reject it for that checkout.
- IF the current time is after a coupon expiration timestamp THEN the system SHALL reject the coupon.
- WHEN no coupon is supplied THEN the system SHALL charge the persisted plan price.
- IF persisted pricing for a requested plan is unavailable THEN the system SHALL not create an Asaas checkout.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| PRC-01 | P1: Configure plan prices | T3 (partial) | In progress |
| PRC-02 | P1: Configure plan prices | T3 (partial) | In progress |
| PRC-03 | P1: Create and manage coupons | T3 (partial) | In progress |
| PRC-04 | P1: Create and manage coupons | T3 (partial) | In progress |
| PRC-05 | P1: Redeem a coupon | T3 (partial) | In progress |
| PRC-06 | P1: Redeem a coupon | T3 (partial) | In progress |
| PRC-07 | P1: Redeem a coupon | Design | Pending |

**Coverage:** 7 total, 0 mapped to tasks, 7 unmapped.

## Success Criteria

- [ ] An admin can change each displayed price without editing code.
- [ ] An admin can create and deactivate constrained coupons.
- [ ] A valid coupon changes only the server-calculated checkout amount.
