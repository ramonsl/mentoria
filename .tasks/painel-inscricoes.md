# Painel de inscrições - lista, filtros, detalhe e exportação

> Build this with **tlc-implement** (`.claude/skills/tlc-implement`).
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

Hoje `/admin/inscricoes` mostra só nome, e-mail, plano, data de pagamento e data de expiração,
sem status, sem filtro, sem busca e sem forma de abrir uma inscrição pra ver mais detalhes. Pra
achar uma inscrição específica, entender o histórico de um pagamento ou cruzar o cliente com o
painel do Asaas, o mentor (único admin do sistema) precisa consultar o banco diretamente.

A lista passa a mostrar o status de cada inscrição e ganha filtros (status, plano, período) e
busca por nome/e-mail. Cada linha abre uma tela de detalhe com os dados do lead, o plano
contratado, o valor pago e a linha do tempo de eventos de pagamento daquele checkout. A visão
filtrada pode ser exportada em CSV.

21 criteria in 4 slices · 0 one-way doors · 3 open, of which 1 blocks

## Criteria

### Lista de inscrições

1. When the admin opens `/admin/inscricoes` with no filters, the table shows one row per
   enrollment with columns Nome, E-mail, Plano, Status, Pago em, Expira em, ordered by
   `createdAt` descending (most recently created first).
2. Each Plano cell shows the plan's display name from `content/plans.ts` (Direção de Carreira,
   Aceleração de Carreira, Próximo Nível), never the raw slug.
3. Each Status cell shows one of exactly 4 labels: Pendente (`pendente`), Pago (`paga` or
   `ativa`), Expirado (`expirada`), Cancelado (`cancelada`).
4. When no enrollment exists yet, or none matches the currently applied filters, the table area
   shows "Nenhuma inscrição encontrada." instead of an empty table.
5. If the query to load enrollments fails, the page shows "Não foi possível carregar as
   inscrições. Tente novamente." instead of Next's default error screen.

### Filtros e busca

6. Given any combination of the filters below, when the admin applies them, then the table shows
   only enrollments matching every applied filter at once (AND, not OR, across filters).
7. The status filter accepts exactly the 4 labels from criterion 3; selecting Pago matches both
   `paga` and `ativa`.
8. The plan filter accepts exactly the 3 slugs in `content/plans.ts`.
9. The date-range filter (de/até) matches on `paidAt`, inclusive on both ends; an enrollment with
   `paidAt` null (status Pendente) never matches a date-range filter.
10. The search field does a case-insensitive partial match against `customerName` OR
    `customerEmail`.
11. Always, the current filter/search selection is reflected in the page URL, so a filtered view
    can be bookmarked or shared as a link.

### Detalhe da inscrição

12. When the admin opens an enrollment's detail view, it shows `customerName`, `customerEmail`,
    the plan's display name, `amountCents` formatted as BRL currency, the Status label (criterion
    3), `paidAt` and `expiresAt`.
13. When the `:id` in the detail route matches no enrollment, the page responds with Next's
    `notFound()` (404).
14. The detail view shows a timeline of every `webhook_events` row where
    `checkoutId = enrollment.asaasCheckoutId`, ordered by `processedAt` ascending, each line
    showing `eventType` and `processedAt` formatted in pt-BR.
15. When the enrollment has zero matching `webhook_events` rows, the timeline area shows "Nenhum
    evento registrado." instead of being blank.
16. Given a `webhook_events` row for this checkout has a `checkout.customer` id in its stored
    payload, the detail view shows a "Ver cliente no Asaas" link pointing at the Asaas dashboard
    URL for that customer id (see Unresolved #1 for the exact URL template).
17. Given no `webhook_events` row for this checkout carries a `checkout.customer` id, the "Ver
    cliente no Asaas" link is omitted instead of pointing at a broken URL.

### Exportar CSV

18. When the admin clicks "Exportar CSV" on the list page, `GET /admin/inscricoes/export` (with
    the same query params as the current filtered view) downloads a `.csv` file.
19. The CSV has one row per enrollment matching the current filters (same rules as criteria
    6-10), with the same columns and order as the table (criterion 1), using display values
    (plan name, status label), never raw slugs or enum values.
20. The CSV file is UTF-8 with a BOM and uses `;` as the field delimiter, so it opens correctly
    accented in Excel pt-BR without a manual import step.
21. If the export query fails, `GET /admin/inscricoes/export` responds with status 500 and no
    partial file download begins.

## Out of scope

- Telefone/WhatsApp do lead (pedido em US-01 e US-03) - não é capturado em nenhum ponto do fluxo
  hoje (o `customerData` do Asaas só traz nome/e-mail, já documentado em
  `emails/templates.tsx`); exigiria decidir como coletar telefone no checkout antes de poder
  mostrar aqui. Ver Unresolved #2.
- Status "Reembolsado" (pedido em US-01) - o Asaas só expõe 4 eventos de checkout
  (`CHECKOUT_CREATED/PAID/CANCELED/EXPIRED`); reembolso é um webhook de pagamento, de uma
  assinatura diferente, não recebida hoje. Ver Unresolved #3.
- Paginação da lista - não pedida; volume baixo no lançamento (`.specs/.../STATE.md` AD-001).
- Editar ou cancelar uma inscrição a partir do painel - só leitura e exportação foram pedidas.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| screen `/admin/inscricoes` | empty state | 4 |
| screen `/admin/inscricoes` | loading state | n/a - página server-rendered, sem fetch client-side; a transição de rota padrão do Next não muda (comportamento existente do framework) |
| screen `/admin/inscricoes` | error state | 5 |
| screen `/admin/inscricoes` | unauthorised | existing - `middleware.ts` redireciona pra `/admin/login` |
| screen `/admin/inscricoes` | destructive action confirms | n/a - nenhuma ação destrutiva nesta tela |
| screen `/admin/inscricoes/[id]` | empty/not-found state | 13 |
| screen `/admin/inscricoes/[id]` | loading state | n/a - mesma razão da tela de lista |
| screen `/admin/inscricoes/[id]` | unauthorised | existing - `middleware.ts` cobre `/admin/inscricoes/:path*`, incluindo rotas aninhadas |
| screen `/admin/inscricoes/[id]` | destructive action confirms | n/a - nenhuma ação destrutiva nesta tela |
| route `GET /admin/inscricoes/export` | response shape e error codes | 18, 19, 20, 21 |
| route `GET /admin/inscricoes/export` | quem pode chamar | 20 (mesma sessão admin da lista) |
| route `GET /admin/inscricoes/export` | versionamento | n/a - ferramenta interna de admin, único consumidor é o próprio botão na lista |
| route `GET /admin/inscricoes/export` | rate limit | n/a - único admin, mesmo trade-off já aceito pra toda a área `/admin` (design.md "Admin auth") |

## Swept

- validation: 7, 8, 9, 10
- failure modes: 5, 21
- idempotency and retry: n/a - esta task não tem nenhum endpoint de escrita/mutação, só leitura e exportação
- authorization: existing - `middleware.ts` já cobre `/admin/inscricoes/:path*` (lista, detalhe e export)
- concurrency and ordering: n/a - leitura pura; requisições concorrentes não interagem, não há escrita nesta task
- data lifecycle: n/a - nenhum dado novo é armazenado; nada a migrar ou expirar
- external-dependency failure: 5, 21 (falha na consulta ao banco, única dependência externa desta task)
- state transitions: n/a - esta task só exibe status já existentes, nunca transiciona nenhum
- observability: n/a - nenhum log/métrica nova pedida além da própria tela

## Impact

| Front | What changes |
|---|---|
| domain | existing term: ordem padrão de `listEnrollments()` muda de "mais próxima de expirar primeiro" (`expiresAt` ascendente) para "mais recente primeiro" (`createdAt` descendente) - único consumidor hoje é `app/admin/inscricoes/page.tsx` |
| stored data | nada a migrar - esta task é só leitura sobre `enrollments` e `webhook_events`, que já existem com os dados necessários |

## Decided

None - esta task é só leitura sobre tabelas que já existem (`enrollments`, `webhook_events`); nenhuma mudança de schema, nenhum contrato externo novo.

## Surface

| Route | In | Out | Status | Criteria |
|---|---|---|---|---|
| `GET /admin/inscricoes/export` | query params: `status?`, `plano?`, `de?`, `ate?`, `q?` | arquivo `text/csv` (`Nome;E-mail;Plano;Status;Pago em;Expira em`) | `200`, `302` (sem sessão → `/admin/login`), `500` | 18, 19, 20, 21 |

## Sources

- US-01, US-02, US-03, US-05 (mensagem do usuário que originou esta task) - escopo e campos/filtros/ações pedidos
- `content/plans.ts` - slugs e nomes de exibição dos planos usados na coluna/filtro Plano
- `lib/enrollment-state.ts` - os 5 valores de `EnrollmentStatus` usados na coluna/filtro Status
- [Eventos para Checkout](https://docs.asaas.com/docs/checkout-events) - confirma que só existem 4 eventos de checkout (nenhum de reembolso) e que o payload de `CHECKOUT_PAID`/`CHECKOUT_CREATED` inclui `checkout.customer` (string, ex. `cus_000000018936`)

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | blocks | Qual a URL exata do painel do Asaas pra um cliente a partir do id (ex. algo como `asaas.com/customer/show/{id}`)? Não encontrei confirmação na documentação - é rápido de conferir abrindo um cliente qualquer no seu próprio painel Asaas e copiando a URL. | Critério 16 não é implementado até confirmar; toda linha cai no critério 17 (link omitido) enquanto isso. |
| 2 | open | Vale a pena capturar telefone/WhatsApp do lead (pedido em US-01/US-03), o que provavelmente exige mudar o formulário de checkout público, fora do escopo desta task? | Colunas e detalhe ficam sem telefone; nenhum critério depende disso. |
| 3 | open | Vale a pena assinar o webhook de pagamento do Asaas (categoria diferente de checkout) pra detectar reembolso, numa task futura? | O filtro de status oferece só Pendente/Pago/Expirado/Cancelado (critério 7); "Reembolsado" fica de fora. |
