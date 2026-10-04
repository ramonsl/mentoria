# Painel de inscrições - lista, filtros, detalhe e exportação

Sources:

- `.tasks/painel-inscricoes.md` - critérios, escopo e as 3 perguntas em aberto (1 delas bloqueia o critério 16, não implementado nesta build)
- `content/plans.ts` - slugs/nomes de exibição dos planos
- `lib/enrollment-state.ts` - os 5 valores de `EnrollmentStatus`
- [Eventos para Checkout](https://docs.asaas.com/docs/checkout-events) - confirma `checkout.customer` no payload (usado só pra extração, link ainda não renderizado - ver C17)
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` - **binding**: forma exata de `params`/`searchParams` (promises) nesta versão do Next
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/not-found.md` - **binding**: `notFound()` em Server Component e em Route Handler

## Out of scope

- Critério 16 (link "Ver cliente no Asaas") - bloqueado por Unresolved #1 de `painel-inscricoes.md` (URL do painel Asaas não confirmada); só o critério 17 (link omitido) é construído nesta build.
- Telefone/WhatsApp, status "Reembolsado", paginação - já fora de escopo na própria task (ver `Out of scope` de `painel-inscricoes.md`).

## Landing

Toca `lib/enrollments.ts` (nova função `findById`), `lib/webhook-events.ts` (nova função
`listEventsByCheckoutId`), um módulo novo `lib/enrollment-filters.ts` (lógica pura de
filtro/ordenação/rótulos/CSV - mesmo padrão de separação já usado por `lib/enrollment-state.ts`),
reescreve `app/admin/inscricoes/page.tsx` e cria `app/admin/inscricoes/[id]/page.tsx` e
`app/admin/inscricoes/export/route.ts`. Reaproveita a sessão de admin existente
(`middleware.ts`, matcher `/admin/inscricoes/:path*` já cobre as 3 rotas) e `listEnrollments()`
sem alterar sua assinatura.

Bug de infra de teste corrigido en passant: `e2e/support/fake-neon-fetch.cjs` interceptava
`https://fake-neon-e2e.test` (o host do `DATABASE_URL` fake), mas
`@neondatabase/serverless` reescreve o host antes de chamar fetch (troca o primeiro label por
`api.`), então a chamada real é pra `https://api.test` - o fake nunca interceptava nada e todo
teste admin sofria um "fetch failed" genérico pra qualquer query. Corrigido o host do fake;
confirmado comparando contra o Neon real (ver `.env.local`, não versionado) antes e depois da
correção. Também adicionado `app/admin/**/*.test.ts` ao `include` de `vitest.config.ts` (só
`app/api/**` estava coberto, então `app/admin/inscricoes/export/route.test.ts` nunca rodava).

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| (nenhuma) | - | - |

- Nada aqui é difícil de reverter: filtro/ordenação/CSV são todos calculados em memória em cima
  do único `SELECT` que `listEnrollments()` já faz hoje - nenhuma query nova, nenhuma coluna
  nova, nenhum contrato externo novo. `lib/enrollment-filters.ts` é decomposição dentro da
  convenção que o repo já usa (lógica pura separada da persistência, como
  `lib/enrollment-state.ts`), não um padrão novo.

## Checks

### S1 - Lista de inscrições · 3 files · ~4k

Gap de nível conhecido: o projeto não tem nenhum harness de renderização de Server Component
(só Playwright pra e2e e Vitest pra lógica pura) - C5 prova `loadFilteredEnrollments` no nível
mais fundo alcançável; a página renderizar `loadError` corretamente em JSX não é provado
isoladamente, só visualmente.

**C1** - A tela sem filtros mostra Nome/E-mail/Plano/Status/Pago em/Expira em, ordenada por `createdAt` descendente
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "lista ordenada por data de criação"`

**C2** - Cada célula de Plano mostra o nome de exibição do plano, nunca o slug
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "nome, e-mail, plano, data de pagamento e data de expiração"`

**C3** - `statusLabelFor` mapeia os 5 valores reais pra exatamente 4 rótulos (`paga` e `ativa` caem em "Pago")
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "statusLabelFor"`

**C4** - Quando nenhuma inscrição bate com os filtros aplicados, a área da tabela mostra "Nenhuma inscrição encontrada."
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "nenhuma inscrição encontrada"`

**C5** - Se a consulta ao banco falhar, `loadFilteredEnrollments` devolve `loadError: true` (a página usa isso pra mostrar "Não foi possível carregar as inscrições. Tente novamente." em vez da tela de erro padrão do Next)
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "quando a busca falha"`

### S2 - Filtros e busca · 2 files · ~5k

**C6** - `filterEnrollments` combina todos os filtros aplicados com E, não OU
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "combina filtros com E"`

**C7** - O filtro de status aceita os 4 rótulos de C3; "Pago" bate com `paga` e `ativa`
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "filtro de status"`

**C8** - O filtro de plano aceita exatamente os 3 slugs de `content/plans.ts`
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "filtro de plano"`

**C9** - O filtro de período bate em `paidAt`, inclusive nas duas pontas; uma inscrição com `paidAt` nulo nunca bate
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "filtro de período"`

**C10** - A busca faz correspondência parcial, sem diferenciar maiúsculas/minúsculas, em `customerName` OU `customerEmail`
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "busca por nome ou e-mail"`

**C11** - Submeter os filtros reflete a seleção na URL da página; recarregar a URL filtrada sozinha reproduz a mesma lista
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "filtro fica na URL e sobrevive a um reload"`

### S3 - Detalhe da inscrição · 4 files · ~6k

**C12** - A tela de detalhe mostra nome, e-mail, nome do plano, valor em BRL, rótulo de status, pago em e expira em
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "detalhe mostra os dados da inscrição"`

**C13** - Um `:id` que não bate com nenhuma inscrição responde 404
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "id inexistente responde 404"`

**C14** - `listEventsByCheckoutId` devolve as linhas de `webhook_events` daquele checkout (nunca de outro) ordenadas por `processedAt` ascendente
Proof: `npx vitest run lib/webhook-events.test.ts -t "listEventsByCheckoutId"`
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "timeline mostra só os eventos deste checkout, em ordem"`

**C15** - Quando não há nenhum evento pro checkout, a área da timeline mostra "Nenhum evento registrado."
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "timeline vazia"`

**C17** - A tela de detalhe nunca renderiza o link "Ver cliente no Asaas" nesta build (critério 16 não implementado - Unresolved #1)
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "não existe link para o Asaas"`

### S4 - Exportar CSV · 3 files · ~4k

**C18** - `toCsv` gera uma linha por inscrição filtrada, mesmas colunas e ordem da tabela, com valores de exibição (nunca slug/enum cru)
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "toCsv"`

**C19** - O CSV gerado começa com BOM UTF-8 (`﻿`) e usa `;` como delimitador
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "BOM e delimitador"`

**C20** - `GET /admin/inscricoes/export` sem sessão válida redireciona pra `/admin/login`, igual à lista
Proof: `npx playwright test e2e/admin-inscricoes.spec.ts -g "export sem sessão redireciona"`

**C21** - Se a consulta de exportação falhar, `GET /admin/inscricoes/export` responde 500 e nenhum arquivo é devolvido
Proof: `npx vitest run app/admin/inscricoes/export/route.test.ts -t "banco falha"`

## Swept

- validation: C7, C8, C9, C10
- failure modes: C5, C21
- idempotency and retry: n/a - nenhum endpoint de escrita nesta task (só leitura e exportação)
- authorization: existing - `middleware.ts` já cobre `/admin/inscricoes/:path*`; C20 prova isso pra rota nova
- concurrency and ordering: n/a - leitura pura, sem escrita, sem corrida possível
- data lifecycle: n/a - nenhum dado novo armazenado
- external-dependency failure: C5, C21 (mesma dependência - consulta ao banco)
- state transitions: n/a - esta build só exibe status já existentes, nunca transiciona nenhum
- observability: existing melhoria, não pedida por nenhum critério - `loadFilteredEnrollments` loga a causa real no servidor (`console.error`) antes de cair no fallback amigável, em vez de engolir o erro em silêncio

## Handoff

S1-S4 somam ~19k tokens estimados (arquivos tocados: `lib/enrollment-filters.ts(+.test)`,
`lib/enrollments.ts(+.test)`, `lib/webhook-events.ts(+.test)`,
`app/admin/inscricoes/page.tsx`, `app/admin/inscricoes/[id]/page.tsx`,
`app/admin/inscricoes/export/route.ts`, `e2e/admin-inscricoes.spec.ts`,
`e2e/support/fake-neon-fetch.cjs`), bem abaixo dos 150k - build inteira em 1 batch, sem handoff.
