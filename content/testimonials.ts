// Transcrito de .specs/features/landing-mentoria/content.md §7
// (MENT-27, MENT-40), com entradas adicionais extraídas diretamente de
// linkedin.com/in/ramonsl/details/recommendations/ em 2026-10-03.
//
// Não são depoimentos de quem pagou por *esta* mentoria - são recomendações
// públicas do LinkedIn, de ex-alunos que o Ramon orientou como
// professor/coordenador na ULBRA. Texto transcrito como está no LinkedIn,
// sem parafrasear (regra inviolável da rotulagem honesta: nunca apresentar
// como avaliação desta mentoria paga).

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  linkedinUrl: string;
}

export const TESTIMONIALS_COPY = {
  title: "O que dizem ex-alunos orientados pelo Ramon",
  subtitle:
    "Recomendações públicas no LinkedIn sobre o trabalho dele como professor e coordenador - a mesma dedicação que agora está na mentoria.",
};

// Cada recomendação linka para o LinkedIn do mentor (a fonte das
// recomendações), não para o perfil de cada autor - content.md §7 resolve
// explicitamente para o LinkedIn do mentor (MENT-40).
const MENTOR_LINKEDIN_URL = "https://www.linkedin.com/in/ramonsl/";

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Otávio Borges",
    role: "Senior Software Engineer",
    quote:
      "Mais do que um professor ou coordenador de curso, Ramon é um mentor que potencializa carreiras e transforma a vida das pessoas [...] Assim como aconteceu com muitos outros colegas de classe, minha primeira oportunidade profissional veio a partir de uma indicação dele.",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "Erick Rocha Saggiorato",
    role: "Software Developer",
    quote:
      "Tive o prazer de conhecer e ter o Ramon como meu professor e coordenador, ele teve um papel importante na minha estruturação como desenvolvedor, sempre disponível e generoso com quem quer aprender.",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "Gilto Barcella",
    role: "Desenvolvedor FullStack",
    quote:
      "Durante todo o tempo em que fui aluno, sempre vi alguém que realmente se importava com os estudantes. A porta da coordenação estava aberta para ouvir, orientar e buscar soluções, mesmo quando isso significava assumir problemas que nem eram dele.",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "Luiz Carlos Costa Rodrigues",
    role: "Product Engineer",
    quote:
      "Sempre demonstrou profundo conhecimento técnico e uma didática clara, tornando conteúdos complexos mais acessíveis [...] Recomendo seu trabalho com total confiança a qualquer instituição de ensino ou projeto em que venha a atuar.",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "David L. Masschmann",
    role: "Líder de equipe e programador · ex-aluno da ULBRA",
    quote:
      "Ramon tanto como professor quanto coordenador foi um dos melhores que tive o prazer de conhecer, com aulas dinâmicas e divertidas, proficiência nos tópicos, simpatia, parceria e preocupação com os alunos do curso.",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "Washington Felix Fernandes",
    role: "Product Owner (PO)",
    quote:
      "O Ramon é um profissional focado, dedicado e que se importa em trabalhar com foco no desenvolvimento da equipe. Fui aluno e colega de equipe e me impressiona a sua dedicação, a facilidade de encontrar soluções para os desafios do dia a dia e a clareza nas explicações em aula. Ele não apenas entrega resultados, mas faz isso com uma atitude positiva e empatia com os colegas.",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "Anderson Patricio",
    role: "Software Developer",
    quote:
      "Tive o prazer de ter o Ramon como professor e coordenador durante a faculdade, e posso afirmar que é um excelente profissional. Ele demonstra, de forma consistente, empatia, liderança, comprometimento e uma comunicação impecável [...] Recomendo o Ramon com total confiança, é o tipo de profissional que eleva o nível de qualquer instituição ou equipe da qual faz parte.",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "Cicera Ribeiro",
    role: "Desenvolvedora FullStack",
    quote:
      "Ramon é um excelente profissional da área Tech, além de professor e coordenador! Foi meu primeiro professor na Ulbra, me ensinou Java, javascript e C, ele me fez se apaixonar por programação! Além de um grande incentivador da minha carreira e de tantos outros colegas!",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "Eduarda Matos",
    role: "Desenvolvimento Full Stack",
    quote:
      "Ramon é um excelente profissional. Sempre foi um professor e coordenador exemplar, disposto a ajudar ao máximo os alunos do curso. Sou eternamente grata por toda a ajuda prestada durante os anos em que convivemos na ULBRA.",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
  {
    name: "Lucca Boff",
    role: "Estudante de Análise e Desenvolvimento de Sistemas · ULBRA-Torres",
    quote:
      "Excelente profissional e um ser humano ímpar, sempre prestativo e disposto a ajudar todos. Foi, sem dúvidas, o melhor professor e coordenador que tive a oportunidade de acompanhar na Ulbra!",
    linkedinUrl: MENTOR_LINKEDIN_URL,
  },
];
