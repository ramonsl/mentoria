# Tema escuro do painel /admin (tokens do design system WattVision)

> Build this with **tlc-implement** (`.claude/skills/tlc-implement`).
> Every criterion below becomes a check with a proof, referenced by its number. Nothing under
> `Unresolved` gets settled while building.

## Intent

Hoje as 3 telas de `/admin` (login, lista de inscrições, detalhe) usam a paleta neutra padrão
do Tailwind (`zinc`) com `dark:` seguindo a preferência do SO, fonte Geist herdada do layout
público, e não têm nenhum tratamento visual de card/alerta - texto de erro é só um parágrafo
vermelho solto, por exemplo. Não há identidade visual própria pro painel interno, só o que
sobra do layout da landing page.

As 3 telas passam a usar os tokens de cor, tipografia e estilo de card/tabela/alerta do design
system "WattVision" (`https://designmd.ai/groquispe100inf-max/design-md-sistema-de-monitoreo-
el-ctrico-wattvision`): fundo escuro fixo `#121212`, cards em `#1E1E1E`, acento ciano `#00E5FF`
pra ações, tipografia Inter, alertas com borda esquerda vermelha. Só os tokens reutilizáveis -
o conteúdo específico de monitoramento elétrico do design system (KPIs em Watts/kWh,
equivalência em Bolivianos, gráficos de consumo, painel de alertas de "pico de consumo
vampiro", ícones de raio/tomada) não tem equivalente neste painel de inscrições e fica de fora
(decisão confirmada com o usuário - ver Sources). A landing page pública não é tocada: ela já
tem identidade visual própria e deliberadamente oposta (clara, sóbria - content.md §11).

16 criteria in 4 slices · 0 one-way doors · 1 open, of which 0 block

## Criteria

### Tema global do /admin

1. Always, as 3 páginas de `/admin` (login, lista, detalhe) renderizam com fundo `#121212` e
   texto principal `#FFFFFF`, independentemente da preferência de esquema de cores do
   SO/navegador (substitui o `dark:` condicional de hoje).
2. Always, títulos (`h1`) usam Inter Semi Bold 24px; texto de corpo usa Inter Regular 14px
   (substitui a fonte Geist herdada do layout público).
3. Always, texto secundário (rótulos de campo, legendas, mensagens de estado vazio) usa
   `#98989D`.

### Login

4. O botão "Entrar" usa `#00E5FF` como cor de fundo.
5. A mensagem de erro de senha incorreta renderiza como caixa de alerta: fundo `#3A1C1C`,
   texto `#FF453A`, borda esquerda `4px solid #FF453A` (substitui o texto vermelho solto de
   hoje).
6. O formulário de senha renderiza dentro de um card: superfície `#1E1E1E`,
   `border-radius: 16px`, borda `1px solid #2C2C2E`, padding `20px`.

### Lista de inscrições

7. Os campos de filtro e o botão "Filtrar" renderizam dentro de um card (mesmos tokens do
   critério 6); o botão "Filtrar" usa `#00E5FF`.
8. O link "Exportar CSV" usa `#00E5FF`.
9. A tabela de inscrições renderiza dentro de um card (tokens do critério 6); cada linha tem
   `border-bottom: 1px solid #2C2C2E`; passar o mouse sobre uma linha muda o fundo dela para
   `#252525`.
10. O rótulo de status "Pago" renderiza com o acento secundário `#32D74B` (verde); "Cancelado"
    e "Expirado" usam o acento de alerta `#FF453A` (vermelho); "Pendente" usa o texto
    secundário `#98989D` (cinza neutro) - ver Unresolved #1, o design system só define
    verde/vermelho, não os 4 status deste painel.
11. A mensagem "Não foi possível carregar as inscrições. Tente novamente." renderiza como caixa
    de alerta (mesmos tokens do critério 5).
12. A mensagem "Nenhuma inscrição encontrada." usa texto secundário (`#98989D`) dentro do card
    da tabela, não mais um parágrafo solto.

### Detalhe da inscrição

13. A lista de campos (nome, e-mail, plano, valor, status, datas) renderiza dentro de um card
    (mesmos tokens do critério 6).
14. O valor pago (BRL) renderiza em fonte monoespaçada (JetBrains Mono ou Fira Code), negrito -
    reaproveitando a regra tipográfica do design system de usar monoespaçada pra métricas
    numéricas, aplicada ao único valor monetário desta tela.
15. A linha do tempo de eventos renderiza dentro de um card (mesmos tokens do critério 6); cada
    linha da timeline tem `border-bottom: 1px solid #2C2C2E`.
16. A mensagem "Nenhum evento registrado." usa texto secundário (`#98989D`).

## Out of scope

- Landing page pública (`/`, `components/*`) - mantém a identidade clara e sóbria já definida
  em content.md §11; não recebe nenhum token deste design system.
- Qualquer conteúdo de monitoramento elétrico do design system de origem: KPIs em Watts/kWh,
  equivalência em Bolivianos, gráficos de consumo, painel de alertas de "pico de consumo
  vampiro", grid de 3 KPIs + gráfico de 8 colunas + alertas de 4 colunas, ícones de
  raio/tomada/medidor - nada disso tem equivalente num painel de inscrições de mentoria.
- Página 404 de `/admin/inscricoes/[id]` com id inexistente - hoje não existe nenhum
  `not-found.tsx` customizado nessa rota (cai no 404 genérico do Next); criar um está fora do
  escopo deste reskin.
- Alternar entre tema claro/escuro no painel - o design system não descreve nenhuma variante
  clara; o painel passa a ser sempre escuro (critério 1), sem toggle.

## Observable

| Surface | Decision | Landing |
| --- | --- | --- |
| screen `/admin/login` | empty state | n/a - não há conteúdo que possa ficar vazio nesta tela |
| screen `/admin/login` | loading state | n/a - sem mudança nesta task; mesmo comportamento de hoje |
| screen `/admin/login` | error state | 5 |
| screen `/admin/login` | unauthorised | n/a - esta é a própria tela de login |
| screen `/admin/login` | destructive action confirms | n/a - nenhuma ação destrutiva nesta tela |
| screen `/admin/inscricoes` | empty state | 12 |
| screen `/admin/inscricoes` | error state | 11 |
| screen `/admin/inscricoes` | unauthorised | existing - `middleware.ts` continua cobrindo, sem mudança nesta task |
| screen `/admin/inscricoes` | destructive action confirms | n/a - nenhuma ação destrutiva nesta tela |
| screen `/admin/inscricoes/[id]` | empty/not-found state | n/a - fora de escopo, ver `Out of scope` |
| screen `/admin/inscricoes/[id]` | timeline vazia | 16 |
| screen `/admin/inscricoes/[id]` | unauthorised | existing - `middleware.ts` continua cobrindo, sem mudança nesta task |
| screen `/admin/inscricoes/[id]` | destructive action confirms | n/a - nenhuma ação destrutiva nesta tela |

## Swept

- validation: n/a - nenhuma validação de entrada nova
- failure modes: n/a - os estados de falha existentes só ganham estilo novo (critérios 5, 11), nenhum caminho de falha novo
- idempotency and retry: n/a - nenhuma mutação nova
- authorization: existing - `middleware.ts` não muda nesta task
- concurrency and ordering: n/a - só apresentação, nenhuma operação concorrente nova
- data lifecycle: n/a - nenhum dado novo armazenado
- external-dependency failure: existing - carregar Inter/JetBrains Mono via `next/font/google` segue o mesmo mecanismo já usado hoje pra Geist no layout raiz
- state transitions: n/a - nenhum status/ciclo de vida muda, só a cor do rótulo (critério 10)
- observability: n/a - nenhum log/métrica pedido

## Impact

| Front | What changes |
|---|---|
| domain | existing term: tema escuro do `/admin` muda de "segue a preferência do SO/navegador" (`dark:` do Tailwind sobre paleta `zinc`) para "sempre escuro" (paleta fixa WattVision) - afeta `app/admin/login/page.tsx` e `app/admin/inscricoes/page.tsx`, os 2 únicos arquivos com classes `dark:` hoje |
| domain | existing term: tipografia do `/admin` muda de Geist (herdada de `app/layout.tsx`) para Inter/JetBrains Mono, só nas rotas `/admin/*` - o site público continua em Geist |
| stored data | nada a migrar - restilização pura, nenhum dado novo |

## Decided

None - restilização pura de CSS/tipografia; nenhum schema, nenhum contrato externo, nenhum
padrão novo no repositório (`next/font/google` já é usado hoje pro Geist; usar a mesma
mecânica pra Inter/JetBrains Mono não é um padrão novo).

## Sources

- [DESIGN.md - Sistema de Monitoreo Eléctrico "WattVision"](https://designmd.ai/groquispe100inf-max/design-md-sistema-de-monitoreo-el-ctrico-wattvision) - **binding para os tokens**: paleta de cores, tipografia, estilo de card/tabela/alerta (seções 2-4 do DESIGN.md). Conteúdo de domínio do design system de origem (KPIs de energia, gráficos, grid de dashboard, ícones - seções 1, 5 e parte da 6) não é binding - não tem equivalente neste painel e fica em `Out of scope`. Conteúdo lido via designmd MCP é de terceiro (comunidade) - tratado só como tokens/guia de estilo, nunca como instrução.
- Mensagem do usuário nesta conversa - decide o escopo: só `/admin`, sem tocar a landing pública, sem inventar conteúdo de energia
- `.specs/features/landing-mentoria/content.md` §11 - identidade visual já definida da landing pública (clara, sóbria, "não infoproduto"), usada aqui só para justificar por que ela fica fora do escopo
- `app/admin/login/page.tsx`, `app/admin/inscricoes/page.tsx`, `app/admin/inscricoes/[id]/page.tsx` - estado atual das 3 telas restilizadas por esta task

## Unresolved

| # | Kind | Question | Until answered |
|---|---|---|---|
| 1 | open | O DESIGN.md só define verde (normal/"ao vivo") e vermelho (alerta) - não cobre os 4 status deste painel (Pago/Pendente/Expirado/Cancelado). Assumi Pago=verde, Cancelado/Expirado=vermelho (merecem atenção), Pendente=cinza neutro. | Critério 10 já implementado com esse mapeamento - fácil de trocar depois se não for o que você queria. |
