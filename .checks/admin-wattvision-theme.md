# Tema escuro do painel /admin (tokens WattVision)

Sources:

- `.tasks/admin-wattvision-theme.md` - os 16 critérios, escopo e a pergunta em aberto (#1, não bloqueia)
- [DESIGN.md WattVision](https://designmd.ai/groquispe100inf-max/design-md-sistema-de-monitoreo-el-ctrico-wattvision) - **binding para os tokens de cor/tipografia/card/alerta** (seções 2-4); conteúdo de domínio (KPIs, gráficos, ícones) não é binding
- `app/admin/login/page.tsx`, `app/admin/inscricoes/page.tsx`, `app/admin/inscricoes/[id]/page.tsx` - as 3 telas restilizadas
- `app/layout.tsx` - padrão existente de `next/font/google` (Geist/Geist Mono) reaproveitado pra Inter/JetBrains Mono

## Out of scope

- Landing page pública e seus componentes - mantém a identidade clara/sóbria de content.md §11
- Conteúdo de monitoramento elétrico do design system de origem (KPIs, gráficos, Bolivianos, ícones de raio) - sem equivalente neste painel
- `not-found.tsx` customizado pra `/admin/inscricoes/[id]` - não existe hoje, criar um está fora de escopo
- Toggle claro/escuro no painel - painel passa a ser sempre escuro, sem variante clara

## Landing

Toca só 3 arquivos de página existentes (`app/admin/login/page.tsx`, `app/admin/inscricoes/page.tsx`,
`app/admin/inscricoes/[id]/page.tsx`), cria um `app/admin/layout.tsx` novo (convenção padrão do
Next App Router pra escopar estilo/fonte a um segmento de rota - não é um padrão novo no repo,
`app/layout.tsx` já é esse mesmo mecanismo na raiz), acrescenta tokens WattVision em
`app/globals.css` dentro de uma classe `.admin-theme` (mesma técnica de custom properties que
`:root` já usa pro tema público - escopada, não global) e um pequeno módulo novo
`lib/admin-theme.ts` só com os tokens de cor e o mapeamento de status - cor (critério 10).
Fontes Inter/JetBrains Mono carregadas via `next/font/google`, mesma mecânica já usada pro
Geist em `app/layout.tsx`.

| One-way door | Literal shape | Alternative rejected |
| --- | --- | --- |
| (nenhuma) | - | - |

- Nada aqui é difícil de reverter: é CSS/tipografia escopada a `/admin` via um layout aninhado
  (convenção padrão do App Router) e uma classe CSS; nenhum schema, contrato externo ou
  dependência nova (a fonte via `next/font/google` já é o mecanismo existente, só outra
  família).

## Checks

### Tema global do /admin · 3 files · ~3k

**C1** - As 3 páginas de `/admin` renderizam com fundo `#121212` e texto principal `#FFFFFF`, independentemente da preferência de cor do SO/navegador
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "fundo e texto principal fixos nas 3 telas"`

**C2** - Títulos (`h1`) usam Inter Semi Bold 24px nas 3 telas; corpo usa Inter Regular 14px (substitui Geist herdado do layout público)
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "tipografia Inter"`

**C3** - Texto secundário (rótulos, legendas, estados vazios) usa `#98989D`
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "texto secundário"`

### Login · 1 file · ~1k

**C4** - O botão "Entrar" tem fundo `#00E5FF`
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "botão Entrar usa o acento"`

**C5** - A mensagem de senha incorreta renderiza como alerta: fundo `#3A1C1C`, texto `#FF453A`, borda esquerda de 4px
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "alerta de senha incorreta"`

**C6** - O formulário de senha renderiza dentro de um card: fundo `#1E1E1E`, `border-radius` 16px, borda `1px solid #2C2C2E` (cor da borda incluída)
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "card do formulário de login"`

### Lista de inscrições · 1 file · ~2k

**C7** - Os filtros e o botão "Filtrar" renderizam dentro de um card (mesmos tokens de C6, cor da borda incluída); "Filtrar" usa `#00E5FF`
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "card de filtros e botão Filtrar"`

**C8** - O link "Exportar CSV" usa `#00E5FF`
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "link Exportar CSV usa o acento"`

**C9** - A tabela renderiza dentro de um card; cada linha tem borda inferior `#2C2C2E`; hover muda o fundo da linha pra `#252525`
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "card da tabela, borda de linha e hover"`

**C10** - Status "Pago" usa `#32D74B`; "Cancelado"/"Expirado" usam `#FF453A`; "Pendente" usa `#98989D`
Proof: `npx vitest run lib/admin-theme.test.ts -t "statusAccent"`

**C11** - A mensagem de erro ao carregar renderiza como alerta (mesma classe `.admin-alert` de C5 - não há como acionar o gatilho real, `loadFilteredEnrollments` falhando, fim a fim neste e2e, já que o fetch às inscrições não depende de nenhum parâmetro da requisição (ver Landing de `.checks/painel-inscricoes.md`); `loadError: true` já é provado em `lib/enrollment-filters.test.ts -t "quando a busca falha"` - gap de nível conhecido, mesmo tratado em `.checks/painel-inscricoes.md` C5)
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "alerta de senha incorreta"`
Proof: `npx vitest run lib/enrollment-filters.test.ts -t "quando a busca falha"`

**C12** - "Nenhuma inscrição encontrada." usa `#98989D` dentro do card
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "mensagem de lista vazia"`

### Detalhe da inscrição · 1 file · ~2k

**C13** - A lista de campos renderiza dentro de um card (mesmos tokens de C6, cor da borda incluída)
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "card dos dados da inscrição"`

**C14** - O valor pago (BRL) renderiza em fonte monoespaçada (JetBrains Mono), negrito
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "valor pago em monoespaçada"`

**C15** - A timeline renderiza dentro de um card (cor da borda do card incluída); cada linha tem borda inferior `#2C2C2E`
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "card da timeline e borda de linha"`

**C16** - "Nenhum evento registrado." usa `#98989D`
Proof: `npx playwright test e2e/admin-theme.spec.ts -g "mensagem de timeline vazia"`

## Swept

- validation: n/a - nenhuma validação de entrada nova
- failure modes: n/a - estados de falha existentes só ganham estilo novo (C5, C11), nenhum caminho novo
- idempotency and retry: n/a - nenhuma mutação nova
- authorization: existing - `middleware.ts` não muda nesta task
- concurrency and ordering: n/a - só apresentação
- data lifecycle: n/a - nenhum dado novo armazenado
- external-dependency failure: existing - `next/font/google` segue o mesmo mecanismo já usado pro Geist
- state transitions: n/a - nenhum status muda, só a cor do rótulo (C10)
- observability: n/a - nenhum log/métrica pedido

## Verification

Verificado por um agente fresco (não o autor), `45e250e..dc5701a`. Achou 5 CONCERN (nenhum
FAIL), ambos corrigidos num commit seguinte:

- **C2**: o teste só checava a família da fonte na página de lista, não tamanho/peso nem as
  outras 2 telas - e o código nem batia com o critério: login usava `text-xl font-semibold`
  (20px/600), lista e detalhe usavam `text-2xl font-bold` (24px/700), nenhum dos dois era
  "Semi Bold 24px". Corrigido pras 3 telas usarem `text-2xl font-semibold` (24px/600) e o
  teste passou a checar tamanho/peso nas 3 + a fonte do corpo (14px/400).
- **C6/C7/C13/C15**: nenhum teste checava a cor da borda do `.admin-card` (`#2C2C2E`), mesmo
  os 4 critérios citando-a explicitamente - mutante sobrevivente confirmado por injeção de
  falha. Corrigido acrescentando a asserção de `border-*-color` nos 4 testes.

Re-rodado depois da correção: 14/14 e2e + os 2 vitest, mais a suíte inteira do projeto
(`npm run test` 158/158, `npx playwright test` 45/46 - a 1 falha é pré-existente e não
relacionada, no `PlanComparison`).

## Handoff

Tudo (tema global + 3 telas) soma ~8k tokens estimados de leitura - bem abaixo de 150k, build
inteira em 1 batch, sem handoff.
