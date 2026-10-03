# Landing Page de Mentoria - Conteúdo

**Spec**: `.specs/features/landing-mentoria/spec.md`
**Context**: `.specs/features/landing-mentoria/context.md`
**Fonte da bio**: perfil LinkedIn https://www.linkedin.com/in/ramonsl/ (lido em 2026-10-01, sessão logada do próprio mentor) + formação informada pelo mentor
**Status**: Draft - aguardando revisão do mentor (itens marcados ⚠️ precisam de confirmação)

Este arquivo é a fonte única de **texto e decisões de conteúdo** da landing. Componentes leem daqui (ou de `content/*.ts` gerado a partir daqui na fase Execute) - nada de copy hardcoded espalhado em JSX.

---

## 1. Posicionamento e tom de voz

**Promessa central**: "Quem já contratou, já formou e já coordenou curso te ajuda a chegar à primeira (ou próxima) vaga em tecnologia."

**Público-alvo**:
- Estudantes e recém-formados em cursos de TI (ADS, SI, CC, Eng. Software) buscando o primeiro emprego/estágio.
- Pessoas em transição de carreira para tecnologia.
- Devs júnior que não conseguem passar da triagem.

**Diferencial (o que nenhum "coach de LinkedIn" genérico tem)**:
1. Visão dos dois lados da mesa: lidera times e participa de contratação na indústria (Betha Sistemas) **e** formou/orientou centenas de alunos na universidade.
2. Resultado mensurável com aluno: 80% de empregabilidade entre formandos 2022-2025 no curso que coordenou.
3. Mercado real, não teoria: 20+ anos em TI, de estagiário a Gerente de Tecnologia.

**Tom de voz**:
- Direto, honesto, sem promessa milagrosa. Nunca "garantimos sua vaga".
- Fala como professor que gosta do aluno: próximo, em "você", sem gírias forçadas, sem emoji em excesso (no máximo nos bullets, preferir ícones SVG).
- Frase-guia (tirada do próprio discurso do mentor no LinkedIn): *"O certificado sozinho não garante a vaga. O que pesa de verdade na triagem é o que você consegue mostrar que construiu."*
- Evitar: "transforme sua vida", "método secreto", contagem regressiva falsa, escassez inventada.

---

## 2. Hero (topo da página)

- **Eyebrow**: Mentoria de carreira em tecnologia
- **Título (H1)**: Seu currículo, LinkedIn e GitHub revisados por quem contrata e forma devs há mais de 20 anos.
- **Subtítulo**: Do relatório avulso ao acompanhamento com trilha de estudos e grupo de vagas - escolha o nível de apoio que faz sentido pro seu momento.
- **CTA primário**: Ver planos (âncora para `#planos`)
- **CTA secundário**: Conhecer o mentor (âncora para `#sobre`)
- **Selo de confiança (linha abaixo dos CTAs)**: Pagamento seguro via Asaas · Pix ou cartão parcelado · 7 dias de garantia

> ⚠️ Parcelamento máximo: o Asaas permite configurar; default proposto **até 3x no Avulso (R$129), até 6x no Acompanhamento 3 Meses (R$299) e até 12x no Acompanhamento 6 Meses (R$499)**, acompanhando o valor de cada plano. Confirmar se juros ficam com o comprador ou com o mentor.

---

## 3. Sobre o mentor (MENT-23)

**Âncora**: `#sobre`. Seção de destaque - já que não há depoimentos (P3), esta é a principal prova social do lançamento (decisão do context.md).

### 3.1 Cabeçalho

- **Nome**: Ramon Lummertz
- **Linha de cargo**: Gerente de Tecnologia na Betha Sistemas · Professor na PUCRS
- **Local**: Torres, RS - atendimento 100% online
- **Foto**: ⚠️ usar a mesma foto do LinkedIn (camiseta preta, fundo neutro) em alta resolução - mentor precisa enviar o arquivo original (`public/mentor.jpg`, mínimo 800x800, recorte quadrado).

### 3.2 Bio (versão longa - seção Sobre)

> Comecei como estagiário de TI em 2002. De lá para cá, passei por infraestrutura e segurança da informação, gestão de projetos, produto e liderança de times - hoje sou **Gerente de Tecnologia na Betha Sistemas**, onde lidero squads que constroem software usado por prefeituras de todo o Brasil, incluindo iniciativas de inteligência artificial aplicada à gestão pública.
>
> Em paralelo, passei mais de 14 anos em sala de aula. Na **ULBRA Torres**, coordenei o curso de Análise e Desenvolvimento de Sistemas: assumi em 2019 com 80 alunos e o curso em processo de extinção, e entreguei em 2026 com 288 alunos, **o melhor curso de ADS do Rio Grande do Sul no ENADE 2021** e **80% de empregabilidade** entre os formandos de 2022 a 2025. Orientei 67 projetos de alunos, da definição do problema à entrega. Hoje sigo como professor na Graduação Online da **PUCRS**.
>
> Também coordenei 12 trilhas no **TDC - The Developer's Conference** (Educação, Android, Mobile, Blockchain e TDC4Kids) entre 2016 e 2020, e liderei a implantação do Google Workspace na rede estadual de ensino do RS, que atendeu 2 milhões de alunos.
>
> Ou seja: eu sei o que um recrutador procura, porque estou do lado de quem contrata - e sei como transformar o que você já sabe em algo que ele consiga enxergar, porque passei a carreira ensinando gente a dar esse passo.

### 3.3 Bio curta (cards, meta description, e-mail de confirmação)

> Ramon Lummertz é Gerente de Tecnologia na Betha Sistemas e professor na PUCRS. Com mais de 20 anos em TI e 14 em sala de aula, coordenou o melhor curso de ADS do RS no ENADE 2021 e levou 80% dos formandos ao mercado.

### 3.4 Números de destaque (grid de 4 stat tiles)

| Número | Rótulo |
| ------ | ------ |
| 20+ anos | em tecnologia, de estagiário a Gerente de Tecnologia |
| 80% | de empregabilidade dos formandos que coordenei (2022-2025) |
| 67 | projetos de alunos orientados |
| 12 | trilhas coordenadas no TDC |

### 3.5 Credenciais (lista compacta abaixo da bio)

- Mestre em Ensino de Ciências e Matemática
- Bacharel em Sistemas de Informação
- Pós-graduação em Ciência de Dados e IA (PUCRS), Governança de TI e Tecnologia Educacional
- Certificações: Product Owner, Scrum Master e Advanced Scrum Master (A-CSM)
- Avaliador do INEP/MEC (cursos superiores) ⚠️ confirmar a nomenclatura exata ("BASis/INEP")

### 3.6 Link externo

- Botão "Ver perfil no LinkedIn" → https://www.linkedin.com/in/ramonsl/ (`target="_blank" rel="noopener"`).

---

## 4. Planos (MENT-01..03, reformulado em 2026-10-03 - 3 planos por nível de acompanhamento)

Nomes confirmados como default; mentor pode renomear (conteúdo, não estrutura). Modelo substitui a versão anterior (2 planos por público-alvo, mesma entrega) - agora os 3 planos entregam coisas diferentes, por intensidade/preço.

### Avulso - R$ 129 (pagamento único)

**Para quem**: quer uma revisão pontual, sem compromisso de acompanhamento.

- 100% assíncrono - **sem call**
- Você envia currículo (PDF), link do LinkedIn e link do GitHub num formulário próprio (recebido por e-mail após o pagamento)
- Relatório escrito com os ajustes priorizados nos 3 itens, entregue em até 5 dias úteis após o envio dos materiais

**CTA**: Quero o Avulso

### Acompanhamento 3 Meses - R$ 299 (pagamento único)

**Para quem**: quer acompanhamento próximo por um ciclo curto.

- 3 calls ao vivo (uma por mês, 60 min cada ⚠️) com feedback contínuo
- Revisão de currículo, LinkedIn e GitHub, com preparação para entrevistas (técnica e comportamental)
- Trilha de estudos personalizada no Google Classroom, por 3 meses
- Grupo de WhatsApp com vagas selecionadas, por 3 meses

**CTA**: Quero o Acompanhamento 3 Meses

### Acompanhamento 6 Meses - R$ 499 (pagamento único) - badge "Mais completo"

**Para quem**: quer o acompanhamento mais longo, com mais tempo de trilha e grupo.

- 6 calls ao vivo (uma por mês ⚠️ cadência proposta, confirmar), feedback contínuo
- Revisão de currículo, LinkedIn e GitHub, com preparação para entrevistas
- Trilha de estudos personalizada no Google Classroom, por 6 meses
- Grupo de WhatsApp com vagas selecionadas, por 6 meses

**CTA**: Quero o Acompanhamento 6 Meses

### Aviso legal abaixo dos planos (MENT-07, obrigatório - vale para os 3 planos, inclusive o Avulso)

> Você tem **7 dias corridos** a partir do pagamento para desistir da compra e receber 100% do valor de volta, conforme o art. 49 do Código de Defesa do Consumidor. Isso vale pros 3 planos, inclusive o Avulso. Basta enviar um e-mail para **⚠️[e-mail de contato]** pedindo o reembolso. O estorno é feito pelo mesmo meio de pagamento.

> ⚠️ Decisão de produto pendente: se o relatório (Avulso) ou uma call (Acompanhamento) já tiver acontecido dentro dos 7 dias, o direito de arrependimento continua valendo por lei (compra online) - não é opcional nem configurável. Recomenda-se um texto no FAQ pedindo boa fé no uso desse direito quando o serviço já foi prestado, sem prometer nada além do que a lei garante.

---

## 5. Como funciona (4 passos, genérico pros 3 planos)

1. **Escolha o plano e pague** com Pix ou cartão, em ambiente seguro do Asaas.
2. **Receba o e-mail de boas-vindas**: no Avulso, com o link pra enviar seus materiais; no Acompanhamento (3 ou 6 meses), com o aviso de que o contato pra agendar as calls chega em até 2 dias úteis.
3. **Receba seu retorno**: relatório escrito (Avulso) ou calls + trilha no Classroom + grupo de WhatsApp (Acompanhamento).

> ⚠️ Agendamento das calls (planos de Acompanhamento): default proposto é um link de agenda (Google Agenda - página de agendamento ou Calendly) incluído no e-mail de confirmação. Precisa da URL. Isso não muda o código além de uma variável `BOOKING_URL`.

---

## 6. FAQ (MENT-24)

1. **Quais as formas de pagamento?**
   Pix (aprovação na hora) ou cartão de crédito, à vista ou parcelado. O pagamento é processado pelo Asaas, e nenhum dado de cartão passa pelo nosso site.

2. **Qual a diferença entre os planos?**
   O Avulso é uma revisão pontual e assíncrona (sem call) de currículo, LinkedIn e GitHub, com relatório escrito. Os planos de Acompanhamento (3 ou 6 meses) incluem calls mensais, trilha de estudos personalizada no Classroom e grupo de WhatsApp de vagas - a diferença entre eles é só a duração (3 ou 6 meses de trilha/grupo e calls).

3. **Por quanto tempo tenho acesso?**
   No Avulso, você recebe o relatório e pronto - não há acesso contínuo. Nos planos de Acompanhamento, a trilha no Google Classroom e o grupo de WhatsApp ficam disponíveis por 3 ou 6 meses (conforme o plano) a partir do pagamento.

4. **Como funciona o reembolso?**
   Você tem 7 dias corridos após o pagamento para desistir e receber 100% do valor, sem precisar justificar. Basta mandar um e-mail.

5. **A mentoria garante que eu vou conseguir uma vaga?**
   Não. Ninguém honesto pode garantir isso. O que eu garanto é que você vai sair sabendo exatamente o que ajustar e o que estudar para aumentar suas chances.

6. **Preciso já saber programar?**
   Não. A trilha dos planos de Acompanhamento é montada a partir do seu ponto atual, seja começando do zero ou avançando na carreira. O Avulso não tem trilha - é só a revisão dos materiais.

7. **Como é a call? Fica gravada?**
   É uma chamada de vídeo online (Google Meet). ⚠️ Confirmar se a call é gravada e enviada ao mentorando.

8. **Emite nota fiscal?**
   ⚠️ Mentor é pessoa física sem CNPJ. Resposta proposta: "Emito recibo de pagamento em meu nome (pessoa física)." Confirmar se é viável/desejado ou omitir a pergunta.

---

## 7. Recomendações de ex-alunos (MENT-27, MENT-40)

**Promovida de P3 para P2 em 2026-10-03.** Não são depoimentos de quem pagou por *esta* mentoria (o site acabou de lançar) - são recomendações públicas do LinkedIn, de ex-alunos que o Ramon orientou como professor/coordenador na ULBRA. Rotular com honestidade (⚠️ regra inviolável: nunca apresentar como avaliação desta mentoria paga).

**Título da seção**: O que dizem ex-alunos orientados pelo Ramon
**Subtítulo**: Recomendações públicas no LinkedIn sobre o trabalho dele como professor e coordenador - a mesma dedicação que agora está na mentoria.

4 selecionadas (texto trimado com [...] só onde indicado, sem alterar o sentido original - fonte: `linkedin.com/in/ramonsl/details/recommendations/`, lidas em 2026-10-03):

1. **Otávio Borges** - Senior Software Engineer
   > "Mais do que um professor ou coordenador de curso, Ramon é um mentor que potencializa carreiras e transforma a vida das pessoas [...] Assim como aconteceu com muitos outros colegas de classe, minha primeira oportunidade profissional veio a partir de uma indicação dele."

2. **Erick Rocha Saggiorato** - Software Developer
   > "Tive o prazer de conhecer e ter o Ramon como meu professor e coordenador, ele teve um papel importante na minha estruturação como desenvolvedor, sempre disponível e generoso com quem quer aprender."

3. **Gilto Barcella** - Desenvolvedor FullStack
   > "Durante todo o tempo em que fui aluno, sempre vi alguém que realmente se importava com os estudantes. A porta da coordenação estava aberta para ouvir, orientar e buscar soluções, mesmo quando isso significava assumir problemas que nem eram dele."

4. **Luiz Carlos Costa Rodrigues** - Product Engineer
   > "Sempre demonstrou profundo conhecimento técnico e uma didática clara, tornando conteúdos complexos mais acessíveis [...] Recomendo seu trabalho com total confiança a qualquer instituição de ensino ou projeto em que venha a atuar."

Cada card linka para `https://www.linkedin.com/in/ramonsl/` (MENT-40).

> ⚠️ Recomendação (não bloqueia): avisar os 4 autores antes de publicar - são recomendações públicas, mas escritas pensando no contexto do LinkedIn, não numa página de venda.

---

## 8. CTA final (antes do rodapé)

- **Título**: Pronto para destravar sua próxima vaga?
- **Texto**: Escolha o plano e marque sua call ainda esta semana.
- **Botão**: Ver planos

---

## 9. Página de obrigado (MENT-22)

- **Título**: Pagamento recebido. Bem-vindo(a)!
- **Texto**: Em alguns minutos você recebe um e-mail com os próximos passos e o link para agendar sua call. Se não aparecer, confira a caixa de spam ou promoções.
- **Texto secundário**: Pagou com Pix e a confirmação ainda não chegou? Pode levar alguns minutos. Dúvidas: ⚠️[e-mail de contato].
- **Botão**: Voltar para o início

---

## 10. E-mails transacionais (MENT-14, MENT-15, MENT-20)

Remetente: `Ramon Lummertz <mentoria@⚠️[domínio]>`. Reply-to: e-mail pessoal do mentor.

### 10.1 Confirmação ao mentorando (varia por plano desde 2026-10-03)

- **Assunto**: Sua mentoria está confirmada - próximos passos
- **Corpo comum**: saudação pelo primeiro nome · plano contratado e valor · lembrete dos 7 dias de arrependimento · assinatura com bio curta.
- **Se plano = Avulso**: "Envie seu currículo (PDF), link do LinkedIn e link do GitHub neste formulário: {SUBMISSION_URL} - assim que receber, te devolvo o relatório em até 5 dias úteis." (MENT-41)
- **Se plano = Acompanhamento (3 ou 6 meses)**: link para agendar a call (`BOOKING_URL`) · o que preparar antes da call (currículo em PDF, link do LinkedIn, link do GitHub) · "em até 2 dias úteis ⚠️ você será adicionado à turma do Classroom e ao grupo de WhatsApp - fique de olho no e-mail e no WhatsApp informado".

### 10.2 Alerta de nova inscrição ao mentor (qualquer plano)
- **Assunto**: [Mentoria] Nova inscrição - {plano} - {nome}
- **Corpo**: nome, e-mail, telefone (se o Asaas fornecer), plano, valor, data de pagamento, data de expiração (quando aplicável) · checklist, condicional por plano: Avulso → ☐ aguardar envio dos materiais; Acompanhamento → ☐ agendar as calls ☐ adicionar ao Classroom ☐ adicionar ao WhatsApp.

### 10.3 Alerta de expiração ao mentor (só planos de Acompanhamento - Avulso não expira)
- **Assunto**: [Mentoria] Acesso expirado - remover {nome}
- **Corpo**: nome, e-mail, plano, data de pagamento e expiração, checklist de remoção do Classroom e do WhatsApp.

### 10.4 Alerta de materiais recebidos ao mentor (novo, MENT-44 - só plano Avulso)
- **Assunto**: [Mentoria] Materiais recebidos - Avulso - {nome}
- **Corpo**: nome, e-mail, link do LinkedIn, link do GitHub, link de download do currículo (signed URL, válida por 7 dias) · lembrete do prazo de 5 dias úteis para devolver o relatório.

---

## 11. Identidade visual (para a fase de Design/Execute)

- **Direção**: sóbria e confiável (professor + gestor), não "infoproduto". Muito espaço em branco, uma cor de destaque.
- **Paleta proposta** (tokens CSS):
  - `--color-bg`: #FAFAF7 (off-white) / dark: #0F1115
  - `--color-text`: #16181D / dark: #E8E9EC
  - `--color-muted`: #5B6170 / dark: #9BA1AE
  - `--color-accent`: #1F4FD1 (azul - remete a tecnologia/educação, contraste AA sobre o fundo claro) / dark: #6E93FF
  - `--color-accent-contrast`: #FFFFFF
  - `--color-success`: #1B7F4B (selo de garantia)
- **Tipografia**: títulos em "Space Grotesk" (600/700), corpo em "Inter" (400/500) via `next/font/google`.
- **Ícones**: Lucide (`lucide-react`).
- **Dark mode**: suportado via `prefers-color-scheme`.

---

## 12. SEO e metadados

- **`<title>`**: Mentoria de Carreira em Tecnologia | Ramon Lummertz
- **meta description**: Revisão de currículo, LinkedIn e GitHub, preparação para entrevistas e trilha de estudos com Ramon Lummertz, Gerente de Tecnologia e professor da PUCRS.
- **Open Graph image**: 1200x630 com foto + título do hero (gerar via `next/og` na fase Execute).
- **Idioma**: `pt-BR`.
- **Domínio**: ⚠️ a definir (sugestões: `mentoria.ramonsl.dev`, `ramonlummertz.com.br/mentoria`).

---

## 13. Rodapé

- © {ano} Ramon dos Santos Lummertz · Atendimento online a partir de Torres, RS
- Links: LinkedIn · E-mail de contato · Política de reembolso (âncora para o aviso dos planos) · Política de privacidade ⚠️ (LGPD - página simples obrigatória porque coletamos nome/e-mail; texto-padrão gerado na fase Execute)

---

## 14. Pendências do mentor (checklist antes do Execute)

| # | Item | Default se não houver resposta | Bloqueia? |
| - | ---- | ------------------------------ | --------- |
| 1 | Revisar e aprovar a bio (seção 3) | Usar como está | Não |
| 2 | Enviar foto em alta resolução | Placeholder com iniciais "RL" | Não |
| 3 | E-mail de contato público e e-mail que recebe alertas (`MENTOR_EMAIL`) | ramonsl@gmail.com para ambos | Não |
| 4 | Domínio do site e do remetente de e-mail | Subdomínio Vercel + domínio de teste do Resend | Sim, para produção |
| 5 | Duração da call e prazo do relatório | 60 min / 5 dias úteis | Não |
| 6 | Entrevista: mesma call ou call extra | Mesma call, estendida para 90 min | Não |
| 7 | Link de agendamento (`BOOKING_URL`) | Sem link; e-mail diz "vou entrar em contato em até 2 dias úteis" | Não |
| 8 | Parcelamento máximo e quem paga juros | 3x Avulso / 6x Acompanhamento 3M / 12x Acompanhamento 6M, juros do comprador | Não |
| 9 | Call gravada? Recibo PF? | Não grava; omitir pergunta de nota fiscal | Não |
| 10 | Cadência de calls do Acompanhamento 6 Meses | 6 calls, 1 por mês (mesma cadência do 3 meses) | Não |

---

## 15. Reforço de conversão (MENT-34..39, rodada de 2026-10-03)

Adicionado após pesquisa de concorrentes (`suacarreiratech.com.br`, `viumavaga.com.br/mentoria`). **Nova ordem de seções na página**: Menu fixo (overlay, sempre visível) → Hero → Dores → Planos (com selo de 30 vagas) → Pra quem é / não é → LegalNotice → Como funciona (§5, já existia) → Sobre o mentor (§3) → Recomendações (§7) → FAQ (§6) → CTA final (§8) → Rodapé (§13).

### 15.1 Menu fixo (MENT-36)

Barra fixa no topo, fundo escuro translúcido, aparece ao rolar (ou sempre visível - a critério do Execute). Links: "Planos" (`#planos`), "Sobre" (`#sobre`), "FAQ" (`#faq`). CTA à direita: "Ver planos" (mesmo estilo dos botões já usados).

### 15.2 Seção de dores (MENT-34, reformulado em 2026-10-03 - sem split por público, 3 planos agora são por intensidade)

**Título**: Isso soa familiar?

Uma coluna só, cobrindo as dores comuns de quem busca entrar ou evoluir na carreira tech (não depende de qual plano a pessoa vai escolher):

- Currículo que não passa da triagem automática
- LinkedIn parado, sem clareza do que destacar
- GitHub com projetos de curso, nada que mostre capacidade real
- Insegurança na hora da entrevista, técnica ou comportamental
- Não sabe por onde começar a estudar, ou sente que está estudando sem direção
- Sem rede nem indicação pra saber de vagas melhores

### 15.3 Pra quem é / não é (MENT-35, reformulado - ajuda a escolher entre os 3 planos)

**Título**: Essa mentoria é pra você se...

**É pra você se:**
- Quer um olhar externo e honesto sobre currículo, LinkedIn e GitHub
- Topa aplicar o feedback recebido, não só coletar elogio
- Tem pelo menos algumas horas por semana pra aplicar o que for combinado (nos planos de Acompanhamento)
- Não precisa de call pra começar - o Avulso é 100% assíncrono, se você prefere assim

**Não é pra você se:**
- Busca garantia de vaga (ninguém honesto promete isso - ver FAQ)
- Quer só o certificado, sem aplicar o que for combinado
- Quer um plano de Acompanhamento mas não tem nenhuma disponibilidade nos próximos meses
- Já tem currículo/LinkedIn/GitHub otimizados por um processo parecido recente

### 15.4 Vagas limitadas (MENT-37, só nos planos de Acompanhamento - o Avulso não tem turma)

Selo perto dos planos de Acompanhamento (3 e 6 meses) - não no Avulso, que não tem trilha/turma: **"Turma com 30 vagas - novo ciclo mensal"**. Número real (confirmado pelo mentor em 2026-10-03), sem contagem regressiva nem "últimas vagas!!" - só o fato.

### 15.5 Como funciona e CTA final (MENT-38, MENT-39)

Conteúdo já existia (§5 e §8) desde a primeira leva de conteúdo, mas nunca foi renderizado na página - gap identificado nesta rodada. Nenhum texto novo necessário, só montar os componentes.

---

## 16. Formulário de envio assíncrono - Avulso (MENT-41..46, novo em 2026-10-03)

Página em `/envio/{token}`, acessada pelo link do e-mail de confirmação (§10.1). Sem navegação do site ao redor (página isolada, focada na tarefa).

### 16.1 Formulário (token válido)

- **Título**: Envie seus materiais
- **Texto**: Currículo em PDF, link do LinkedIn e link do GitHub. Assim que eu receber, devolvo seu relatório em até 5 dias úteis.
- **Campos**: Link do LinkedIn (texto, obrigatório) · Link do GitHub (texto, obrigatório) · Currículo (upload, PDF, até 5MB, obrigatório)
- **Botão**: Enviar materiais
- **Mensagem de sucesso**: Recebido! Você vai receber seu relatório em até 5 dias úteis. Qualquer dúvida, responda o e-mail de confirmação.
- **Reenvio**: se o mentorando voltar no mesmo link depois de já ter enviado, o formulário aparece preenchido com o que foi enviado antes, e reenviar substitui o envio anterior.

### 16.2 Token inválido/não encontrado

- **Título**: Link não encontrado
- **Texto**: Esse link não é válido ou já expirou. Se você comprou o plano Avulso e não tem o link, verifique o e-mail de confirmação ou escreva para ⚠️[e-mail de contato].
