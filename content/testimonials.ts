// Transcrito de .specs/features/landing-mentoria/content.md §7
// (MENT-27, MENT-40).
//
// Não são depoimentos de quem pagou por *esta* mentoria - são recomendações
// públicas do LinkedIn, de ex-alunos que o Ramon orientou como
// professor/coordenador na ULBRA (fonte:
// linkedin.com/in/ramonsl/details/recommendations/, lidas em 2026-10-03).
// Texto transcrito como está no content.md, sem parafrasear (regra inviolável
// da rotulagem honesta: nunca apresentar como avaliação desta mentoria paga).

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
];
